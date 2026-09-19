# Database Schema

PostgreSQL 16. Skema di bawah adalah logical schema kanonik. Migrasi Drizzle wajib menghasilkan struktur yang setara.

## 1. Konvensi

| Aturan | Detail |
|---|---|
| Primary key | `uuid` (UUIDv7, urut waktu) |
| Kode manusia | Kolom `code` terpisah dengan unique constraint |
| Timestamp | `timestamptz`, UTC. Semua tabel punya `created_at`, `updated_at`. |
| Soft delete | `deleted_at` hanya pada tabel master (users, services, templates). Data transaksi tidak dihapus lunak. |
| Optimistic lock | `version int not null default 1` pada entitas berstatus |
| Enum | PostgreSQL enum sesuai BUSINESS_RULES.md |
| Uang | `bigint` rupiah |
| PII terenkripsi | Kolom `*_enc` (bytea) dengan enkripsi level aplikasi. Kolom `*_hash` untuk pencarian eksak. |
| Audit | Tabel `audit_logs` append-only. Role DB aplikasi tidak punya UPDATE/DELETE. |

## 2. Identity dan Access

```sql
create table users (
  id uuid primary key,
  email citext not null,
  phone_e164 text,
  phone_verified_at timestamptz,
  email_verified_at timestamptz,
  password_hash text not null,              -- argon2id
  full_name text not null,
  status text not null default 'ACTIVE' check (status in ('INVITED','ACTIVE','DISABLED')),
  mfa_secret_enc bytea,
  mfa_enabled_at timestamptz,
  wa_opt_in_at timestamptz,
  last_login_at timestamptz,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create unique index ux_users_email on users (email) where deleted_at is null;
create unique index ux_users_phone on users (phone_e164) where deleted_at is null and phone_e164 is not null;

create table roles (id uuid primary key, code role_code not null unique, name text not null);
create table permissions (id uuid primary key, code text not null unique, description text);
create table role_permissions (role_id uuid references roles, permission_id uuid references permissions,
  primary key (role_id, permission_id));
create table user_roles (user_id uuid references users, role_id uuid references roles,
  granted_by uuid references users, granted_at timestamptz not null default now(),
  primary key (user_id, role_id));

create table sessions (
  id uuid primary key, user_id uuid not null references users,
  token_hash text not null unique, ip inet, user_agent text,
  created_at timestamptz not null default now(), expires_at timestamptz not null, revoked_at timestamptz
);
create index ix_sessions_user on sessions (user_id) where revoked_at is null;

create table client_profiles (user_id uuid primary key references users, company_hint text,
  consent_version text not null, consent_at timestamptz not null);
create table admin_profiles (user_id uuid primary key references users, max_active_projects int);
create table notary_profiles (user_id uuid primary key references users, office_name text not null,
  office_address text, jurisdiction_area text, is_available boolean not null default true,
  max_active_projects int);
```

## 3. Catalog, Order, Payment

```sql
create table services (
  id uuid primary key, code text not null unique, service_type service_type not null,
  name text not null, description text, price_idr bigint not null check (price_idr >= 0),
  workflow_template_code text not null, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create table service_deliverables (id uuid primary key, service_id uuid not null references services,
  document_type document_type not null, label text not null, is_required boolean not null default true);

create table orders (
  id uuid primary key, code text not null unique,            -- ORD-2026-000001
  client_id uuid not null references users, service_id uuid not null references services,
  service_snapshot jsonb not null, amount_idr bigint not null,
  status order_status not null default 'PENDING_PAYMENT',
  expires_at timestamptz not null, invoice_no text unique,
  version int not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index ix_orders_client on orders (client_id, created_at desc);

create table payments (
  id uuid primary key, order_id uuid not null references orders,
  provider text not null, provider_ref text, amount_idr bigint not null,
  status payment_status not null default 'PENDING',
  paid_at timestamptz, expires_at timestamptz, last_provider_event_at timestamptz,
  refund_amount_idr bigint, refund_reason text, refunded_by uuid references users,
  version int not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index ux_payments_provider_ref on payments (provider, provider_ref);
create unique index ux_payments_one_active on payments (order_id) where status in ('PENDING','PROCESSING');

create table payment_events (                               -- inbox webhook
  id uuid primary key, provider text not null, provider_event_id text not null,
  payment_id uuid references payments, raw_body jsonb not null, signature_valid boolean not null,
  received_at timestamptz not null default now(), processed_at timestamptz, process_error text,
  unique (provider, provider_event_id)
);
```

## 4. Workflow Template

```sql
create table workflow_templates (
  id uuid primary key, code text not null, version int not null, service_type service_type not null,
  is_active boolean not null default false, definition jsonb not null,   -- snapshot lengkap
  published_by uuid references users, published_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (code, version)
);
create unique index ux_wf_one_active on workflow_templates (code) where is_active;

create table sla_policies (
  id uuid primary key, code text not null, version int not null, config jsonb not null,
  is_active boolean not null default true, created_at timestamptz not null default now(),
  unique (code, version)
);
create table business_calendars (id uuid primary key, code text not null unique, timezone text not null,
  working_days int[] not null, work_start time not null, work_end time not null);
create table holidays (id uuid primary key, calendar_id uuid not null references business_calendars,
  date date not null, name text not null, unique (calendar_id, date));
create table escalation_rules (id uuid primary key, code text not null unique, condition jsonb not null,
  level escalation_level not null, delay_business_minutes int not null default 0, is_active boolean not null default true);
```

`definition` menyimpan stage template dan task template lengkap (lihat WORKFLOW.md bagian 4). Snapshot JSON menjamin project lama tidak berubah saat template baru dipublikasi.

## 5. Project dan Task

```sql
create sequence project_seq_2026;                           -- satu sequence per tahun, dibuat job tahunan
create table projects (
  id uuid primary key, code text not null unique,            -- PRJ-2026-000001
  order_id uuid not null unique references orders,           -- BR-PROJECT-001
  client_id uuid not null references users,
  service_id uuid not null references services,
  workflow_template_id uuid not null references workflow_templates,
  company_name_proposed text,
  status project_status not null default 'DATA_COLLECTION',
  previous_status project_status,
  blocked_on blocked_on not null default 'CLIENT',
  health health not null default 'ON_TRACK',
  sla_breached boolean not null default false,
  is_escalated boolean not null default false,
  risk_score smallint not null default 0, risk_level risk_level not null default 'LOW',
  project_clock_started_at timestamptz, project_clock_stopped_at timestamptz,
  sla_policy_id uuid references sla_policies,
  hold_reason text, cancel_reason text,
  completed_at timestamptz, delivered_at timestamptz,
  version int not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index ix_projects_status on projects (status, health);
create index ix_projects_client on projects (client_id);

create table project_members (
  id uuid primary key, project_id uuid not null references projects, user_id uuid not null references users,
  member_role text not null check (member_role in ('PRIMARY_ADMIN','SECONDARY_ADMIN','NOTARY','CLIENT')),
  assignment_status text not null default 'ACTIVE'
    check (assignment_status in ('PROPOSED','PENDING_ACCEPTANCE','ACTIVE','DECLINED','ENDED')),
  assigned_by uuid references users, started_at timestamptz not null default now(),
  ended_at timestamptz, end_reason text
);
create unique index ux_one_primary_admin on project_members (project_id)
  where member_role = 'PRIMARY_ADMIN' and ended_at is null;
create unique index ux_one_notary on project_members (project_id)
  where member_role = 'NOTARY' and ended_at is null and assignment_status in ('PENDING_ACCEPTANCE','ACTIVE');
create index ix_members_user on project_members (user_id) where ended_at is null;

create table company_data (
  id uuid primary key, project_id uuid not null unique references projects,
  schema_code text not null,                                 -- company_data_pt.v1
  data_enc bytea not null,                                   -- JSON terenkripsi
  submitted_at timestamptz, validated_at timestamptz, validated_by uuid references users,
  version int not null default 1, updated_at timestamptz not null default now()
);

create table project_stages (
  id uuid primary key, project_id uuid not null references projects,
  stage_code text not null, seq smallint not null, status stage_status not null default 'PENDING',
  started_at timestamptz, completed_at timestamptz, unique (project_id, stage_code)
);

create table tasks (
  id uuid primary key, code text not null unique,            -- TSK-000000123
  project_id uuid not null references projects, stage_id uuid not null references project_stages,
  template_task_code text not null, title text not null, client_label text,
  owner_role task_owner_role not null, owner_user_id uuid references users,
  status task_status not null default 'BLOCKED', priority priority not null default 'P3_NORMAL',
  completion_mode completion_mode not null, required_document_type document_type,
  required_slot_key text, completion_event text,
  sla_policy_id uuid references sla_policies, target_business_minutes int,
  opened_at timestamptz, started_at timestamptz, due_at timestamptz, completed_at timestamptz,
  health health not null default 'ON_TRACK', last_threshold_crossed text, sla_breached boolean not null default false,
  revision_count smallint not null default 0, skip_reason text,
  completed_by uuid references users, completion_note text,
  parent_task_id uuid references tasks,                      -- follow-up task
  version int not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index ix_tasks_owner_open on tasks (owner_user_id, status) where status in ('OPEN','IN_PROGRESS','NEEDS_REVIEW');
create index ix_tasks_project on tasks (project_id, status);
create index ix_tasks_due on tasks (due_at) where status in ('OPEN','IN_PROGRESS');

create table task_dependencies (task_id uuid references tasks, depends_on_task_id uuid references tasks,
  primary key (task_id, depends_on_task_id), check (task_id <> depends_on_task_id));

create table sla_pauses (
  id uuid primary key, clock_type text not null check (clock_type in ('PROJECT','TASK')),
  project_id uuid not null references projects, task_id uuid references tasks,
  reason sla_pause_reason not null, note text, created_by uuid references users,
  started_at timestamptz not null, expected_end_at timestamptz, ended_at timestamptz
);
create unique index ux_open_pause on sla_pauses (project_id, coalesce(task_id, '00000000-0000-0000-0000-000000000000'::uuid), reason)
  where ended_at is null;

create table signing_appointments (
  id uuid primary key, project_id uuid not null references projects, scheduled_at timestamptz not null,
  location text, status text not null check (status in ('SCHEDULED','COMPLETED','RESCHEDULED','CANCELLED')),
  created_by uuid not null references users, completed_at timestamptz
);
```

## 6. Documents

```sql
create table documents (
  id uuid primary key, project_id uuid references projects,   -- null saat PENDING_RESOLUTION
  document_type document_type not null default 'UNKNOWN', slot_key text,
  status document_status not null default 'UPLOADING',
  content_review_status content_review_status not null default 'NOT_REQUIRED',
  source document_source not null, uploaded_by uuid not null references users, on_behalf_of uuid references users,
  classification_method classification_method, classification_confidence numeric(4,3),
  resolution_method project_resolution_method, review_reasons text[] not null default '{}',
  workflow_stage_code text, task_id uuid references tasks, is_final boolean not null default false,
  current_version_id uuid, reviewed_by uuid references users, reviewed_at timestamptz, reject_reason text,
  source_message_id uuid,
  version int not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index ix_documents_project on documents (project_id, document_type);
create index ix_documents_review on documents (status) where status = 'NEEDS_REVIEW';

create table document_versions (
  id uuid primary key, document_id uuid not null references documents, version_no int not null,
  storage_key text not null unique, mime_type text not null, file_size bigint not null,
  sha256 char(64) not null, page_count int, original_filename text,
  scan_result text check (scan_result in ('PENDING','CLEAN','INFECTED','ERROR')),
  status document_status not null, uploaded_by uuid not null references users,
  created_at timestamptz not null default now(), unique (document_id, version_no)
);
create index ix_docver_hash on document_versions (sha256);

create table document_deliveries (
  id uuid primary key, project_id uuid not null references projects, channel message_channel not null,
  recipient_user_id uuid not null references users, status delivery_status not null default 'QUEUED',
  attempt smallint not null default 0, provider_message_id text, last_error text,
  sent_at timestamptz, delivered_at timestamptz, read_at timestamptz,
  created_at timestamptz not null default now()
);
```

## 7. Messaging dan Notification

```sql
create table conversations (
  id uuid primary key, project_id uuid references projects, type conversation_type not null,
  created_at timestamptz not null default now()
);
create unique index ux_conv_project_type on conversations (project_id, type) where project_id is not null;

create table messages (
  id uuid primary key, conversation_id uuid not null references conversations,
  sender_user_id uuid references users,                      -- null untuk SYSTEM
  sender_role role_code, channel message_channel not null, type message_type not null,
  body text, note_visibility note_visibility,                -- hanya PROJECT_INTERNAL
  provider text, provider_message_id text,
  relay_of_message_id uuid references messages, related_task_id uuid references tasks,
  detected_intent text, created_at timestamptz not null default now()
);
create unique index ux_msg_provider on messages (provider, provider_message_id) where provider_message_id is not null;
create index ix_msg_conv on messages (conversation_id, created_at);

create table message_attachments (message_id uuid references messages, document_id uuid references documents,
  primary key (message_id, document_id));

create table wa_inbound_events (
  id uuid primary key, provider text not null, provider_event_id text not null,
  from_e164 text, raw_body jsonb not null, received_at timestamptz not null default now(),
  processed_at timestamptz, process_error text, unique (provider, provider_event_id)
);
create table wa_outbound_context (provider_message_id text primary key, project_id uuid not null references projects,
  recipient_user_id uuid not null references users, created_at timestamptz not null default now());
create table unmatched_messages (id uuid primary key, wa_event_id uuid not null references wa_inbound_events,
  reason text not null, resolved_project_id uuid references projects, resolved_by uuid references users, resolved_at timestamptz);

create table notification_templates (id uuid primary key, type notification_type not null, channel message_channel not null,
  locale text not null default 'id', version int not null, body text not null, provider_template_code text,
  is_active boolean not null default true, unique (type, channel, locale, version));

create table notifications (
  id uuid primary key, recipient_user_id uuid not null references users, type notification_type not null,
  project_id uuid references projects, entity_type text, entity_id uuid, title text not null, body text not null,
  action_url text, dedup_key text, read_at timestamptz, created_at timestamptz not null default now()
);
create unique index ux_notif_dedup on notifications (dedup_key) where dedup_key is not null;
create index ix_notif_recipient on notifications (recipient_user_id, read_at, created_at desc);

create table notification_deliveries (
  id uuid primary key, notification_id uuid not null references notifications, channel message_channel not null,
  status delivery_status not null default 'QUEUED', attempt smallint not null default 0,
  provider_message_id text, last_error text, sent_at timestamptz, delivered_at timestamptz,
  unique (notification_id, channel)
);
create table notification_preferences (user_id uuid references users, type notification_type, channel message_channel,
  enabled boolean not null, primary key (user_id, type, channel));
```

`dedup_key` memuat jendela waktu, contoh `SLA_WARNING:{user}:{task}:WARNING:2026-09-19T08`. Ini menerapkan NOTIF-R01 dengan unique index.

## 8. Escalation, Risk, Audit, Event

```sql
create table escalations (
  id uuid primary key, project_id uuid not null references projects, task_id uuid references tasks,
  rule_code text not null, level escalation_level not null, reason text not null,
  recipient_user_ids uuid[] not null, status escalation_status not null default 'OPEN',
  triggered_at timestamptz not null default now(), acknowledged_at timestamptz, acknowledged_by uuid references users,
  resolved_at timestamptz, resolved_by uuid references users, resolution_note text, last_notified_at timestamptz
);
create unique index ux_esc_task_level on escalations (task_id, level)
  where task_id is not null and status in ('OPEN','ACKNOWLEDGED');
create unique index ux_esc_project_rule on escalations (project_id, rule_code)
  where task_id is null and status in ('OPEN','ACKNOWLEDGED');

create table risk_snapshots (project_id uuid references projects, snapshot_date date, score smallint not null,
  level risk_level not null, factors jsonb not null, primary key (project_id, snapshot_date));

create table audit_logs (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_user_id uuid, actor_type text not null,              -- USER | SYSTEM
  actor_label text not null,                                 -- email atau system:sla
  action text not null, entity_type text not null, entity_id uuid,
  project_id uuid, before jsonb, after jsonb, metadata jsonb,
  ip inet, user_agent text, request_id text,
  prev_hash char(64), hash char(64) not null
);
create index ix_audit_project on audit_logs (project_id, occurred_at desc);
create index ix_audit_actor on audit_logs (actor_user_id, occurred_at desc);
create index ix_audit_action on audit_logs (action, occurred_at desc);
create index ix_audit_entity on audit_logs (entity_type, entity_id);

create table outbox_events (
  id uuid primary key, event_type text not null, aggregate_type text not null, aggregate_id uuid not null,
  payload jsonb not null, occurred_at timestamptz not null default now(),
  published_at timestamptz, attempts int not null default 0
);
create index ix_outbox_unpublished on outbox_events (occurred_at) where published_at is null;

create table processed_events (consumer text not null, event_id uuid not null,
  processed_at timestamptz not null default now(), primary key (consumer, event_id));

create table idempotency_keys (
  key text not null, user_id uuid not null, endpoint text not null, request_hash char(64) not null,
  response_status int, response_body jsonb, created_at timestamptz not null default now(),
  primary key (user_id, endpoint, key)
);

create table data_subject_requests (id uuid primary key, user_id uuid not null references users,
  type text not null check (type in ('ACCESS','EXPORT','CORRECTION','DELETION','WITHDRAW_CONSENT')),
  status text not null check (status in ('RECEIVED','IN_REVIEW','COMPLETED','REJECTED')),
  detail text, handled_by uuid references users, created_at timestamptz not null default now(), completed_at timestamptz);
```

## 9. Pemetaan Entity Wajib

| Entity di master prompt | Tabel |
|---|---|
| User, Role, Permission | users, roles, permissions, role_permissions, user_roles |
| Client, Admin, Notary | client_profiles, admin_profiles, notary_profiles |
| Project | projects, project_members, company_data |
| Service | services, service_deliverables |
| Order, Payment | orders, payments, payment_events |
| Workflow, WorkflowStage | workflow_templates (definition), project_stages |
| Task, TaskDependency | tasks, task_dependencies |
| Document, DocumentVersion | documents, document_versions, document_deliveries |
| Message, Conversation | messages, conversations, message_attachments |
| Notification | notifications, notification_deliveries, notification_templates |
| SLA | sla_policies, business_calendars, holidays, sla_pauses |
| Escalation | escalations, escalation_rules |
| AuditLog | audit_logs |

## 10. Transaction Boundaries

| Operasi | Satu transaksi mencakup |
|---|---|
| Payment PAID | payments, orders, projects, project_members, project_stages, tasks, conversations, audit_logs, outbox_events |
| Task completion | tasks, task aktivasi berikutnya, project_stages, projects, audit_logs, outbox_events |
| Document verified | documents, document_versions, tasks (via event consumer transaksi terpisah), audit_logs, outbox_events |
| Transisi project | projects, sla_pauses, escalations (auto-resolve), audit_logs, outbox_events |

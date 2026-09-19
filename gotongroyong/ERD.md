# ERD

## 1. Conceptual ERD

```mermaid
flowchart LR
  Client -->|membuat| Order
  Order -->|dibayar lewat| Payment
  Order -->|menghasilkan 1| Project
  Service -->|dipesan di| Order
  Project -->|memakai| WorkflowTemplate
  Project -->|punya| Stage --> Task
  Project -->|punya| Document --> DocumentVersion
  Project -->|punya| Conversation --> Message
  Project -->|melibatkan| Admin & Notary
  Task -->|dipantau| SLA
  Task -->|memicu| Escalation
  Project -->|tercatat di| AuditLog
```

## 2. Logical ERD

```mermaid
erDiagram
  USERS ||--o{ USER_ROLES : has
  ROLES ||--o{ USER_ROLES : grants
  ROLES ||--o{ ROLE_PERMISSIONS : includes
  PERMISSIONS ||--o{ ROLE_PERMISSIONS : in
  USERS ||--o| CLIENT_PROFILES : is
  USERS ||--o| ADMIN_PROFILES : is
  USERS ||--o| NOTARY_PROFILES : is

  USERS ||--o{ ORDERS : places
  SERVICES ||--o{ ORDERS : ordered
  SERVICES ||--o{ SERVICE_DELIVERABLES : defines
  ORDERS ||--o{ PAYMENTS : paid_by
  PAYMENTS ||--o{ PAYMENT_EVENTS : receives
  ORDERS ||--|| PROJECTS : creates

  WORKFLOW_TEMPLATES ||--o{ PROJECTS : instantiates
  PROJECTS ||--o{ PROJECT_MEMBERS : staffed_by
  USERS ||--o{ PROJECT_MEMBERS : assigned
  PROJECTS ||--|| COMPANY_DATA : holds
  PROJECTS ||--o{ PROJECT_STAGES : has
  PROJECT_STAGES ||--o{ TASKS : contains
  TASKS ||--o{ TASK_DEPENDENCIES : depends
  SLA_POLICIES ||--o{ TASKS : governs
  PROJECTS ||--o{ SLA_PAUSES : pauses
  PROJECTS ||--o{ SIGNING_APPOINTMENTS : schedules

  PROJECTS ||--o{ DOCUMENTS : owns
  DOCUMENTS ||--o{ DOCUMENT_VERSIONS : versions
  TASKS ||--o{ DOCUMENTS : fulfilled_by
  PROJECTS ||--o{ DOCUMENT_DELIVERIES : delivers

  PROJECTS ||--o{ CONVERSATIONS : has
  CONVERSATIONS ||--o{ MESSAGES : contains
  MESSAGES ||--o{ MESSAGE_ATTACHMENTS : attaches
  DOCUMENTS ||--o{ MESSAGE_ATTACHMENTS : attached

  USERS ||--o{ NOTIFICATIONS : receives
  NOTIFICATIONS ||--o{ NOTIFICATION_DELIVERIES : sent_via

  PROJECTS ||--o{ ESCALATIONS : raises
  TASKS ||--o{ ESCALATIONS : raises
  PROJECTS ||--o{ RISK_SNAPSHOTS : scored
  PROJECTS ||--o{ AUDIT_LOGS : traced

  PROJECTS {
    uuid id PK
    text code UK
    uuid order_id FK,UK
    uuid client_id FK
    project_status status
    blocked_on blocked_on
    health health
    smallint risk_score
  }
  TASKS {
    uuid id PK
    uuid project_id FK
    uuid stage_id FK
    task_status status
    task_owner_role owner_role
    completion_mode completion_mode
    timestamptz due_at
  }
  DOCUMENTS {
    uuid id PK
    uuid project_id FK
    document_type document_type
    document_status status
    content_review_status content_review_status
  }
  PAYMENTS {
    uuid id PK
    uuid order_id FK
    text provider_ref UK
    payment_status status
    bigint amount_idr
  }
```

## 3. Kardinalitas Kritis

| Relasi | Kardinalitas | Penegak |
|---|---|---|
| Order ke Project | 1 : 0..1 | `projects.order_id unique` |
| Project ke primary admin aktif | 1 : 1 | Partial unique index |
| Project ke Notary aktif | 1 : 0..1 | Partial unique index |
| Order ke payment aktif | 1 : 0..1 | Partial unique index |
| Task ke eskalasi terbuka per level | 1 : 0..1 | Partial unique index |
| Document ke versi | 1 : 1..n | `unique (document_id, version_no)` |

# Audit Log

## 1. Tujuan

Menjawab: siapa, melakukan apa, kapan, di project mana, dari mana, apa yang berubah, nilai sebelum, nilai sesudah.

## 2. Struktur

Lihat `audit_logs` di DATABASE_SCHEMA.md. Field utama:

| Pertanyaan | Field |
|---|---|
| Who | `actor_user_id`, `actor_type`, `actor_label` |
| Did what | `action` |
| When | `occurred_at` |
| On which project | `project_id`, `entity_type`, `entity_id` |
| From where | `ip`, `user_agent`, `request_id` |
| What changed | `before`, `after` (hanya field yang berubah) |

## 3. Daftar Action

| Kategori | Action |
|---|---|
| Auth | USER_LOGIN, USER_LOGIN_FAILED, USER_LOGOUT, MFA_ENABLED, PASSWORD_RESET, SESSION_REVOKED |
| User | USER_INVITED, USER_ACTIVATED, USER_DISABLED, ROLE_CHANGED |
| Order dan Payment | ORDER_CREATED, ORDER_CANCELLED, ORDER_EXPIRED, PAYMENT_CREATED, PAYMENT_CONFIRMED, PAYMENT_FAILED, PAYMENT_AMOUNT_MISMATCH, REFUND_RECORDED |
| Project | PROJECT_CREATED, STATUS_CHANGED, STATUS_OVERRIDDEN, PROJECT_HELD, PROJECT_RESUMED, PROJECT_CANCELLED, USER_ASSIGNED, USER_UNASSIGNED, NOTARY_ACCEPTED, NOTARY_DECLINED |
| Data | COMPANY_DATA_UPDATED, COMPANY_DATA_SUBMITTED, DATA_VALIDATED, DATA_REJECTED, IDENTITY_DATA_VIEWED |
| Task | TASK_CREATED, TASK_OPENED, TASK_COMPLETED, TASK_FORCE_COMPLETED, TASK_REOPENED, TASK_SKIPPED |
| Document | DOCUMENT_UPLOADED, DOCUMENT_QUARANTINED, DOCUMENT_CLASSIFIED, DOCUMENT_VERIFIED, DOCUMENT_REJECTED, DOCUMENT_SUPERSEDED, DOCUMENT_VIEWED, DOCUMENT_DOWNLOADED, DOCUMENT_REASSIGNED, DOCUMENT_DELIVERED |
| Messaging | MESSAGE_SENT, MESSAGE_RECEIVED, MESSAGE_RELAYED, UNMATCHED_MESSAGE_RESOLVED, SECURITY_SUSPICIOUS_REFERENCE |
| SLA dan Eskalasi | SLA_PAUSED, SLA_RESUMED, SLA_POLICY_CHANGED, ESCALATION_TRIGGERED, ESCALATION_ACKNOWLEDGED, ESCALATION_RESOLVED |
| Konfigurasi | WORKFLOW_TEMPLATE_PUBLISHED, SERVICE_CHANGED, HOLIDAYS_UPDATED, NOTIFICATION_TEMPLATE_CHANGED |
| Privacy | CONSENT_GIVEN, PRIVACY_REQUEST_CREATED, DATA_EXPORTED, DATA_PURGED |
| Security | WEBHOOK_SIGNATURE_INVALID, PERMISSION_DENIED |

## 4. Immutability

| Kontrol | Detail |
|---|---|
| Hak DB | Role `app_rw` hanya punya INSERT dan SELECT pada `audit_logs`. |
| Trigger | Trigger `BEFORE UPDATE OR DELETE` menolak semua perubahan. |
| Hash chain | `hash = sha256(prev_hash || canonical_json(row tanpa hash))`. Insert berurutan melalui advisory lock per partisi harian. |
| Verifikasi | Endpoint `/audit-logs/verify-chain` dan job harian memverifikasi rantai. Kegagalan memicu alert kritis. |
| Arsip | Partisi bulanan. Partisi lama diekspor ke storage WORM jika tersedia (TECHNICAL_VALIDATION_REQUIRED). |

"Immutable secara normal" berarti tidak ada jalur aplikasi untuk mengubah log. Penghapusan karena kewajiban retensi hanya lewat prosedur DBA terdokumentasi dan tercatat di log terpisah.

## 5. Redaksi

`before` dan `after` tidak menyimpan nilai PII mentah. Field sensitif dicatat sebagai `"[CHANGED]"` beserta nama field. Contoh: perubahan NIK tercatat `{ "field": "founders[1].nik", "value": "[CHANGED]" }`.

## 6. Pencarian

Filter: actor, action, project code, entity, rentang waktu, IP. Hasil diurutkan terbaru. Ekspor CSV untuk SA dicatat sebagai `DATA_EXPORTED`.

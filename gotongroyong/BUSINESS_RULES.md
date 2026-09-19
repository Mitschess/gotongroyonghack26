# Business Rules

Dokumen ini memiliki otoritas tertinggi untuk enumerasi dan aturan bisnis. Dokumen lain wajib mengikuti nilai di sini.

## 1. Canonical Enumerations

Semua enum disimpan di `packages/shared/src/enums.ts` dan sebagai PostgreSQL enum atau check constraint.

| Enum | Nilai |
|---|---|
| `role_code` | SUPER_ADMIN, ADMIN, CLIENT, NOTARY |
| `service_type` | PT, CV |
| `order_status` | PENDING_PAYMENT, PAID, EXPIRED, CANCELLED, REFUNDED |
| `payment_status` | PENDING, PROCESSING, PAID, FAILED, EXPIRED, REFUNDED |
| `project_status` | DATA_COLLECTION, DATA_REVIEW, IN_PROGRESS, FINAL_REVIEW, COMPLETED, DELIVERED, ON_HOLD, CANCELLED |
| `blocked_on` | NONE, CLIENT, NOTARY, ADMIN, SYSTEM, EXTERNAL |
| `health` | ON_TRACK, WARNING, HIGH_RISK, CRITICAL |
| `risk_level` | LOW, MEDIUM, HIGH, CRITICAL |
| `stage_status` | PENDING, ACTIVE, COMPLETED, SKIPPED |
| `task_status` | BLOCKED, OPEN, IN_PROGRESS, NEEDS_REVIEW, COMPLETED, SKIPPED, CANCELLED |
| `task_owner_role` | CLIENT, ADMIN, NOTARY, SYSTEM |
| `completion_mode` | EVIDENCE, EVENT, MANUAL |
| `priority` | P1_URGENT, P2_HIGH, P3_NORMAL, P4_LOW |
| `document_type` | KTP, KK, NPWP, COMPANY_DATA, DOMICILE_PROOF, DRAFT_DEED, DEED, POWER_OF_ATTORNEY, REGISTRATION_PROOF, SUPPORTING, FINAL_DOCUMENT, UNKNOWN |
| `document_status` | UPLOADING, SCANNING, QUARANTINED, CLASSIFYING, PENDING_RESOLUTION, NEEDS_REVIEW, VERIFIED, REJECTED, SUPERSEDED |
| `document_source` | WEB, WHATSAPP, API, INTERNAL |
| `content_review_status` | NOT_REQUIRED, PENDING, APPROVED, REJECTED |
| `classification_method` | DECLARED, CLASSIFIER, MANUAL |
| `project_resolution_method` | WORKSPACE, REPLY_CONTEXT, EXPLICIT_CODE, SINGLE_ACTIVE, ASK_USER, MANUAL |
| `message_channel` | IN_APP, WHATSAPP, EMAIL, SYSTEM |
| `message_type` | TEXT, DOCUMENT, IMAGE, VOICE, SYSTEM |
| `conversation_type` | PROJECT_EXTERNAL, PROJECT_INTERNAL, DIRECT_INTERNAL |
| `note_visibility` | INTERNAL_ADMIN, INTERNAL_WITH_NOTARY |
| `notification_type` | TASK_ASSIGNED, TASK_COMPLETED, DOCUMENT_UPLOADED, DOCUMENT_NEEDS_REVIEW, PAYMENT_RECEIVED, PAYMENT_FAILED, REMINDER, SLA_WARNING, SLA_BREACH, ESCALATION, PROJECT_COMPLETED, DOCUMENT_DELIVERED, DELIVERY_FAILED |
| `delivery_status` | QUEUED, SENT, DELIVERED, READ, FAILED |
| `escalation_level` | L1_OWNER, L2_ADMIN, L3_SUPER_ADMIN |
| `escalation_status` | OPEN, ACKNOWLEDGED, RESOLVED, AUTO_RESOLVED |
| `sla_pause_reason` | WAITING_CLIENT, ON_HOLD, EXTERNAL_DEPENDENCY, SIGNING_SCHEDULED |

## 2. Status Mapping Project ke Stage

| project_status | Stage aktif |
|---|---|
| DATA_COLLECTION | DATA_SUBMISSION |
| DATA_REVIEW | DATA_VALIDATION |
| IN_PROGRESS | NOTARY_ACCEPTANCE sampai REGISTRATION |
| FINAL_REVIEW | FINAL_QA |
| COMPLETED | DELIVERY (berjalan) |
| DELIVERED | Tidak ada. Workflow selesai. |

## 3. Business Rules

### Order dan Payment

| ID | Aturan |
|---|---|
| BR-ORDER-001 | Order menyimpan snapshot harga dan nama paket saat dibuat. Perubahan katalog tidak mengubah order lama. |
| BR-ORDER-002 | Order PENDING_PAYMENT kedaluwarsa setelah `ORDER_EXPIRY_HOURS` (default 24 jam, TBD business validation). |
| BR-ORDER-003 | Satu order hanya punya satu payment aktif (PENDING atau PROCESSING). |
| BR-PAY-001 | Status payment hanya berubah dari webhook terverifikasi atau server-side status query. Redirect frontend tidak pernah mengubah status. |
| BR-PAY-002 | Nominal dan mata uang dari gateway wajib sama dengan order. Selisih menghasilkan alert dan status tidak berubah. |
| BR-PAY-003 | Webhook diproses idempotent berdasarkan `provider_event_id`. |
| BR-PAY-004 | Pembayaran penuh di muka (A-002). |
| BR-PAY-005 | Refund dicatat oleh Super Admin. Refund membatalkan project jika project belum DELIVERED. |

### Project

| ID | Aturan |
|---|---|
| BR-PROJECT-001 | Project dibuat tepat satu kali saat order menjadi PAID. Constraint unik `projects.order_id`. |
| BR-PROJECT-002 | Kode project `PRJ-YYYY-NNNNNN`. Sequence direset per tahun. |
| BR-PROJECT-003 | Project memakai versi workflow template yang aktif saat project dibuat. Versi tidak berubah selama project berjalan. |
| BR-PROJECT-004 | `blocked_on` dihitung dari owner task OPEN atau IN_PROGRESS yang paling tua. |
| BR-PROJECT-005 | ON_HOLD dan CANCELLED wajib menyertakan alasan. |
| BR-PROJECT-006 | Project CANCELLED tidak dapat diaktifkan kembali. Buat project baru jika perlu. |

### Task

| ID | Aturan |
|---|---|
| BR-TASK-001 | Task dengan dependency yang belum selesai berstatus BLOCKED. |
| BR-TASK-002 | Task `completion_mode = EVIDENCE` selesai hanya jika dokumen bertipe `required_document_type` berstatus VERIFIED pada project yang sama. |
| BR-TASK-003 | Task `completion_mode = EVENT` selesai dari event domain tertentu (contoh: `draft.approved`). |
| BR-TASK-004 | Task `completion_mode = MANUAL` diselesaikan oleh owner dengan konfirmasi. |
| BR-TASK-005 | Admin dapat force-complete task EVIDENCE hanya dengan alasan. Aksi tercatat `TASK_FORCE_COMPLETED`. |
| BR-TASK-006 | Event completion yang sama untuk task yang sudah COMPLETED diabaikan (idempotent). |
| BR-TASK-007 | Reopen task mengembalikan status ke OPEN dan membuka ulang Task Clock. |

### Document

| ID | Aturan |
|---|---|
| BR-DOC-001 | File terunggah tidak menyelesaikan task. Hanya dokumen VERIFIED yang menyelesaikan task. |
| BR-DOC-002 | Verifikasi otomatis hanya jika semua syarat di DOCUMENT_MANAGEMENT.md bagian 5 terpenuhi. |
| BR-DOC-003 | Dokumen legal-critical final (DEED, REGISTRATION_PROOF, FINAL_DOCUMENT) wajib lolos Final QA manusia sebelum delivery. |
| BR-DOC-004 | Dokumen identitas (KTP, KK, NPWP) diverifikasi manusia pada tahap DATA_VALIDATION. |
| BR-DOC-005 | File dengan SHA-256 sama pada project yang sama ditandai duplikat dan tidak membuat versi baru. |
| BR-DOC-006 | Upload dokumen bertipe sama dan slot sama membuat versi baru. Versi lama menjadi SUPERSEDED. |
| BR-DOC-007 | File terdeteksi malware berstatus QUARANTINED dan tidak pernah dapat diunduh. |

### SLA dan Eskalasi

| ID | Aturan |
|---|---|
| BR-SLA-001 | SLA dihitung dalam business time menurut business calendar. |
| BR-SLA-002 | Project Clock pause saat `blocked_on` = CLIENT, saat ON_HOLD, dan saat pause EXTERNAL_DEPENDENCY atau SIGNING_SCHEDULED aktif. |
| BR-SLA-003 | Project Clock mulai saat stage DATA_VALIDATION selesai dan berhenti saat project COMPLETED. |
| BR-SLA-004 | Task milik Client tidak memicu eskalasi ke Super Admin. Task Client memicu follow-up task untuk Admin. |
| BR-SLA-005 | Pause EXTERNAL_DEPENDENCY hanya dapat dipasang Admin atau Super Admin dengan alasan tertulis. |
| BR-ESC-001 | Satu task hanya punya satu eskalasi terbuka per level. |
| BR-ESC-002 | Eskalasi menjadi AUTO_RESOLVED saat kondisi pemicunya hilang. |

### WhatsApp dan Komunikasi

| ID | Aturan |
|---|---|
| BR-WA-001 | Client dan Notary tidak pernah melihat nomor telepon satu sama lain. |
| BR-WA-002 | Pesan masuk dari nomor tidak terdaftar tidak diteruskan dan masuk antrean Admin. |
| BR-WA-003 | Lampiran WhatsApp masuk document pipeline. Penerima menerima notifikasi dengan link portal, bukan file mentah. |
| BR-WA-004 | Pesan bisnis di luar jendela percakapan provider memakai template yang disetujui (TECHNICAL_VALIDATION_REQUIRED). |
| BR-MSG-001 | Client tidak pernah menerima isi conversation bertipe PROJECT_INTERNAL. |

### AI

| ID | Aturan |
|---|---|
| BR-AI-001 | AI tidak mengambil keputusan legal. |
| BR-AI-002 | Hasil AI menyertakan confidence dan versi model. |
| BR-AI-003 | Hasil AI pada dokumen legal-critical hanya berfungsi sebagai saran. |

### Audit

| ID | Aturan |
|---|---|
| BR-AUDIT-001 | Audit log append-only. Tidak ada UPDATE atau DELETE dari aplikasi. |
| BR-AUDIT-002 | Setiap perubahan status entitas utama menghasilkan satu entri audit dengan nilai before dan after. |

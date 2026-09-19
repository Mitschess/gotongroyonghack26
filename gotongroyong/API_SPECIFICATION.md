# API Specification

## 1. Konvensi Umum

| Aspek | Aturan |
|---|---|
| Base URL | `/api/v1` |
| Format | JSON, `camelCase` di API, `snake_case` di database |
| Auth web | Session cookie `sid` (HttpOnly, Secure, SameSite=Lax) + header `X-CSRF-Token` untuk method non-GET |
| Auth integrasi | `Authorization: Bearer <api_key>` untuk endpoint `/integrations/*` |
| Auth webhook | Signature provider. Tanpa session. |
| Idempotency | Header `Idempotency-Key` (UUID) wajib pada endpoint bertanda. Disimpan 24 jam. Key sama dengan body berbeda: 422 `IDEMPOTENCY_KEY_REUSED`. |
| Pagination | Cursor: `?limit=20&cursor=<opaque>`. Respons: `{ data, nextCursor }` |
| Waktu | ISO 8601 UTC |
| Concurrency | Header `If-Match: <version>` pada PATCH entitas berstatus. Mismatch: 409 `VERSION_CONFLICT`. |
| Otorisasi | Setiap endpoint memeriksa permission dan scope data (AUTHORIZATION.md). Resource di luar scope mengembalikan 404, bukan 403, untuk mencegah enumerasi. |
| Dokumentasi | OpenAPI 3.1 dihasilkan dari kode NestJS |

### Format Error

```json
{
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "Project tidak dapat dipindah dari DATA_COLLECTION ke IN_PROGRESS.",
    "details": { "from": "DATA_COLLECTION", "to": "IN_PROGRESS" },
    "requestId": "req_01J..."
  }
}
```

Daftar kode error ada di ERROR_HANDLING.md.

### Rate Limit Tier

| Tier | Batas default | Kunci |
|---|---|---|
| AUTH | 5 per menit, 20 per jam | IP + email |
| OTP | 3 per 10 menit | Nomor telepon |
| WRITE | 60 per menit | User |
| READ | 300 per menit | User |
| UPLOAD | 30 per jam | User |
| WEBHOOK | 600 per menit | Provider IP range (jika tersedia) |

Angka adalah titik awal. `TBD: Requires business validation` setelah load test.

## 2. Endpoint Catalog

Kolom Idem: Y berarti `Idempotency-Key` wajib.

### Auth dan User

| Method | Path | Role | Idem | Tier | Keterangan |
|---|---|---|---|---|---|
| POST | /auth/register | Public | Y | AUTH | Registrasi Client |
| POST | /auth/verify-email | Public | N | AUTH | Token email |
| POST | /auth/phone/otp | Session | N | OTP | Kirim OTP WhatsApp |
| POST | /auth/phone/verify | Session | N | OTP | Verifikasi OTP |
| POST | /auth/login | Public | N | AUTH | Email + password (+ TOTP) |
| POST | /auth/logout | Session | N | WRITE | Revoke session |
| POST | /auth/password/forgot | Public | N | AUTH | Kirim link reset |
| POST | /auth/password/reset | Public | N | AUTH | Reset dengan token |
| POST | /auth/mfa/setup | Session | N | WRITE | Mulai setup TOTP |
| POST | /auth/mfa/confirm | Session | N | WRITE | Aktifkan TOTP |
| GET | /me | Session | N | READ | Profil dan permission efektif |
| GET | /users | SA | N | READ | Daftar user |
| POST | /users/invitations | SA | Y | WRITE | Undang Admin, Notary, SA |
| PATCH | /users/{id} | SA | N | WRITE | Ubah role atau status |
| POST | /users/{id}/disable | SA | N | WRITE | Disable dan revoke session |

### Catalog, Order, Payment

| Method | Path | Role | Idem | Tier |
|---|---|---|---|---|
| GET | /services | Public | N | READ |
| POST | /services | SA | Y | WRITE |
| PATCH | /services/{id} | SA | N | WRITE |
| POST | /orders | Client | Y | WRITE |
| GET | /orders | Client (own), Admin, SA | N | READ |
| GET | /orders/{id} | Client (own), Admin, SA | N | READ |
| POST | /orders/{id}/cancel | Client (own) | N | WRITE |
| POST | /orders/{id}/payments | Client (own) | Y | WRITE |
| GET | /payments/{id} | Client (own), Admin, SA | N | READ |
| POST | /payments/{id}/refunds | SA | Y | WRITE |
| GET | /orders/{id}/invoice | Client (own), Admin, SA | N | READ |

### Project dan Workflow

| Method | Path | Role | Idem | Tier |
|---|---|---|---|---|
| GET | /projects | Semua (scoped) | N | READ |
| GET | /projects/{id} | Semua (scoped) | N | READ |
| GET | /projects/{id}/timeline | Semua (scoped, view per role) | N | READ |
| GET | /projects/{id}/company-data | Client (own), Admin, Notary (assigned), SA | N | READ |
| PUT | /projects/{id}/company-data | Client (own) saat DATA_COLLECTION, Admin | N | WRITE |
| POST | /projects/{id}/company-data/submit | Client (own) | N | WRITE |
| POST | /projects/{id}/data-validation | Admin (assigned), SA | N | WRITE |
| POST | /projects/{id}/hold | Admin (assigned), SA | N | WRITE |
| POST | /projects/{id}/resume | Admin (assigned), SA | N | WRITE |
| POST | /projects/{id}/cancel | SA | N | WRITE |
| POST | /projects/{id}/override-status | SA | N | WRITE |
| GET | /projects/{id}/members | Admin, SA, Notary (assigned: nama saja) | N | READ |
| POST | /projects/{id}/admins | SA | N | WRITE |
| GET | /projects/{id}/notary-suggestions | Admin (assigned), SA | N | READ |
| POST | /projects/{id}/notary-assignment | Admin (assigned), SA | N | WRITE |
| POST | /projects/{id}/notary-assignment/accept | Notary (proposed) | N | WRITE |
| POST | /projects/{id}/notary-assignment/decline | Notary (proposed) | N | WRITE |
| POST | /projects/{id}/draft/approve | Client (own) | N | WRITE |
| POST | /projects/{id}/draft/request-revision | Client (own) | N | WRITE |
| POST | /projects/{id}/signing-appointments | Notary (assigned), Admin | N | WRITE |
| POST | /projects/{id}/signing-appointments/{aid}/complete | Notary (assigned) | N | WRITE |
| POST | /projects/{id}/final-qa | Admin (assigned), SA | N | WRITE |
| POST | /projects/{id}/sla-pauses | Admin (assigned), SA | N | WRITE |
| DELETE | /projects/{id}/sla-pauses/{pid} | Admin (assigned), SA | N | WRITE |
| GET | /workflow-templates | SA | N | READ |
| POST | /workflow-templates | SA | Y | WRITE |
| POST | /workflow-templates/{id}/publish | SA | N | WRITE |

### Task dan To-Do

| Method | Path | Role | Tier |
|---|---|---|---|
| GET | /me/todos | Semua | READ |
| GET | /projects/{id}/tasks | Semua (scoped, Client melihat label saja) | READ |
| GET | /tasks/{id} | Scoped | READ |
| POST | /tasks/{id}/start | Owner | WRITE |
| POST | /tasks/{id}/complete | Owner (MANUAL), Admin (force + reason) | WRITE |
| POST | /tasks/{id}/reopen | Admin, SA | WRITE |
| POST | /tasks/{id}/comments | Admin, SA, Notary (assigned) | WRITE |

### Document

| Method | Path | Role | Idem | Tier |
|---|---|---|---|---|
| POST | /projects/{id}/documents/upload-intents | Scoped uploader | Y | UPLOAD |
| POST | /documents/{id}/complete | Uploader | N | UPLOAD |
| GET | /projects/{id}/documents | Scoped | N | READ |
| GET | /documents/{id} | Scoped | N | READ |
| GET | /documents/{id}/versions | Admin, SA, Notary (assigned) | N | READ |
| POST | /documents/{id}/download-url | Scoped | N | READ |
| GET | /review-queue/documents | Admin, SA | N | READ |
| POST | /documents/{id}/review | Admin (assigned), SA | N | WRITE |
| POST | /documents/{id}/reassign-project | Admin, SA | N | WRITE |
| POST | /integrations/projects/{id}/documents | API key | Y | UPLOAD |

### Communication dan Notification

| Method | Path | Role | Tier |
|---|---|---|---|
| GET | /conversations | Scoped | READ |
| GET | /conversations/{id}/messages | Scoped (PROJECT_INTERNAL tertutup untuk Client) | READ |
| POST | /conversations/{id}/messages | Scoped | WRITE |
| POST | /projects/{id}/internal-notes | Admin, SA | WRITE |
| GET | /unmatched-messages | Admin, SA | READ |
| POST | /unmatched-messages/{id}/resolve | Admin, SA | WRITE |
| GET | /notifications | Semua (own) | READ |
| POST | /notifications/{id}/read | Own | WRITE |
| POST | /notifications/read-all | Own | WRITE |
| GET | /me/notification-preferences | Own | READ |
| PUT | /me/notification-preferences | Own | WRITE |

### SLA, Escalation, Dashboard, Analytics, Audit

| Method | Path | Role | Tier |
|---|---|---|---|
| GET | /sla-policies | SA | READ |
| POST | /sla-policies | SA | WRITE |
| GET | /calendars/{code}/holidays | SA, Admin | READ |
| PUT | /calendars/{code}/holidays | SA | WRITE |
| GET | /escalations | Admin (scoped), SA | READ |
| POST | /escalations | Admin (manual), SA | WRITE |
| POST | /escalations/{id}/acknowledge | Recipient | WRITE |
| POST | /escalations/{id}/resolve | Recipient, SA | WRITE |
| GET | /dashboards/super-admin | SA | READ |
| GET | /dashboards/admin | Admin | READ |
| GET | /dashboards/notary | Notary | READ |
| GET | /dashboards/client | Client | READ |
| GET | /analytics/metrics | SA | READ |
| GET | /audit-logs | SA (semua), Admin (project scoped), Client/Notary (own activity) | READ |
| GET | /audit-logs/verify-chain | SA | READ |
| POST | /privacy/requests | Client, Notary | WRITE |
| GET | /privacy/requests | SA | READ |

### Webhook

| Method | Path | Auth | Tier |
|---|---|---|---|
| POST | /webhooks/payment/{provider} | Signature | WEBHOOK |
| POST | /webhooks/whatsapp/{provider} | Signature | WEBHOOK |
| GET | /webhooks/whatsapp/{provider} | Verify token (jika provider mensyaratkan handshake) | WEBHOOK |
| POST | /webhooks/email/{provider} | Signature | WEBHOOK |

## 3. Kontrak Detail Endpoint Kritis

### POST /orders

Request:
```json
{ "serviceId": "0191f0...", "companyNameProposals": ["PT Maju Jaya Abadi", "PT Maju Jaya Sentosa", "PT Maju Jaya Nusantara"] }
```
Response 201:
```json
{ "id": "0191f1...", "code": "ORD-2026-000123", "status": "PENDING_PAYMENT", "amountIdr": 6500000, "expiresAt": "2026-09-20T03:00:00Z" }
```
Errors: 404 `SERVICE_NOT_FOUND`, 422 `VALIDATION_FAILED`, 409 `IDEMPOTENCY_IN_PROGRESS`.
Validasi: service aktif, minimal satu usulan nama (jumlah untuk PT: `LEGAL_REVIEW_REQUIRED`).

### POST /orders/{id}/payments

Response 201:
```json
{ "paymentId": "0191f2...", "status": "PENDING", "provider": "gateway_x", "checkoutUrl": "https://...", "expiresAt": "2026-09-20T03:00:00Z" }
```
Errors: 409 `ORDER_NOT_PAYABLE` (bukan PENDING_PAYMENT), 409 `ACTIVE_PAYMENT_EXISTS` (mengembalikan payment aktif), 502 `PAYMENT_PROVIDER_ERROR`.

### POST /webhooks/payment/{provider}

- Baca raw body. Verifikasi signature. Gagal: 401, log `WEBHOOK_SIGNATURE_INVALID`.
- Insert `payment_events` dengan `ON CONFLICT DO NOTHING`. Duplikat: 200.
- Enqueue `payment.process`. Respons 200 dalam target < 1 detik.

### POST /projects/{id}/documents/upload-intents

Request:
```json
{ "slotKey": "KTP:person_7f3a", "documentType": "KTP", "fileName": "ktp-budi.jpg", "mimeType": "image/jpeg", "fileSize": 812345, "sha256": "9f86d0..." }
```
Response 201:
```json
{ "documentId": "0191f3...", "versionNo": 1, "uploadUrl": "https://storage/...", "uploadHeaders": { "Content-Type": "image/jpeg" }, "expiresAt": "2026-09-19T08:15:00Z" }
```
Errors: 403 `SLOT_NOT_ALLOWED_FOR_ROLE`, 409 `DUPLICATE_FILE`, 413 `FILE_TOO_LARGE`, 415 `UNSUPPORTED_FILE_TYPE`, 409 `STAGE_NOT_ACCEPTING_DOCUMENT`.

### POST /documents/{id}/review

Request:
```json
{ "decision": "VERIFY", "documentType": "DEED", "note": "Sesuai" }
```
`decision`: VERIFY, CHANGE_TYPE_AND_VERIFY, REJECT. REJECT wajib `reason`.
Response 200: dokumen terbaru. Side effect: task update, audit `DOCUMENT_VERIFIED` atau `DOCUMENT_REJECTED`.
Errors: 409 `DOCUMENT_NOT_REVIEWABLE`, 409 `VERSION_CONFLICT`.

### POST /projects/{id}/final-qa

Request:
```json
{ "decision": "APPROVE", "checkedDocumentIds": ["...","..."], "note": "Paket lengkap" }
```
Validasi: semua deliverable wajib (`service_deliverables`) ada, VERIFIED, dan terdaftar di `checkedDocumentIds`. Sistem memverifikasi bahwa reviewer membuka setiap dokumen (audit `DOCUMENT_VIEWED`).
Errors: 422 `DELIVERABLES_INCOMPLETE`, 422 `DOCUMENTS_NOT_VIEWED`, 409 `INVALID_STATE_TRANSITION`.

### GET /projects

Query parameter (semua opsional, digabung dengan AND, selalu dibatasi scope role):

| Param | Tipe | Contoh |
|---|---|---|
| `q` | string, min 3 | Kode project atau nama perusahaan/Client (Admin, SA) |
| `status` | project_status[] | `status=IN_PROGRESS,FINAL_REVIEW` |
| `health` | health[] | `health=CRITICAL` |
| `serviceType` | service_type | `PT` |
| `adminId`, `notaryId`, `clientId` | uuid | Admin dan SA saja |
| `paymentStatus` | payment_status | Admin dan SA saja |
| `priority` | priority | `P1_URGENT` |
| `createdFrom`, `createdTo` | date (WIB) | `2026-09-01` |
| `sort` | `dueAt`, `-createdAt`, `-riskScore` | default `-createdAt` |
| `cursor`, `limit` | string, int <= 100 | cursor pagination |

Parameter yang tidak diizinkan untuk role pemanggil diabaikan, bukan menghasilkan error, agar tidak membocorkan keberadaan data.

Metrik pribadi Admin (izin "Lihat analytics: L" di `AUTHORIZATION.md`) disajikan melalui `GET /dashboards/admin`, bukan `GET /analytics/metrics`.

### GET /me/todos

Response 200:
```json
{
  "data": [
    { "taskId": "...", "taskCode": "TSK-000000981", "projectCode": "PRJ-2026-000041", "title": "Follow-up Client: upload KTP",
      "priorityScore": 82, "health": "HIGH_RISK", "dueAt": "2026-09-19T09:00:00Z", "blockedOn": "CLIENT",
      "actionUrl": "/admin/projects/.../tasks/..." }
  ],
  "summary": { "clientFollowUps": 5, "notaryLate": 2, "documentsToReview": 3, "criticalProjects": 1 }
}
```
Urutan: `priorityScore` menurun (WORKFLOW.md bagian 6).

# Observability

## 1. Pilar

| Pilar | Implementasi |
|---|---|
| Application logs | JSON terstruktur (pino), field `requestId`, `userId`, `projectId`, `eventId`. PII diredaksi. |
| Audit logs | AUDIT_LOG.md. Terpisah dari log aplikasi. |
| Error tracking | Sentry atau setara, release tagging |
| Metrics | OpenTelemetry metrics ke backend pilihan (TBD) |
| Tracing | OpenTelemetry trace dari web ke api ke worker, propagasi lewat envelope event |
| Queue monitoring | Dashboard BullMQ internal (akses SA teknis), metrik depth, age, failure |

## 2. Metrik Kunci

| Metrik | Tipe |
|---|---|
| `webhook_received_total{provider,type}` | Counter |
| `webhook_signature_invalid_total{provider}` | Counter |
| `webhook_processing_failures_total{provider}` | Counter |
| `outbox_lag_seconds` | Gauge |
| `queue_depth{queue}` dan `queue_oldest_job_age_seconds{queue}` | Gauge |
| `document_processing_failures_total{stage}` | Counter |
| `sla_job_duration_seconds` dan `sla_job_failures_total` | Histogram, counter |
| `notification_failures_total{channel}` | Counter |
| `delivery_failures_total{channel}` | Counter |
| `payment_reconcile_mismatch_total` | Counter |
| `audit_chain_verify_failures_total` | Counter |
| `http_request_duration_seconds{route}` | Histogram |

## 3. Alert

| Alert | Kondisi | Severity |
|---|---|---|
| WhatsApp webhook failure | Failure rate > 5% dalam 10 menit atau tidak ada webhook masuk 60 menit pada jam kerja | High |
| Payment webhook failure | Satu kegagalan proses masuk DLQ | Critical |
| Payment mismatch | `payment_reconcile_mismatch_total` naik | Critical |
| Document processing failure | > 3 kegagalan dalam 15 menit | High |
| SLA job failure | 3 run berturut gagal atau durasi > 4 menit | High |
| Notification failure | Failure rate > 10% dalam 15 menit per channel | High |
| Outbox lag | > 120 detik | High |
| Audit chain broken | Satu kegagalan | Critical |
| Webhook signature invalid spike | > 20 dalam 5 menit | High (indikasi serangan) |
| API error rate | 5xx > 2% dalam 5 menit | High |

Alert critical dikirim ke on-call teknis dan SA. Kanal on-call TBD.

## 4. Health Check

`GET /health/live` (proses hidup) dan `GET /health/ready` (database, Redis, storage dapat dijangkau). Worker melaporkan heartbeat ke Redis setiap 30 detik.

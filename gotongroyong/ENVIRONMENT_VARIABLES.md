# Environment Variables

Secret disimpan di secret manager. File `.env` hanya untuk local.

| Variable | Wajib | Contoh | Keterangan |
|---|---|---|---|
| NODE_ENV | Ya | production | |
| APP_BASE_URL | Ya | https://app.example.co.id | URL web |
| API_BASE_URL | Ya | https://api.example.co.id | |
| DATABASE_URL | Ya | postgres://... | Role `app_rw` |
| DATABASE_AUDIT_ROLE | Ya | app_rw | Role tanpa UPDATE/DELETE pada audit_logs |
| REDIS_URL | Ya | rediss://... | TLS |
| SESSION_SECRET | Ya | (secret) | Minimal 32 byte |
| CSRF_SECRET | Ya | (secret) | |
| KMS_KEY_ID | Ya | (id) | Envelope encryption kolom PII |
| STORAGE_PROVIDER | Ya | s3 | |
| STORAGE_ENDPOINT | Ya | https://... | |
| STORAGE_REGION | Ya | (region Jakarta) | |
| STORAGE_BUCKET_DOCUMENTS | Ya | legalitas-docs-prod | Privat |
| STORAGE_ACCESS_KEY_ID / STORAGE_SECRET_ACCESS_KEY | Ya | (secret) | Atau workload identity |
| SIGNED_URL_GET_TTL_SECONDS | Ya | 300 | |
| SIGNED_URL_PUT_TTL_SECONDS | Ya | 900 | |
| UPLOAD_MAX_BYTES | Ya | 20971520 | 20 MB |
| CLAMAV_HOST / CLAMAV_PORT | Ya | clamav / 3310 | |
| PAYMENT_PROVIDER | Ya | (kode gateway) | |
| PAYMENT_API_KEY | Ya | (secret) | |
| PAYMENT_WEBHOOK_SECRET | Ya | (secret) | |
| ORDER_EXPIRY_HOURS | Ya | 24 | |
| WA_PROVIDER | Ya | (kode provider) | |
| WA_API_TOKEN | Ya | (secret) | |
| WA_PHONE_NUMBER_ID | Ya | (id) | |
| WA_WEBHOOK_SECRET | Ya | (secret) | Verifikasi signature |
| WA_WEBHOOK_VERIFY_TOKEN | Kondisional | (secret) | Jika provider memakai handshake |
| WA_RESOLUTION_TIMEOUT_MINUTES | Ya | 240 | Business minutes |
| EMAIL_PROVIDER / EMAIL_API_KEY / EMAIL_FROM | Ya | | |
| AI_PROVIDER / AI_API_KEY | Tidak | | Kosong berarti AI nonaktif |
| DOC_AUTO_VERIFY_THRESHOLD | Ya | 0.90 | |
| FEATURE_AUTO_VERIFY | Ya | false | Mengaktifkan auto-verify berbasis CLASSIFIER (syarat 4b DOCUMENT_MANAGEMENT.md). Jalur DECLARED via slot web selalu aktif (P0). |
| FEATURE_AI_CLASSIFIER | Ya | false | |
| FEATURE_WA_OUTBOUND | Ya | false | Notifikasi dan delivery keluar via WhatsApp (P1) |
| FEATURE_WA_RELAY | Ya | false | Inbound WhatsApp dan relay proxy (P1) |
| FEATURE_NOTARY_AUTO_CONFIRM | Ya | false | |
| DEFAULT_TIMEZONE | Ya | Asia/Jakarta | |
| SENTRY_DSN / OTEL_EXPORTER_OTLP_ENDPOINT | Ya | | Observability |
| LOG_LEVEL | Ya | info | |
| RATE_LIMIT_* | Tidak | | Override tier default |

Validasi: aplikasi memvalidasi semua variable dengan Zod saat start dan gagal start jika ada yang hilang.

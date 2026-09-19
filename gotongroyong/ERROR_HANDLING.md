# Error Handling

## 1. Prinsip

1. Fail safe: automation gagal tidak pernah menghasilkan status sukses.
2. Error sementara di-retry. Error permanen tidak di-retry.
3. Setiap error yang butuh manusia menghasilkan follow-up task atau alert.
4. Pesan ke user jelas dan tidak membocorkan detail internal.

## 2. Kode Error API

| HTTP | Code | Arti |
|---|---|---|
| 400 | BAD_REQUEST | Format request salah |
| 401 | UNAUTHENTICATED | Session tidak valid |
| 401 | MFA_REQUIRED | Butuh kode TOTP |
| 403 | FORBIDDEN | Permission tidak ada pada resource dalam scope |
| 403 | SLOT_NOT_ALLOWED_FOR_ROLE | Role tidak boleh upload ke slot |
| 404 | NOT_FOUND | Tidak ada atau di luar scope |
| 409 | INVALID_STATE_TRANSITION | Transisi tidak valid |
| 409 | VERSION_CONFLICT | Optimistic lock gagal |
| 409 | DUPLICATE_FILE | File sama sudah ada di slot |
| 409 | ORDER_NOT_PAYABLE | Order tidak dapat dibayar |
| 409 | ACTIVE_PAYMENT_EXISTS | Sudah ada payment aktif |
| 409 | STAGE_NOT_ACCEPTING_DOCUMENT | Stage aktif tidak meminta dokumen ini |
| 409 | DOCUMENT_NOT_REVIEWABLE | Dokumen bukan NEEDS_REVIEW |
| 409 | IDEMPOTENCY_IN_PROGRESS | Request dengan key sama sedang diproses |
| 413 | FILE_TOO_LARGE | Melewati batas ukuran |
| 415 | UNSUPPORTED_FILE_TYPE | Tipe file tidak diizinkan |
| 422 | VALIDATION_FAILED | Validasi field gagal (`details.fields`) |
| 422 | IDEMPOTENCY_KEY_REUSED | Key dipakai dengan body berbeda |
| 422 | DELIVERABLES_INCOMPLETE | Paket final belum lengkap |
| 422 | DOCUMENTS_NOT_VIEWED | Reviewer belum membuka semua dokumen |
| 422 | REASON_REQUIRED | Aksi butuh alasan |
| 429 | RATE_LIMITED | Terlalu banyak request (`Retry-After`) |
| 500 | INTERNAL_ERROR | Error tidak terduga |
| 502 | PAYMENT_PROVIDER_ERROR | Gateway gagal |
| 502 | MESSAGING_PROVIDER_ERROR | Provider WhatsApp atau email gagal |
| 503 | SERVICE_UNAVAILABLE | Maintenance atau dependency down |

## 3. Klasifikasi Error Worker

| Kelas | Contoh | Aksi |
|---|---|---|
| Transient | Timeout, 5xx provider, koneksi Redis | Retry backoff |
| Rate limited | 429 provider | Retry sesuai `Retry-After` |
| Permanent | Validasi gagal, state invalid, nomor tidak valid | DLQ tanpa retry, alert, follow-up task |
| Poison | Payload rusak | DLQ, alert teknis |

## 4. Fail-Safe Matrix

| Automation | Jika gagal | Status aman |
|---|---|---|
| Malware scan | Scanner error | Dokumen tetap SCANNING, tidak dapat diunduh |
| Klasifikasi | Provider AI error | NEEDS_REVIEW dengan alasan `CLASSIFIER_UNAVAILABLE` |
| Project resolution | Ambigu | PENDING_RESOLUTION lalu NEEDS_REVIEW |
| Task matching | Tidak ada task cocok | Dokumen VERIFIED sebagai SUPPORTING, task tidak berubah |
| Payment processing | Status gateway tidak dapat dikonfirmasi | Payment tetap PENDING, reconcile berikutnya |
| Notifikasi | Channel gagal | Fallback, in-app selalu tersimpan |
| Delivery | Semua channel gagal | Project tetap COMPLETED (tidak DELIVERED), eskalasi L2 |
| SLA job | Job gagal | Nilai health terakhir tetap, alert setelah 3 kegagalan |

## 5. Pesan ke User

| Kondisi | Contoh pesan |
|---|---|
| Upload ditolak tipe | "File harus PDF, JPG, atau PNG." |
| File terlalu besar | "Ukuran file maksimal 20 MB." |
| Dokumen ditolak reviewer | "Foto KTP kurang jelas. Mohon unggah ulang dengan cahaya cukup." |
| Pembayaran belum terkonfirmasi | "Kami masih menunggu konfirmasi dari penyedia pembayaran. Halaman ini akan diperbarui otomatis." |
| Error server | "Terjadi kendala. Silakan coba lagi. Kode: req_01J..." |

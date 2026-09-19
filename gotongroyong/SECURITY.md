# Security

## 1. Kontrol Inti

| Area | Kontrol |
|---|---|
| Password | argon2id (memory 64 MB, iterations 3, parallelism 1 sebagai titik awal, TECHNICAL_VALIDATION_REQUIRED pada hardware produksi). Minimal 10 karakter. Cek terhadap daftar password bocor. |
| Session | Token acak 256 bit. Disimpan sebagai hash. Cookie HttpOnly, Secure, SameSite=Lax. Idle timeout 30 menit untuk internal, 7 hari untuk Client. Absolute timeout 12 jam internal. |
| Password reset | Token acak sekali pakai, disimpan sebagai hash, berlaku 30 menit. Reset berhasil mencabut semua session user. Respons endpoint forgot selalu sama untuk email terdaftar atau tidak. |
| MFA | TOTP. Wajib untuk SA sejak go-live, wajib untuk Admin pada Phase 13. Arsitektur siap sejak Phase 1. |
| CSRF | Double-submit token pada semua request non-GET dari browser |
| Rate limiting | Redis sliding window, tier di API_SPECIFICATION.md |
| Input validation | Zod schema di API. Tolak field tidak dikenal. |
| Output encoding | React escaping default. Tidak ada `dangerouslySetInnerHTML` untuk konten user. |
| CSP | `default-src 'self'`, tanpa inline script, `frame-ancestors 'none'` |
| File upload | Presigned URL terkunci ukuran dan tipe, magic byte sniffing, ClamAV, tolak PDF aktif |
| Enkripsi transit | TLS 1.2+ di semua endpoint, HSTS |
| Enkripsi at rest | Enkripsi disk database dan storage oleh provider. Kolom PII sensitif (data perusahaan, secret MFA) dienkripsi level aplikasi dengan envelope encryption (KMS). |
| Secret | Secret manager provider. Tidak ada secret di repo atau image. |
| Signed URL | GET 5 menit, PUT 15 menit |
| Data isolation | Filter scope di repository layer, test permission otomatis per endpoint |
| Dependency | Scan dependency di CI, update terjadwal |
| Logging | Log aplikasi tidak memuat PII mentah. Redaksi NIK, nomor telepon, email di logger. |

## 2. Threat Model

| Ancaman | Contoh | Mitigasi |
|---|---|---|
| Broken access control | Notary membuka project lain | Scope filter di query, 404 untuk resource luar scope, test matrix otomatis |
| IDOR | Mengganti `documentId` di URL | UUID tidak dapat ditebak dan tetap dicek otorisasi. Tidak ada akses berdasarkan UUID saja. |
| File upload attack | Polyglot file, PDF dengan JavaScript | Magic bytes, PDF sanitization check, malware scan, file tidak pernah dieksekusi atau di-render di origin aplikasi |
| Malware | Lampiran WhatsApp terinfeksi | ClamAV sebelum klasifikasi, karantina |
| XSS | Pesan chat berisi script | Escaping React, CSP ketat, sanitasi markdown bila ada |
| CSRF | Form eksternal memicu aksi | CSRF token, SameSite cookie |
| SQL injection | Parameter filter | Query berparameter (Drizzle), tidak ada raw SQL dengan string concat |
| SSRF | URL media provider dimanipulasi | Worker hanya mengunduh dari host allowlist provider, blok IP privat |
| Credential theft | Phishing Admin | MFA, notifikasi login dari perangkat baru, session revocation |
| Webhook spoofing | Request palsu ke `/webhooks/payment` | Verifikasi signature HMAC dengan raw body, konfirmasi ulang status ke gateway |
| Replay attack | Webhook lama dikirim ulang | Idempotency `provider_event_id`, cek timestamp bila tersedia |
| Unauthorized document access | Link unduhan disebar | Signed URL 5 menit, link portal butuh login |
| Privilege escalation | Admin mengubah role sendiri | Endpoint user hanya SA, audit `ROLE_CHANGED`, SA terakhir tidak dapat dihapus |
| Enumerasi akun | Pesan error login berbeda | Pesan generik, rate limit |
| Brute force OTP | Tebak OTP | 6 digit, TTL 5 menit, maksimal 5 percobaan per OTP |
| Insider misuse | Admin mengunduh massal KTP | Audit download, alert jika unduhan > 30 per jam per user (TBD) |

## 3. Security Headers

`Strict-Transport-Security`, `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` minimal.

## 4. Incident Response

1. Deteksi dari alert (OBSERVABILITY.md).
2. Containment: revoke session, rotasi secret, blok akun.
3. Investigasi dari audit log dan log aplikasi.
4. Notifikasi: kewajiban pemberitahuan kegagalan pelindungan data pribadi menurut UU PDP (LEGAL_REVIEW_REQUIRED untuk tenggat dan pihak yang diberi tahu).
5. Post-mortem dan perbaikan.

## 5. Security Testing

Lihat TESTING_STRATEGY.md bagian Security. Penetration test eksternal wajib sebelum Phase 14.

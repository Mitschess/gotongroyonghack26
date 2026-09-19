# Testing Strategy

## 1. Piramida dan Tools

| Level | Cakupan | Tools |
|---|---|---|
| Unit | Business calendar, SLA calculator, state machine guard, risk formula, resolver WhatsApp, permission policy | Vitest |
| Integration | Repository + PostgreSQL nyata, outbox, consumer idempotency | Vitest + Testcontainers |
| API | Kontrak endpoint, validasi, error code, rate limit | Supertest + OpenAPI schema check |
| Permission | Matrix AUTHORIZATION.md diuji otomatis per endpoint dan per role | Generator test dari `permissions.ts` |
| Webhook | Signature, duplikat, urutan terbalik, payload rusak | Fixture provider + replay |
| E2E | Alur utama per role | Playwright |
| Security | SAST, dependency scan, DAST, pentest eksternal | Semgrep, audit dependency, OWASP ZAP |
| Load | Dashboard, webhook burst, upload | k6 |

Target coverage: 90% baris untuk modul `sla`, `workflow`, `payment`, `authorization`. Modul lain 70%. Coverage bukan tujuan utama. Skenario kritis di bawah wajib ada.

## 2. Skenario Kritis

| TC | Requirement | Skenario | Hasil yang diharapkan |
|---|---|---|---|
| TC-001 | FR-PAY-003 | Webhook PAID dikirim 3 kali paralel | 1 payment PAID, 1 project, 1 notifikasi |
| TC-002 | FR-PAY-002 | Webhook dengan signature salah | 401, tidak ada perubahan status |
| TC-003 | FR-PAY-002 | Webhook PAID dengan nominal berbeda | Status tetap, alert, audit PAYMENT_AMOUNT_MISMATCH |
| TC-004 | FR-PAY-004 | Webhook PAID setelah order EXPIRED | Order PAID, project dibuat, alert late payment |
| TC-005 | FR-PAY-002 | Client memanggil redirect sukses tanpa webhook | Status tetap PENDING |
| TC-006 | FR-TASK-002 | Notary upload DRAFT_DEED via web pada task OPEN | Dokumen VERIFIED, task COMPLETED, task review Client OPEN, audit tercatat |
| TC-007 | FR-DOC-003 | Dokumen WhatsApp dengan confidence 0.72 | NEEDS_REVIEW, task tidak berubah |
| TC-008 | FR-WA-004 | Notary dengan 3 project aktif kirim PDF tanpa kode | ASK_USER, dokumen PENDING_RESOLUTION |
| TC-009 | FR-WA-004 | Notary kirim kode project milik Notary lain | Dokumen tidak masuk project itu, audit SECURITY_SUSPICIOUS_REFERENCE |
| TC-010 | FR-DOC-002 | Upload PDF berisi JavaScript | Ditolak |
| TC-011 | FR-DOC-002 | Upload file EICAR test | QUARANTINED, tidak dapat diunduh |
| TC-012 | FR-DOC-005 | Upload file sama dua kali | Kedua ditolak DUPLICATE_FILE |
| TC-013 | FR-SLA-001 | Task dibuka Jumat 16:00, target 8 business hours, Senin libur | Due Selasa 16:00 |
| TC-014 | FR-SLA-004 | Project blocked_on CLIENT selama 2 bd | Project Clock tidak bertambah selama 2 bd itu |
| TC-015 | FR-SLA-005 | Project elapsed 2.0 bd | Health WARNING, satu notif SLA_WARNING, evaluasi ulang tidak mengirim ulang |
| TC-016 | FR-ESC-001 | Task Notary breach, tidak selesai 1 bd | Eskalasi L1, L2, L3 masing-masing satu kali |
| TC-017 | FR-ESC-004 | Task selesai saat eskalasi L2 terbuka | Semua eskalasi task AUTO_RESOLVED |
| TC-018 | FR-PROJECT-006 | Transisi DATA_COLLECTION ke IN_PROGRESS via API | 409 INVALID_STATE_TRANSITION |
| TC-019 | AUTHZ-001 | Notary A GET project Notary B | 404 |
| TC-020 | FR-MSG-002 | Client GET conversation PROJECT_INTERNAL | 404 |
| TC-021 | FR-WA-005 | Client kirim teks ke Notary via WhatsApp | Notary menerima relay tanpa nomor Client |
| TC-022 | FR-DELIV-002 | WhatsApp gagal saat delivery | Email terkirim, project DELIVERED |
| TC-023 | FR-DELIV-001 | Semua channel gagal | Project tetap COMPLETED, eskalasi L2 |
| TC-024 | FR-AUDIT-004 | UPDATE langsung ke audit_logs | Ditolak trigger |
| TC-025 | FR-AUDIT-004 | Ubah satu baris lewat superuser DB di environment uji | verify-chain mendeteksi |
| TC-026 | FR-WF-001 | Publikasi template v2 saat project v1 berjalan | Project lama tetap v1 |
| TC-027 | FR-WF-004 | Client minta revisi draft | Task upload draft reopen, revision_count 1 |
| TC-028 | FR-DOC-004 | Notary upload draft baru setelah Client setuju | Task review Client reopen |
| TC-029 | FR-PROJECT-007 | Reassign Notary | Notary lama 404 pada project, Notary baru melihat histori |
| TC-030 | FR-AUTH-006 | Disable user dengan session aktif | Request berikutnya 401 |
| TC-031 | BR-DOC-003 | Final QA approve tanpa membuka dokumen | 422 DOCUMENTS_NOT_VIEWED |
| TC-032 | FR-NOTIF-004 | 10 event SLA_WARNING sama dalam 1 jam | 1 notifikasi |
| TC-033 | FR-TASK-005 | Event task.completed diproses dua kali | Satu transisi, satu audit |
| TC-034 | FR-RISK-001 | Faktor contoh | Skor sesuai formula |
| TC-035 | FR-SEARCH-001 | Admin filter `GET /projects?health=CRITICAL&serviceType=PT` | Hanya project scoped yang cocok, cursor valid |
| TC-036 | FR-AUTH-004 | Reset password dengan token kedua kalinya, dan setelah 31 menit | Keduanya ditolak. Reset pertama mencabut semua session |
| TC-037 | FR-PROJECT-003 | Admin menolak satu item data | Project kembali DATA_COLLECTION, hanya task terkait reopen |
| TC-038 | FR-PRIV-002 | Notary PENDING_ACCEPTANCE GET company-data | 404. Setelah accept: 200 dan audit IDENTITY_DATA_VIEWED |
| TC-039 | FR-TASK-006 | Task Client elapsed 2 bd | Satu follow-up task Admin dibuat, tidak ada eskalasi ke SA |
| TC-040 | FR-PROJECT-010 | SA override ke DELIVERED tanpa Final QA | 409 INVALID_STATE_TRANSITION. Guard integritas tetap berlaku untuk override |
| TC-041 | EC-31 | `task.completed` diproses sebelum `document.verified` tersimpan | Consumer menunda dan retry. Hasil akhir satu transisi |

## 3. Load Test

| Skenario | Beban awal | Kriteria lulus |
|---|---|---|
| Dashboard Admin | 50 user konkuren | p95 < 800 ms |
| Webhook burst | 100 request per detik selama 1 menit | 0 kehilangan event, respons p95 < 500 ms |
| Upload intent | 20 per detik | p95 < 500 ms |
| sla.evaluate | 5.000 task aktif | Selesai < 60 detik |

Angka beban adalah `ASSUMPTION A-013` (skala awal). Ulang setelah volume bisnis diketahui.

## 4. Environment Uji

- Sandbox payment gateway dan provider WhatsApp test number.
- Fake provider in-memory untuk unit dan integration test.
- Seed data: 2 Admin, 3 Notary, 10 Client, 30 project di berbagai status.
- Clock injection (`Clock` interface) agar test SLA deterministik.

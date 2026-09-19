# Development Readiness Report (Phase 5)

| Atribut | Nilai |
|---|---|
| Tanggal | 2026-09-19 |
| Basis | Dokumentasi v1.0.0 setelah CONSISTENCY_AUDIT.md |
| Kesimpulan | Phase 0 sampai Phase 5 dapat dimulai sekarang. Phase 3 (Payment) dan Phase 9 (WhatsApp) terblokir keputusan provider. Go-live terblokir tinjauan hukum LR-01, LR-04, LR-10. |

## 1. Ready

Bagian berikut cukup jelas untuk mulai coding tanpa keputusan tambahan.

| Area | Alasan siap | Dokumen acuan |
|---|---|---|
| Monorepo, CI, environment lokal | Stack baseline, struktur folder, env variable, dan validasi Zod sudah ditetapkan | SYSTEM_ARCHITECTURE, ENVIRONMENT_VARIABLES, DEPLOYMENT |
| Enum dan skema database | DDL lengkap, constraint kritis, konvensi ID dan waktu | BUSINESS_RULES, DATABASE_SCHEMA, ERD |
| Auth, session, RBAC, scope data | Matriks izin lengkap, aturan 404, kontrol session dan reset password | AUTHORIZATION, SECURITY |
| State machine semua entitas | Transisi valid, invalid, actor, trigger, side effect, guard override | STATE_MACHINE |
| Workflow engine dan template PT/CV v1 | Struktur DAG, mode completion, contoh YAML. Isi tahap tetap menunggu LR-01 tetapi engine tidak bergantung padanya | WORKFLOW |
| Business calendar dan SLA calculator | Fungsi, dua clock, pause, threshold, kasus uji TC-013 sampai TC-015 | SLA_ENGINE |
| Document pipeline jalur web | Validasi, scan, versioning, dedup, 6 syarat auto-verify, review queue | DOCUMENT_MANAGEMENT |
| Audit log append-only | Struktur, katalog action, trigger penolakan UPDATE/DELETE | AUDIT_LOG |
| Outbox, event, dan background job | Katalog 31 event, 22 job dengan retry, timeout, idempotensi | EVENT_ARCHITECTURE |
| Notifikasi in-app dan email | Interface channel, dedup, fallback | NOTIFICATION_SYSTEM |
| Eskalasi | 11 aturan, lifecycle, unique index | ESCALATION_ENGINE |
| Dashboard dan UX per role | IA, wireframe, label Client, state wajib, token desain | UX_SPECIFICATION, DESIGN_SYSTEM |
| Kontrak API | Katalog endpoint, kontrak detail endpoint kritis, format error | API_SPECIFICATION, ERROR_HANDLING |

## 2. Needs Decision

| ID | Keputusan | Memblokir | Batas waktu disarankan | Default jika tidak diputuskan |
|---|---|---|---|---|
| RBD-01 | Payment gateway | Phase 3 | Minggu 2 | Tidak ada default. Wajib diputuskan. |
| RBD-02 | Provider WhatsApp dan anggaran pesan | Phase 9 | Minggu 6 | MVP tanpa WhatsApp (email dan in-app) |
| RBD-03 | Cloud provider dan region | Phase 0 staging | Minggu 1 | Region Jakarta pada provider terkelola |
| RBD-04 | Kebijakan refund per stage | FR-PAY-006 | Minggu 8 | Refund manual kasus per kasus oleh SA |
| RBD-05 | Delivery sebagai lampiran WhatsApp atau link portal | FR-DELIV-003 | Minggu 10 | Link portal saja |
| RBD-06 | Eskalasi L3 di luar jam kerja | ESC-R03, ESC-R07 | Minggu 10 | Ditahan sampai jam kerja berikutnya |
| RBD-07 | Definisi janji 5 hari ke Client (Q-001) | Copy UX, SLA policy | Minggu 4 | Dari validasi data (A-007) |
| RBD-08 | Stack Option A atau B | Phase 0 | Minggu 1 | Option A (TypeScript) |
| RBD-09 | Pajak dan format invoice | FR-PAY-007 | Minggu 12 | Invoice sederhana tanpa faktur pajak |
| Q-002 | Batas revisi draft | FR-WF-004 | Minggu 6 | 3 kali |
| Q-003 | Admin upload atas nama Notary | Permission upload | Minggu 6 | Boleh dengan `on_behalf_of` |

## 3. Needs Validation

| ID | Validasi teknis | Cara | Kriteria lulus |
|---|---|---|---|
| TV-01 | Kemampuan provider WhatsApp: template, jendela layanan, relay teks bebas, retensi media | Sandbox provider, dokumentasi resmi | Semua template MVP disetujui, relay teks bebas dalam jendela layanan berfungsi |
| TV-02 | Signature dan retry webhook payment | Sandbox gateway | Signature terverifikasi, retry teramati, TC-001 sampai TC-005 lulus |
| TV-03 | Laporan settlement untuk rekonsiliasi | Sandbox atau dokumen API gateway | Job rekonsiliasi dapat mencocokkan 100% transaksi uji |
| TV-04 | Akurasi classifier | 200 dokumen sampel berlabel | Precision >= 98% pada confidence >= 0.90 |
| TV-05 | Grouping per aggregate di BullMQ | Spike 2 hari | Event satu project diproses berurutan |
| TV-06 | Parameter argon2id | Benchmark hardware produksi | Hash 250 sampai 500 ms |
| TV-07 | Object lock/WORM di storage | Uji provider terpilih | Arsip audit tidak dapat dihapus selama periode retensi |
| TV-08 | Integrasi sistem pemerintah | Riset jalur resmi | Di luar MVP |

## 4. Legal Review

Tidak ada persyaratan hukum yang dikarang dalam dokumentasi ini. Semua butir berikut wajib ditinjau konsultan hukum atau Notaris mitra.

| ID | Butir | Dampak ke sistem | Wajib sebelum |
|---|---|---|---|
| LR-01 | Urutan tahap pendirian PT dan CV, dokumen wajib, deliverable | Isi template workflow | Go-live |
| LR-02 | Mekanisme penandatanganan akta dan kehadiran penghadap | Stage SIGNING | Go-live |
| LR-03 | Batas wilayah jabatan Notary terhadap domisili | Aturan usulan Notary | Go-live |
| LR-04 | Peran pengendali dan prosesor data (UU 27/2022) | Consent, kontrak Notary, PRIVACY | Go-live |
| LR-05 | Pendaftaran PSE lingkup privat | Operasional | Go-live |
| LR-06 | Pemrosesan data oleh provider luar negeri (email, AI) | Pilihan provider, FR-AI-003 | Aktivasi AI dan pemilihan email provider |
| LR-07 | Retensi dokumen, audit log, hak penghapusan | Job retensi | Phase 13 |
| LR-08 | Kerahasiaan Notary dan akses data sebelum accept | FR-PRIV-002 | Go-live |
| LR-09 | Prosedur pemberitahuan kegagalan pelindungan data | Incident response | Go-live |
| LR-10 | Teks consent dan kebijakan privasi | FR-PRIV-001 | Go-live |
| LR-11 | Aturan dan jumlah usulan nama perusahaan | Form data perusahaan | Phase 4 |

## 5. Integration Dependency

| Integrasi | Interface | Dibutuhkan untuk | Alternatif jika terlambat |
|---|---|---|---|
| Payment gateway | `PaymentProvider` | Phase 3, P0 | Tidak ada. Konfirmasi manual melanggar BR-PAY-001. |
| Email transaksional | `NotificationChannel` (EMAIL) | Phase 1 (verifikasi email), P0 | Provider kedua sebagai cadangan |
| Object storage S3-compatible | `StorageProvider` | Phase 5, P0 | MinIO untuk staging |
| Malware scanner | `MalwareScanner` (ClamAV) | Phase 5, P0 | Tidak ada. Tanpa scan, dokumen tidak boleh diunduh. |
| WhatsApp Business Platform | `WhatsAppProvider` | Phase 9, P1 | Email dan in-app |
| Document classifier / OCR | `DocumentClassifier`, `OcrExtractor` | Phase 12, P1-P2 | Review manual |
| KMS | Envelope encryption | Phase 1 (secret MFA), P0 | KMS provider cloud terpilih |

## 6. Highest Risks

| # | Risiko | Kemungkinan | Dampak | Mitigasi | Pemilik |
|---|---|---|---|---|---|
| 1 | Template workflow tidak sesuai praktik hukum (LR-01 terlambat) | Sedang | Tinggi: workflow harus dirombak | Engine tidak bergantung pada isi template. Template divalidasi Notaris mitra di Phase 4. | Product + Notaris mitra |
| 2 | Notary mitra menolak memakai platform (R-02) | Sedang | Tinggi: automation tidak berjalan | Uji coba dengan 1-2 Notary di Phase 6. UX mobile minimal. WhatsApp inbound di P1. | Product |
| 3 | Persetujuan WhatsApp Business dan template tertunda (R-04) | Tinggi | Sedang: channel utama Indonesia belum ada | MVP tidak bergantung pada WhatsApp. Ajukan verifikasi bisnis di minggu 1. | Bisnis |
| 4 | Kebocoran dokumen identitas (R-06) | Rendah | Sangat tinggi: sanksi UU PDP, reputasi | Bucket privat, signed URL, scope 404, audit unduhan, pentest eksternal | Security |
| 5 | Salah hitung SLA menimbulkan eskalasi palsu | Sedang | Sedang: user mengabaikan peringatan | Unit test calendar ekstensif, alert kalender libur kosong (EC-30), dedup | Engineering |
| 6 | Webhook ganda atau tidak berurutan membuat data ganda (R-05) | Sedang | Tinggi: project atau pembayaran ganda | Unique constraint, inbox table, state guard, TC-001, TC-041 | Engineering |
| 7 | Target 5 hari tidak realistis (R-01) | Tinggi | Sedang: compliance rendah | Pause EXTERNAL_DEPENDENCY, RBD-07, kalibrasi setelah 3 bulan | Bisnis |
| 8 | Klasifikasi AI keliru menyelesaikan task (R-09) | Rendah (flag mati default) | Tinggi | `FEATURE_AUTO_VERIFY` mati sampai TV-04 lulus. Final QA manusia. | Engineering |
| 9 | Kewajiban UU PDP belum dipetakan (R-07) | Sedang | Tinggi | LR-04, LR-10 wajib sebelum go-live | Legal |
| 10 | Tim kecil mengerjakan 14 fase dalam 20 minggu | Sedang | Sedang: go-live mundur | Potong P1 dari rilis pertama. Phase 11 dan 12 setelah go-live. | Engineering lead |

## 7. Recommended Development Order

1. Phase 0: repo, CI, staging, `packages/shared` enum, migrasi awal. Jalankan skrip audit dokumen di CI (CA-R05).
2. Phase 1: auth, session, RBAC, scope guard, audit log append-only. Audit dibangun di sini karena semua modul memanggilnya.
3. Business calendar sebagai library murni dengan TC-013. Dipakai oleh Phase 4 dan 10.
4. Phase 2 dan 3: katalog, order, consent, payment adapter, webhook inbox, rekonsiliasi. Kerjakan TV-02 paralel.
5. Phase 4: project, workflow engine, task engine, state machine, assignment admin.
6. Phase 5: document pipeline web, malware scan, versioning, review queue, auto-complete DECLARED.
7. Phase 10 inti: SLA evaluate, health, reminder, eskalasi, delivery dan fallback. Dimajukan sebelum dashboard karena Today's Actions membutuhkan health.
8. Phase 6 dan 7: Notary workspace, Admin dashboard, Final QA, Communication Center in-app.
9. Phase 8: Super Admin dashboard dasar, konfigurasi SLA dan kalender, pencarian audit.
10. Phase 13 sebagian: pentest, MFA SA, alert, uji restore. Lalu Phase 14: go-live MVP P0 dengan feature flag WhatsApp dan AI mati.
11. Pasca-go-live: Phase 9 (WhatsApp) setelah TV-01, Phase 11 (analytics, risk score), Phase 12 (classifier) setelah TV-04, MFA wajib Admin.

## 8. Checklist Mulai Sprint 1

- [ ] RBD-01, RBD-03, RBD-08 diputuskan.
- [ ] Verifikasi bisnis WhatsApp diajukan (lead time di luar kendali tim).
- [ ] Notaris mitra ditunjuk untuk validasi LR-01 dan uji coba Phase 6.
- [ ] Konsultan hukum ditunjuk untuk LR-04 dan LR-10.
- [ ] Baseline operasional diukur: jumlah project per bulan, durasi rata-rata, jam kerja Admin per project (PRD bagian 2).

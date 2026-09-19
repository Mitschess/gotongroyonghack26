# Cross-Document Consistency Audit (Phase 4)

| Atribut | Nilai |
|---|---|
| Tanggal audit | 2026-09-19 |
| Cakupan | 41 dokumen di `/docs` |
| Metode | Pemeriksaan otomatis (skrip grep lintas file) dan tinjauan manual per pasangan dokumen |
| Hasil | 15 temuan. 15 diselesaikan. 0 terbuka. |

## 1. Metode

Audit menelusuri rantai berikut sesuai master prompt bagian 62:

```text
PRD <-> Business Rules <-> Workflow <-> State Machine <-> Database <-> API <-> Permissions <-> UX <-> Testing
```

| Pemeriksaan | Cara | Hasil |
|---|---|---|
| Setiap ID FR/NFR yang dirujuk di dokumen mana pun terdefinisi di PRD | Skrip: ekstrak semua `FR-*`/`NFR-*`, bandingkan dengan tabel PRD | 129 ID terdefinisi, 0 rujukan yatim |
| Setiap TC di PRD ada di TESTING_STRATEGY | Skrip | 0 hilang |
| Setiap AC yang dirujuk user story terdefinisi | Skrip | 0 hilang |
| Setiap BR yang dirujuk PRD ada di BUSINESS_RULES atau USER_ROLES | Skrip | 0 hilang |
| Setiap nama event di dokumen mana pun ada di katalog EVENT_ARCHITECTURE | Skrip | 3 selisih (CA-01, CA-02, CA-03) |
| Enum di DATABASE_SCHEMA memakai tipe dari BUSINESS_RULES | Manual | Konsisten |
| Kode audit dan kode error di PRD ada di katalog kanonik | Manual | 3 selisih (CA-14) |
| Izin per fitur: AUTHORIZATION vs API vs UX | Manual | 3 selisih (CA-09, CA-10, CA-11) |
| Prioritas MVP vs perilaku default konfigurasi | Manual | 3 selisih (CA-04, CA-05, CA-06) |

## 2. Temuan dan Resolusi

| ID | Konflik | Penyebab | Solusi terpilih | Dokumen diperbarui |
|---|---|---|---|---|
| CA-01 | WORKFLOW memakai event `company_data.submitted`. EVENT_ARCHITECTURE mendaftar `client.data.submitted`. | Nama event di master prompt (`client.data.completed`) diadaptasi berbeda di dua dokumen. | `company_data.submitted` menjadi nama kanonik. Nama menyebut entitas yang berubah, sesuai pola `<entity>.<past_verb>`. | EVENT_ARCHITECTURE.md |
| CA-02 | STATE_MACHINE memakai `final_qa.rejected` sebagai trigger FINAL_REVIEW -> IN_PROGRESS. Event tidak ada di katalog. | Katalog hanya mendaftar jalur sukses Final QA. | Tambah `final_qa.rejected` (producer Project, consumer Workflow dan Notification). | EVENT_ARCHITECTURE.md |
| CA-03 | SLA_ENGINE menyebut job `sla.reminder.dispatch`. Tabel background job memakai `reminder.dispatch`. | Penamaan ditulis sebelum tabel job final. | `reminder.dispatch` kanonik. SLA_ENGINE merujuk EVENT_ARCHITECTURE. | SLA_ENGINE.md |
| CA-04 | CLIENT_CADENCE mengirim reminder via template WhatsApp, padahal WhatsApp berada di P1. | SLA dirancang untuk kondisi penuh, bukan kondisi MVP. | Reminder P0 memakai email dan in-app. WhatsApp aktif saat flag `FEATURE_WA_OUTBOUND=true`. | SLA_ENGINE.md |
| CA-05 | `FEATURE_AUTO_VERIFY` default `false` akan mematikan auto-complete dari slot web, padahal fitur itu P0. | Flag tidak menyebut jalur mana yang dikendalikan. | Flag hanya mengendalikan auto-verify berbasis CLASSIFIER. Jalur DECLARED via slot web selalu aktif. | ENVIRONMENT_VARIABLES.md, DOCUMENT_MANAGEMENT.md |
| CA-06 | Tidak ada flag untuk WhatsApp keluar. `FEATURE_WA_RELAY` hanya mencakup relay. | Pemisahan notifikasi keluar dan inbound belum dimodelkan. | Tambah `FEATURE_WA_OUTBOUND`. Deskripsi `FEATURE_WA_RELAY` dipertegas. PRD merujuk kedua flag. | ENVIRONMENT_VARIABLES.md, PRD.md |
| CA-07 | STATE_MACHINE mengizinkan Super Admin memaksa transisi apa pun. BR-DOC-003 mewajibkan Final QA manusia sebelum delivery. Override dapat melewati gerbang ini. | Override dirancang sebagai jalan darurat tanpa batas. | Override tetap ada dengan guard: COMPLETED hanya jika Final QA tercatat, DELIVERED tidak pernah lewat override, status terminal tidak dapat diubah. | STATE_MACHINE.md, PRD.md (FR-PROJECT-010), TESTING_STRATEGY.md (TC-040) |
| CA-08 | TC-033 (event ganda) terpetakan ke EC-31 (event tidak berurutan). EC-31 tidak punya skenario uji sendiri. Beberapa FR P0 belum punya TC. | Skenario ditulis sebelum ID FR final. | TC-033 dipetakan ke FR-TASK-005. Tambah TC-035 sampai TC-041 untuk FR-SEARCH-001, FR-AUTH-004, FR-PROJECT-003, FR-PRIV-002, FR-TASK-006, FR-PROJECT-010, EC-31. | TESTING_STRATEGY.md |
| CA-09 | AUTHORIZATION memberi Client dan Notary akses audit "aktivitas sendiri". UX menutup tab Audit untuk keduanya. | Dua dokumen memakai unit berbeda: izin data vs tab UI. | Audit aktivitas sendiri tampil di halaman akun "Aktivitas Saya", bukan tab Audit project. | UX_SPECIFICATION.md |
| CA-10 | AUTHORIZATION memberi Admin analytics terbatas (metrik pribadi). `GET /analytics/metrics` hanya untuk SA. | Endpoint untuk metrik pribadi tidak disebut. | Metrik pribadi Admin disajikan lewat `GET /dashboards/admin`. | API_SPECIFICATION.md |
| CA-11 | Master prompt bagian 33 mewajibkan search dan filter 10 dimensi. API tidak mendefinisikan parameter `GET /projects`. | Katalog endpoint belum memuat kontrak query. | Tambah kontrak `GET /projects` dengan 12 parameter dan aturan scope. Tambah FR-SEARCH-001. | API_SPECIFICATION.md, PRD.md |
| CA-12 | PRD FR-AUTH-004 menetapkan token reset 30 menit dan pencabutan session. SECURITY tidak memuat aturan reset password. | Kontrol reset dianggap implisit. | Tambah baris "Password reset" di tabel kontrol SECURITY. | SECURITY.md |
| CA-13 | README mendaftar NOTIFICATION_SYSTEM.md dua kali (#10 dan #21). README menyebut EDGE_CASES berisi 24 kasus, padahal 31. | Indeks ditulis sebelum dokumen final. | Hapus entri duplikat. Perbarui jumlah edge case. | README.md |
| CA-14 | Draft AC PRD memakai `DOCUMENT_REVIEWED`, `VALIDATION_ERROR`, `DATA_SUBJECT_REQUEST_CREATED`. Kode kanonik: `DOCUMENT_VERIFIED`, `REASON_REQUIRED`, `PRIVACY_REQUEST_CREATED`. | Penulisan AC tidak merujuk katalog. | AC diperbaiki ke kode kanonik saat penulisan PRD. | PRD.md |
| CA-15 | Draft AC-006 memakai label Client yang tidak ada di tabel mapping UX. | Label ditulis bebas. | AC memakai label dari UX_SPECIFICATION bagian mapping. | PRD.md |

## 3. Pemeriksaan yang Konsisten (Tanpa Perubahan)

| Area | Dokumen dibandingkan | Temuan |
|---|---|---|
| `project_status` | BUSINESS_RULES, STATE_MACHINE, DATABASE_SCHEMA, UX mapping | 8 nilai sama. Status master prompt (ESCALATED, WAITING_CLIENT, WAITING_NOTARY, PAYMENT_PENDING) sudah dipindah ke `is_escalated`, `blocked_on`, dan `order_status` (K-02, K-03). |
| Satu project per order | BR-PROJECT-001, unique `projects.order_id`, TC-001 | Konsisten |
| Satu eskalasi terbuka per task per level | BR-ESC-001, unique index `ux_esc_task_level`, TC-016 | Konsisten |
| Threshold SLA project | SLA_ENGINE (Day 3 = WARNING pada 2 bd), TC-015, PRD FR-SLA-005 | Konsisten |
| Threshold classifier 0.90 | DOCUMENT_MANAGEMENT, AI_FEATURES, ENVIRONMENT_VARIABLES | Konsisten |
| Final QA | WORKFLOW (owner ADMIN), AUTHORIZATION (SA, Admin assigned), API (`/final-qa` Admin assigned, SA), BR-DOC-003, TC-031 | Konsisten |
| Visibilitas internal note | BR-MSG-001, AUTHORIZATION, API (PROJECT_INTERNAL tertutup Client), UX tab Communication, TC-020 | Konsisten |
| Payment hanya dari webhook | BR-PAY-001, PAYMENT_SYSTEM, API, TC-005 | Konsisten |
| Akses Notary sebelum accept | AUTHORIZATION (setelah accept), PRIVACY, PRD FR-PRIV-002, TC-038 | Konsisten |
| Delivery tetap COMPLETED jika semua channel gagal | STATE_MACHINE, EDGE_CASES EC-24, ESC-R09, TC-023 | Konsisten |

## 4. Aturan Pencegahan Drift

| ID | Aturan |
|---|---|
| CA-R01 | Enum hanya ditambah di BUSINESS_RULES.md lalu `packages/shared/src/enums.ts`. CI gagal jika migrasi memakai nilai di luar file tersebut. |
| CA-R02 | Event baru wajib masuk katalog EVENT_ARCHITECTURE.md sebelum dipakai di dokumen atau kode. |
| CA-R03 | Kode error dan action audit baru wajib masuk ERROR_HANDLING.md dan AUDIT_LOG.md. |
| CA-R04 | Setiap FR baru wajib punya kolom Verifikasi. FR P0 wajib punya TC sebelum sprint dimulai. |
| CA-R05 | Skrip audit di bagian 1 dijalankan di CI pada setiap perubahan `/docs`. |

## 5. Final Self-Review

| Review | Pertanyaan master prompt | Jawaban | Bukti |
|---|---|---|---|
| Product | Apakah produk menyelesaikan masalah bisnis? | Ya untuk P1-P6. Nilai baseline belum diukur, sehingga dampak kuantitatif belum dapat dibuktikan. | PRD bagian 2 dan 4 |
| UX | Apakah setiap role tahu apa yang harus dilakukan? | Ya. Empat dashboard berbeda. Today's Actions dan `/me/todos` terurut prioritas. | UX_SPECIFICATION, AC-008, AC-013 |
| Architecture | Scalable dan maintainable? | Modular monolith cukup untuk 10x volume asumsi. Batas modul memungkinkan ekstraksi layanan. | SYSTEM_ARCHITECTURE, NFR-SCALE-001 |
| Security | Dokumen sensitif aman? | Bucket privat, signed URL pendek, malware scan, audit unduhan, 404 untuk resource di luar scope. Pentest wajib sebelum rilis. | SECURITY, NFR-SEC-002 |
| Automation | Ada fallback? | Setiap syarat auto-verify yang gagal menghasilkan NEEDS_REVIEW. Worker gagal masuk DLQ dan alert. | DOCUMENT_MANAGEMENT bagian 5, ERROR_HANDLING |
| Workflow | Semua transisi valid? | Matriks eksplisit untuk 7 entitas dengan transisi invalid tertulis. Override kini dibatasi guard (CA-07). | STATE_MACHINE |
| SLA | Reminder dan eskalasi tidak mudah salah? | Business calendar, dua clock, pause eksplisit, threshold idempotent. Risiko sisa: kalender libur tidak diisi (EC-30). | SLA_ENGINE, TC-013 sampai TC-015 |
| WhatsApp | Webhook dan routing aman? | Signature HMAC, inbox idempotent, resolusi 4 langkah dengan pemeriksaan scope, nomor tidak dikenal tidak diteruskan. | WHATSAPP_INTEGRATION, TC-008, TC-009 |
| Payment | Tidak dapat dipalsukan? | Status hanya dari webhook terverifikasi atau query server-side, validasi nominal, idempotensi, rekonsiliasi. | PAYMENT_SYSTEM, TC-001 sampai TC-005 |
| AI | Tidak mengambil keputusan legal? | AI hanya memberi tipe dan confidence. Dokumen legal-critical selalu melewati Final QA manusia. | AI_FEATURES, BR-AI-001..003 |
| QA | Setiap requirement punya skenario uji? | Semua FR punya kolom Verifikasi. FR P0 kritis punya TC. FR lain punya level uji dan TC ditulis per sprint (CA-R04). | PRD Lampiran A, TESTING_STRATEGY |

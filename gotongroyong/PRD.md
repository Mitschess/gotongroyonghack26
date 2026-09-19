# Product Requirements Document (PRD)

| Atribut | Nilai |
|---|---|
| Produk | Legality Workflow Management Platform (PT/CV) |
| Versi dokumen | 1.0.0 |
| Tanggal | 2026-09-19 |
| Status | Baseline untuk pengembangan MVP |
| Otoritas | Dokumen induk requirement. Jika konflik dengan enum atau transisi, `BUSINESS_RULES.md` dan `STATE_MACHINE.md` yang berlaku (lihat `README.md`). |

Dokumen ini mendefinisikan APA yang dibangun dan MENGAPA. Detail teknis BAGAIMANA ada di dokumen rujukan pada setiap bagian. Setiap requirement memiliki ID unik dan jalur verifikasi.

---

## 1. Executive Summary

Perusahaan penyedia jasa legalitas saat ini mengelola pendirian PT dan CV melalui spreadsheet, grup WhatsApp, dan follow-up manual. Admin menghabiskan waktu untuk mengecek status. Keterlambatan baru terlihat setelah Client mengeluh.

Platform ini mengganti proses tersebut dengan satu sistem yang:

1. Membuat project otomatis dari pembayaran terverifikasi.
2. Menjalankan workflow berversi yang berbeda untuk PT dan CV.
3. Menyelesaikan task dari event dan dokumen terverifikasi, bukan dari checkbox manual.
4. Menghitung SLA dengan business calendar dan dua clock resmi (Task Clock, Project Clock).
5. Mengirim reminder dan eskalasi bertingkat secara otomatis.
6. Menjadi proxy komunikasi WhatsApp sehingga Client dan Notary tidak berada dalam satu grup.
7. Mengirim dokumen final melalui link portal yang aman setelah Final QA manusia.
8. Mencatat seluruh aktivitas penting dalam audit log append-only.

Baseline arsitektur: modular monolith TypeScript (Next.js, NestJS, BullMQ, PostgreSQL, Redis, object storage privat). Lihat `SYSTEM_ARCHITECTURE.md`. Target go-live MVP: minggu 18 sampai 20 (`IMPLEMENTATION_PLAN.md`).

## 2. Problem Statement

| ID | Masalah | Dampak terukur | Bukti di requirement |
|---|---|---|---|
| P1 | Status project tersebar di spreadsheet dan chat | Tidak ada satu sumber status. Admin mengecek manual. | Master prompt bagian 1 |
| P2 | Admin memeriksa setiap dokumen dan checklist secara manual | Waktu Admin habis untuk verifikasi, bukan koordinasi | Bagian 2.2 |
| P3 | Grup WhatsApp per project mempertemukan Client dan Notary | Nomor pribadi terbuka, komunikasi sulit diaudit | Bagian 8 |
| P4 | Keterlambatan baru diketahui setelah menjadi masalah | SLA 5 hari terlewati tanpa peringatan dini | Bagian 10, 12 |
| P5 | Dokumen final dikirim manual | Risiko salah kirim dan kebocoran dokumen legal | Bagian 57 |
| P6 | Tidak ada jejak siapa melakukan apa | Sengketa internal dan eksternal sulit ditelusuri | Bagian 21 |

Nilai baseline (jumlah project per bulan, rata-rata durasi saat ini, jam kerja Admin per project) belum tersedia. `TBD: Requires business validation`. Nilai ini wajib diukur sebelum go-live agar Goals bagian 4 dapat dievaluasi.

## 3. Vision

Setiap pihak membuka platform dan langsung tahu apa yang harus dilakukan. Status berubah dari bukti, bukan dari input manual. Tidak ada project yang terlambat tanpa diketahui.

Detail: `PRODUCT_OVERVIEW.md`.

## 4. Goals

| ID | Goal | Metrik (definisi di `ANALYTICS.md`) | Target awal |
|---|---|---|---|
| G-01 | Menghapus spreadsheet dan grup WhatsApp sebagai alat kerja utama | Persentase project aktif yang dikelola penuh di platform | 100% project baru sejak go-live |
| G-02 | Mendeteksi keterlambatan sebelum breach | Persentase project breach yang telah berstatus WARNING minimal 1 bd sebelumnya | >= 95% |
| G-03 | Meningkatkan kepatuhan SLA | SLA compliance project | TBD: Requires business validation (baseline belum diukur) |
| G-04 | Mengurangi kerja verifikasi manual Admin | Persentase task EVIDENCE yang selesai tanpa force-complete | TBD setelah 3 bulan data |
| G-05 | Pengiriman dokumen final aman dan terlacak | Persentase delivery dengan konfirmasi dan audit | 100% |
| G-06 | Seluruh perubahan status dapat diaudit | Persentase perubahan status entitas utama yang memiliki entri audit | 100% |

## 5. Non-goals

| ID | Bukan tujuan MVP | Alasan |
|---|---|---|
| NG-01 | Memberikan nasihat atau keputusan hukum otomatis | AI hanya helper (BR-AI-001) |
| NG-02 | Integrasi langsung ke sistem pemerintah (AHU, OSS) | Jalur integrasi resmi belum tervalidasi (TV-08) |
| NG-03 | Tanda tangan elektronik akta | LEGAL_REVIEW_REQUIRED |
| NG-04 | Multi-tenant untuk banyak perusahaan penyedia | A-001 single-tenant |
| NG-05 | Payout atau komisi Notary | Q-005 |
| NG-06 | Layanan legalitas selain PT dan CV | Fokus MVP |
| NG-07 | Aplikasi mobile native | Web responsif cukup untuk Client mobile |
| NG-08 | Microservices, Kubernetes, event bus terdistribusi | Prinsip Do Not Overengineer |

## 6. Target Users

| Role | Jumlah perkiraan | Perangkat utama | Kebutuhan inti |
|---|---|---|---|
| Super Admin | 1 sampai 5 | Desktop | Monitoring, risiko, SLA, konfigurasi |
| Admin | 2 sampai 20 | Desktop | Daftar tindakan harian berprioritas |
| Client | Ratusan per bulan (A-014) | Mobile | Progres yang mudah dipahami, upload mudah |
| Notary | 3 sampai 30 mitra | Mobile dan desktop, WhatsApp | Tugas dan tenggat yang jelas, upload cepat |

Detail scope data: `USER_ROLES.md`.

## 7. Personas

| Persona | Role | Konteks | Frustrasi saat ini | Keberhasilan menurut persona |
|---|---|---|---|---|
| Bu Ratna, 45 | Super Admin (pemilik) | Mengelola 40 sampai 60 project aktif | Tahu keterlambatan dari keluhan Client | Satu layar menunjukkan project kritis dan penyebabnya |
| Dimas, 27 | Admin | Menangani 15 project sekaligus | Membuka 15 chat dan spreadsheet setiap pagi | Daftar "follow-up hari ini" terurut prioritas |
| Pak Hendra, 38 | Client (pemilik usaha baru) | Mendirikan PT pertama, memakai HP | Tidak tahu proses sudah sampai mana | Timeline sederhana dan notifikasi saat perlu bertindak |
| Notaris Sari, 50 | Notary mitra | Menangani project dari beberapa penyedia | Grup WhatsApp terlalu banyak | Daftar tugas dengan tenggat, upload dari WhatsApp tetap diterima |

## 8. User Stories

Format: As a [role], I want [action], so that [benefit]. Kriteria penerimaan rinci ada di bagian 31.

| ID | Role | Story | Prioritas | Acceptance | Dependensi |
|---|---|---|---|---|---|
| US-001 | Client | As a Client, I want to register and verify my email, so that I can order a service securely. | P0 | AC-001 | FR-AUTH-001 |
| US-002 | Client | As a Client, I want to choose PT or CV and see the price before paying, so that I know what I buy. | P0 | AC-002 | FR-ORDER-001 |
| US-003 | Client | As a Client, I want to pay online and see the payment status, so that my project starts without manual confirmation. | P0 | AC-003, AC-004 | FR-PAY-001..004 |
| US-004 | Client | As a Client, I want to fill company data and upload identity documents from my phone, so that I do not need to send files via chat. | P0 | AC-005 | FR-DOC-001, FR-DOC-002 |
| US-005 | Client | As a Client, I want to see a simple timeline of my project, so that I understand progress without internal terms. | P0 | AC-006 | FR-UX-003 |
| US-006 | Client | As a Client, I want to review the draft deed and approve or request revision, so that the deed matches my intent. | P0 | AC-007 | FR-WF-004 |
| US-007 | Client | As a Client, I want to receive and download final documents from a secure link, so that my legal documents are not exposed. | P0 | AC-016 | FR-DELIV-001..003 |
| US-008 | Admin | As an Admin, I want to see all projects that require follow-up today, so that I don't need to inspect every project manually. | P0 | AC-008 | FR-TODO-001..003 |
| US-009 | Admin | As an Admin, I want to review only documents flagged NEEDS_REVIEW, so that I do not open every file. | P0 | AC-009 | FR-DOC-003, FR-DOC-006 |
| US-010 | Admin | As an Admin, I want to validate company data in one screen, so that the Notary receives complete data. | P0 | AC-010 | FR-PROJECT-003 |
| US-011 | Admin | As an Admin, I want the system to suggest a Notary, so that assignment is fast and balanced. | P0 | AC-011 | FR-PROJECT-004 |
| US-012 | Admin | As an Admin, I want to pause SLA when waiting on an external party, so that SLA reflects internal performance. | P0 | AC-012 | FR-SLA-004 |
| US-013 | Admin | As an Admin, I want to perform Final QA before delivery, so that no wrong document reaches the Client. | P0 | AC-015 | FR-DELIV-001, BR-DOC-003 |
| US-014 | Notary | As a Notary, I want to see my assigned tasks sorted by deadline, so that I know what to work on first. | P0 | AC-013 | FR-TODO-001 |
| US-015 | Notary | As a Notary, I want uploading a draft to complete my task automatically, so that I do not update status manually. | P0 | AC-014 | FR-TASK-002 |
| US-016 | Notary | As a Notary, I want to send documents via WhatsApp and have them routed to the correct project, so that I can work from my phone. | P1 | AC-017, AC-018 | FR-WA-003, FR-WA-004 |
| US-017 | Notary | As a Notary, I want to message the Client through the platform, so that my personal number stays private. | P1 | AC-019 | FR-WA-005 |
| US-018 | Super Admin | As a Super Admin, I want a dashboard of active, warning, and critical projects with drill-down, so that I can act before SLA breach. | P0 | AC-020 | FR-DASH-003 |
| US-019 | Super Admin | As a Super Admin, I want to receive escalation only when lower levels fail, so that I am not flooded with alerts. | P0 | AC-021 | FR-ESC-001..004 |
| US-020 | Super Admin | As a Super Admin, I want to configure SLA policies and holidays, so that SLA follows the business calendar. | P0 | AC-022 | FR-SLA-002 |
| US-021 | Super Admin | As a Super Admin, I want to search the audit trail by who, what, when, and project, so that I can resolve disputes. | P0 | AC-023 | FR-AUDIT-002 |
| US-022 | Super Admin | As a Super Admin, I want to reassign Admin or Notary, so that a stuck project can continue. | P0 | AC-024 | FR-PROJECT-007 |
| US-023 | Super Admin | As a Super Admin, I want to see operational risk scores, so that I focus on projects likely to fail. | P1 | AC-025 | FR-RISK-001 |
| US-024 | Client | As a Client, I want to request access to or correction of my personal data, so that my rights are respected. | P1 | AC-026 | FR-PRIV-003 |

## 9. Functional Requirements

Functional requirement didefinisikan per domain pada bagian 11 sampai 30. Konvensi:

- Kolom **Prioritas** mengikuti `MVP_SCOPE.md` (P0 sampai P3).
- Kolom **Verifikasi** merujuk ID skenario uji di `TESTING_STRATEGY.md`. Level uji tanpa ID TC akan dirinci pada sprint terkait.
- Kolom **Rujukan** menunjuk dokumen detail.

Ringkasan domain:

| Prefix | Domain | Bagian |
|---|---|---|
| FR-AUTH | Autentikasi dan akun | 11 |
| FR-ROLE | Role dan permission | 11 |
| FR-ORDER, FR-PAY | Order dan pembayaran | 16 |
| FR-PROJECT | Project | 12 |
| FR-WF | Workflow | 13 |
| FR-TASK, FR-TODO | Task dan Smart To-Do | 14 |
| FR-DOC, FR-DELIV | Dokumen dan delivery | 15 |
| FR-WA, FR-MSG | WhatsApp dan komunikasi | 17 |
| FR-NOTIF | Notifikasi | 18 |
| FR-SLA | SLA | 19 |
| FR-ESC, FR-RISK | Eskalasi dan risiko | 20 |
| FR-AUDIT | Audit | 21 |
| FR-PRIV | Privasi | 23 |
| FR-ANL, FR-DASH, FR-SEARCH | Analytics, dashboard, pencarian | 24 |
| FR-AI | AI | 25 |
| FR-UX | UX | 28 |

## 10. Non-functional Requirements

Angka tanpa dasar ditandai TBD. Dasar setiap angka dicantumkan.

| ID | Area | Requirement | Target | Dasar | Verifikasi |
|---|---|---|---|---|---|
| NFR-PERF-001 | Performance | Latensi API baca (dashboard, daftar) | p95 < 800 ms pada 50 user internal konkuren | A-013, pengalaman kerja interaktif | Load test k6 |
| NFR-PERF-002 | Performance | Respons webhook | p95 < 500 ms, proses berat asinkron | Provider me-retry jika lambat | Load test burst 100 rps |
| NFR-PERF-003 | Performance | Evaluasi SLA seluruh task aktif | Selesai < 60 detik per siklus 5 menit pada 5.000 task aktif | A-013 | Load test worker |
| NFR-PERF-004 | Performance | Client dashboard pada jaringan 4G | LCP < 2,5 detik | Ambang Core Web Vitals "good" | Lighthouse CI |
| NFR-AVAIL-001 | Availability | Ketersediaan aplikasi web dan API | 99,5% bulanan | Single region, tim kecil, tanpa on-call 24 jam. TBD: Requires business validation | Uptime monitor |
| NFR-AVAIL-002 | Availability | Penerimaan webhook tidak kehilangan event saat worker mati | 0 event hilang | Inbox table sebelum proses | TC-001, uji chaos worker |
| NFR-SCALE-001 | Scalability | Kapasitas tanpa perubahan arsitektur | 10x volume A-014 (2.000 project baru per bulan) | Horizontal scale API dan worker | Load test |
| NFR-SEC-001 | Security | Semua akses data melewati otorisasi berbasis scope | 0 endpoint tanpa guard | OWASP A01 | Test permission otomatis per endpoint |
| NFR-SEC-002 | Security | File sensitif tidak pernah dapat diakses publik | Bucket privat, signed URL 5 menit (preview) dan 15 menit (unduh) | Dokumen identitas dan akta | Security test, TC-011 |
| NFR-SEC-003 | Security | Password disimpan argon2id | Parameter per TV-06 | OWASP Password Storage | Unit test |
| NFR-SEC-004 | Security | MFA TOTP | Wajib SA sejak go-live, Admin pada Phase 13 | Akses tertinggi | E2E |
| NFR-SEC-005 | Security | Enkripsi | TLS 1.2+ in transit, enkripsi at rest, kolom PII `*_enc` level aplikasi | UU PDP (LR-04) | Review konfigurasi |
| NFR-REL-001 | Reliability | Idempotensi webhook, upload, dan event | Pemrosesan ganda tidak mengubah hasil | R-05 | TC-001, TC-033 |
| NFR-REL-002 | Reliability | Automation gagal tidak dianggap berhasil | Selalu NEEDS_REVIEW atau retry | Prinsip Fail Safe | TC-007 |
| NFR-MAINT-001 | Maintainability | Enum dan kontrak dibagi frontend-backend | Satu sumber `packages/shared` | Mencegah drift | Lint dan typecheck CI |
| NFR-MAINT-002 | Maintainability | Coverage unit domain inti (SLA, state machine, authz) | >= 90% baris | Logika kritis | CI gate |
| NFR-OBS-001 | Observability | Kegagalan webhook, dokumen, SLA job, notifikasi terdeteksi | Alert < 5 menit | `OBSERVABILITY.md` | Uji alert |
| NFR-A11Y-001 | Accessibility | Kepatuhan antarmuka | WCAG 2.2 AA | Status tidak hanya dari warna | axe-core di Playwright |
| NFR-BCK-001 | Backup | Backup database | PITR, RPO <= 15 menit | Data pembayaran dan dokumen | Uji restore bulanan |
| NFR-DR-001 | Disaster recovery | Pemulihan layanan | RTO <= 4 jam | Tim kecil, single region. TBD: Requires business validation | Drill DR per kuartal |
| NFR-LOC-001 | Lokalisasi | Bahasa antarmuka | Bahasa Indonesia (A-004), format Rupiah dan WIB | Pasar Indonesia | Review UX |

---

## 11. Role Management

Rujukan: `USER_ROLES.md`, `AUTHORIZATION.md`, `SECURITY.md`.

| ID | Requirement | Prioritas | Verifikasi |
|---|---|---|---|
| FR-AUTH-001 | Client mendaftar mandiri dengan email, password, nomor WhatsApp, dan persetujuan kebijakan privasi. Akun aktif setelah verifikasi email. | P0 | E2E |
| FR-AUTH-002 | Login email dan password. Session disimpan server-side sebagai hash, cookie HttpOnly, Secure, SameSite=Lax. | P0 | Integration |
| FR-AUTH-003 | Akun Admin, Notary, dan Super Admin hanya dibuat melalui undangan Super Admin. Tidak ada registrasi mandiri untuk role internal. | P0 | Permission test |
| FR-AUTH-004 | Reset password memakai token sekali pakai berumur 30 menit. Reset mencabut semua session aktif. | P0 | Integration |
| FR-AUTH-005 | MFA TOTP tersedia untuk semua role internal. Wajib untuk Super Admin sejak go-live. | P0 (SA), P1 (Admin) | E2E |
| FR-AUTH-006 | Menonaktifkan user mencabut semua session. Request berikutnya menerima 401. Task aktif milik user tersebut memicu task reassign untuk Admin. | P0 | TC-030 |
| FR-AUTH-007 | Verifikasi nomor WhatsApp dengan OTP sebelum nomor dipakai untuk routing pesan masuk. | P1 | Integration |
| FR-ROLE-001 | Empat role tetap: SUPER_ADMIN, ADMIN, CLIENT, NOTARY. Satu user satu role (A-009). | P0 | Unit |
| FR-ROLE-002 | Otorisasi = permission role + scope data (ALL, ASSIGNED, OWN, NONE) sesuai matriks `AUTHORIZATION.md`. | P0 | Permission test per endpoint |
| FR-ROLE-003 | Resource di luar scope menghasilkan 404, bukan 403, untuk mencegah enumerasi. | P0 | TC-019, TC-020 |
| FR-ROLE-004 | Super Admin dapat memberi Notary akses sementara ke project yang tidak ditugaskan, dengan alasan dan tanggal kedaluwarsa. | P2 | Permission test |

## 12. Project Management

Rujukan: `STATE_MACHINE.md` bagian Project, `BUSINESS_RULES.md`.

| ID | Requirement | Prioritas | Verifikasi |
|---|---|---|---|
| FR-PROJECT-001 | Project dibuat otomatis tepat satu kali saat order menjadi PAID. Kode `PRJ-YYYY-NNNNNN`. | P0 | TC-001 |
| FR-PROJECT-002 | Sistem menetapkan satu primary admin secara otomatis dengan beban project aktif terendah. Super Admin dapat override. Secondary admin opsional. | P0 | Unit |
| FR-PROJECT-003 | Admin memvalidasi data perusahaan dan dokumen identitas dalam satu layar. Hasil: `data.validated` atau `data.rejected` dengan daftar item. | P0 | E2E |
| FR-PROJECT-004 | Sistem mengusulkan Notary berdasarkan beban kerja aktif dan status ketersediaan. Admin mengonfirmasi. Notary menerima atau menolak. | P0 | Integration |
| FR-PROJECT-005 | Status lifecycle project terpisah dari `blocked_on`, `health`, dan `is_escalated` (K-03). | P0 | Unit |
| FR-PROJECT-006 | Semua perubahan status project melewati state machine. Transisi di luar matriks ditolak dengan 409 `INVALID_STATE_TRANSITION`. | P0 | TC-018 |
| FR-PROJECT-007 | Reassign Admin atau Notary mengakhiri keanggotaan lama saat itu juga. Anggota lama kehilangan akses. Anggota baru melihat seluruh histori project. | P0 | TC-029 |
| FR-PROJECT-008 | ON_HOLD dan CANCELLED wajib menyertakan alasan. CANCELLED bersifat final. | P0 | Unit |
| FR-PROJECT-009 | Project workspace memiliki tab Overview, Timeline, Tasks, Documents, Communication, Payment, Members, Activity, Audit. Visibilitas tab mengikuti `UX_SPECIFICATION.md`. | P0 | E2E per role |
| FR-PROJECT-010 | Super Admin dapat override status dengan alasan wajib. Override tercatat `STATUS_OVERRIDDEN` dan tetap tunduk pada guard integritas (contoh: tidak dapat DELIVERED tanpa Final QA). | P0 | Integration |

## 13. Workflow

Rujukan: `WORKFLOW.md`.

| ID | Requirement | Prioritas | Verifikasi |
|---|---|---|---|
| FR-WF-001 | Workflow template berversi. Project memakai versi aktif saat dibuat. Publikasi versi baru tidak mengubah project berjalan. | P0 | TC-026 |
| FR-WF-002 | Template terpisah untuk PT (`PT_STANDARD`) dan CV (`CV_STANDARD`) dengan 10 stage: DATA_SUBMISSION, DATA_VALIDATION, NOTARY_ACCEPTANCE, DRAFT_DEED, CLIENT_DRAFT_REVIEW, SIGNING, DEED_FINALIZATION, REGISTRATION, FINAL_QA, DELIVERY. | P0 | Integration |
| FR-WF-003 | Task memiliki dependency (DAG sederhana). Task kondisional aktif berdasarkan data (contoh: surat kuasa jika `representation = BY_PROXY`). | P0 | Unit |
| FR-WF-004 | Client dapat meminta revisi draft. Task upload draft dibuka ulang dan `revision_count` bertambah. Revisi melebihi batas (default 3, Q-002) membuat task keputusan untuk Admin. | P0 | TC-027 |
| FR-WF-005 | Super Admin mengelola template melalui file konfigurasi terversi. Editor visual adalah P2. | P0 | Integration |

Urutan dan nama stage berstatus `LEGAL_REVIEW_REQUIRED` (LR-01).

## 14. Task Management

Rujukan: `WORKFLOW.md` bagian Smart To-Do, `STATE_MACHINE.md` bagian Task.

| ID | Requirement | Prioritas | Verifikasi |
|---|---|---|---|
| FR-TASK-001 | Setiap task menyimpan: ID, project, tipe, owner, role owner, status, prioritas, created/started/due/completed at, SLA policy, dependency, evidence yang dibutuhkan, `completion_mode`. | P0 | Schema test |
| FR-TASK-002 | Task `completion_mode = EVIDENCE` selesai otomatis saat dokumen bertipe yang diminta berstatus VERIFIED pada project yang sama. Task berikutnya aktif. Audit tercatat. | P0 | TC-006 |
| FR-TASK-003 | Task `EVENT` selesai dari event domain. Task `MANUAL` selesai oleh owner dengan konfirmasi. | P0 | Unit |
| FR-TASK-004 | Admin dapat force-complete task EVIDENCE dengan alasan wajib. Tercatat `TASK_FORCE_COMPLETED`. | P0 | Integration |
| FR-TASK-005 | Event completion ganda untuk task COMPLETED diabaikan tanpa efek samping. | P0 | TC-033 |
| FR-TASK-006 | Task milik Client yang melewati cadence membuat follow-up task otomatis untuk primary admin. | P0 | Integration |
| FR-TODO-001 | `GET /me/todos` mengembalikan task terbuka milik user terurut priority score (`40*H + 25*O + 20*R + 15*B`, `WORKFLOW.md`). | P0 | Unit |
| FR-TODO-002 | Today's Actions Admin mengelompokkan item: Client perlu follow-up, Notary terlambat, dokumen menunggu review, project kritis, pesan tanpa project. | P0 | E2E |
| FR-TODO-003 | Klik item membuka layar tindakan terkait langsung (deep link), bukan halaman daftar. | P0 | E2E |

## 15. Document Management

Rujukan: `DOCUMENT_MANAGEMENT.md`.

| ID | Requirement | Prioritas | Verifikasi |
|---|---|---|---|
| FR-DOC-001 | Dokumen diterima dari 4 sumber: WEB, WHATSAPP, API, INTERNAL. Semua melewati pipeline yang sama. | P0 (WEB), P1 (WHATSAPP, API) | Integration |
| FR-DOC-002 | Validasi file: tipe PDF/JPG/PNG, maksimal 20 MB, cek magic bytes, tolak PDF dengan JavaScript atau aksi otomatis, scan malware. File terinfeksi QUARANTINED dan tidak dapat diunduh. | P0 | TC-010, TC-011 |
| FR-DOC-003 | Dokumen VERIFIED otomatis hanya jika seluruh 6 syarat auto-verify terpenuhi (termasuk confidence >= `DOC_AUTO_VERIFY_THRESHOLD`). Jika satu syarat gagal: NEEDS_REVIEW dengan `review_reasons[]`. Task tidak berubah. | P0 | TC-007 |
| FR-DOC-004 | Upload tipe dan slot sama membuat versi baru. Versi lama SUPERSEDED. Versi baru atas dokumen yang sudah disetujui Client membuka ulang task review terkait. | P0 | TC-028 |
| FR-DOC-005 | File dengan SHA-256 sama pada project yang sama ditolak sebagai `DUPLICATE_FILE` tanpa versi baru. | P0 | TC-012 |
| FR-DOC-006 | Review queue menampilkan dokumen NEEDS_REVIEW dengan alasan, preview, dan aksi: verifikasi, ubah tipe, pindah project, tolak dengan alasan. | P0 | E2E |
| FR-DOC-007 | Dokumen identitas (KTP, KK, NPWP) diverifikasi manusia di tahap DATA_VALIDATION (`content_review_status`). | P0 | Integration |
| FR-DOC-008 | Unduh hanya melalui signed URL berumur pendek. Setiap unduhan tercatat `DOCUMENT_DOWNLOADED`. | P0 | Security test |
| FR-DELIV-001 | Delivery hanya setelah Final QA manusia menyetujui paket dokumen final. Jika semua channel gagal, project tetap COMPLETED dan eskalasi L2 dibuat. | P0 | TC-022, TC-023, TC-031 |
| FR-DELIV-002 | Delivery memakai channel berurutan dengan fallback: in-app selalu, email, lalu WhatsApp (jika aktif). Project menjadi DELIVERED saat minimal satu channel eksternal SENT atau DELIVERED. | P0 | TC-022 |
| FR-DELIV-003 | Default delivery berupa link portal. Lampiran file mentah via WhatsApp hanya jika RBD-05 memutuskan demikian. | P0 | E2E |

## 16. Payment

Rujukan: `PAYMENT_SYSTEM.md`.

| ID | Requirement | Prioritas | Verifikasi |
|---|---|---|---|
| FR-ORDER-001 | Client memilih paket PT atau CV dan membuat order. Order menyimpan snapshot harga dan nama paket. | P0 | Integration |
| FR-ORDER-002 | Order PENDING_PAYMENT kedaluwarsa setelah `ORDER_EXPIRY_HOURS` (default 24). Client dapat membatalkan sebelum bayar. | P0 | Unit |
| FR-PAY-001 | Client membuat payment melalui gateway. Satu order hanya memiliki satu payment aktif. | P0 | Integration |
| FR-PAY-002 | Status payment hanya berubah dari webhook dengan signature valid atau status query server-side. Redirect frontend tidak mengubah status. Nominal atau mata uang berbeda menghasilkan alert tanpa perubahan status. | P0 | TC-002, TC-003, TC-005 |
| FR-PAY-003 | Webhook diproses idempotent berdasarkan `(provider, provider_event_id)`. Webhook ganda atau paralel menghasilkan satu PAID dan satu project. | P0 | TC-001 |
| FR-PAY-004 | Pembayaran yang dikonfirmasi setelah order EXPIRED tetap diterima: order menjadi PAID, project dibuat, alert late payment dikirim. Order CANCELLED tidak diubah dan masuk antrean refund. | P0 | TC-004 |
| FR-PAY-005 | Job rekonsiliasi memeriksa payment PENDING dan settlement harian. | P0 | Integration |
| FR-PAY-006 | Refund dicatat manual oleh Super Admin. Refund membatalkan project yang belum DELIVERED. | P0 | Integration |
| FR-PAY-007 | Invoice PDF otomatis. | P1 | E2E |

## 17. WhatsApp

Rujukan: `WHATSAPP_INTEGRATION.md`, `INTEGRATION_SPECIFICATION.md`.

| ID | Requirement | Prioritas | Verifikasi |
|---|---|---|---|
| FR-WA-001 | Integrasi melalui `WhatsAppProvider` interface. Hanya WhatsApp Business Platform resmi. Library tidak resmi ditolak. | P1 | Contract test |
| FR-WA-002 | Webhook masuk diverifikasi signature, disimpan di inbox table, diproses idempotent berdasarkan `provider_event_id`. | P1 | Webhook test |
| FR-WA-003 | Lampiran masuk dari WhatsApp diunduh server-side dan masuk document pipeline. | P1 | Integration |
| FR-WA-004 | Resolusi project untuk pesan masuk mengikuti urutan REPLY_CONTEXT, EXPLICIT_CODE, SINGLE_ACTIVE, ASK_USER. Kode project di luar scope pengirim tidak pernah dipakai dan dicatat `SECURITY_SUSPICIOUS_REFERENCE`. | P1 | TC-008, TC-009 |
| FR-WA-005 | Relay pesan Client ke Notary dan sebaliknya tanpa membuka nomor telepon pihak lain. | P1 | TC-021 |
| FR-WA-006 | Pesan dari nomor tidak terdaftar tidak diteruskan dan masuk antrean Admin. | P1 | Integration |
| FR-WA-007 | Pesan keluar di luar jendela percakapan memakai template yang disetujui provider (TV-01). | P1 | Contract test |
| FR-MSG-001 | Communication Center in-app memuat Inbox, conversation per project, internal note, pesan WhatsApp, dan pesan sistem. | P0 | E2E |
| FR-MSG-002 | Conversation PROJECT_INTERNAL dan internal note tidak pernah terlihat oleh Client. Akses menghasilkan 404. | P0 | TC-020 |
| FR-MSG-003 | Internal note memiliki visibilitas INTERNAL_ADMIN atau INTERNAL_WITH_NOTARY. | P0 | Permission test |

## 18. Notifications

Rujukan: `NOTIFICATION_SYSTEM.md`.

| ID | Requirement | Prioritas | Verifikasi |
|---|---|---|---|
| FR-NOTIF-001 | Notifikasi melalui `NotificationChannel` abstraction: IN_APP, EMAIL (P0), WHATSAPP (P1), PUSH (P2). | P0 | Unit |
| FR-NOTIF-002 | 13 tipe notifikasi sesuai enum `notification_type`. | P0 | Unit |
| FR-NOTIF-003 | Gagal kirim di-retry lalu fallback ke channel berikutnya. In-app selalu dibuat. | P0 | Integration |
| FR-NOTIF-004 | Deduplikasi dengan `dedup_key` dalam jendela waktu. Event SLA sama dalam 1 jam menghasilkan 1 notifikasi. | P0 | TC-032 |
| FR-NOTIF-005 | Quiet hours untuk channel eksternal non-kritis di luar jam kerja. | P1 | Unit |
| FR-NOTIF-006 | User mengatur preferensi channel per tipe notifikasi non-wajib. | P2 | E2E |

## 19. SLA

Rujukan: `SLA_ENGINE.md`.

| ID | Requirement | Prioritas | Verifikasi |
|---|---|---|---|
| FR-SLA-001 | Semua perhitungan tenggat memakai business calendar (Asia/Jakarta, Senin-Jumat 09:00-17:00, libur dari tabel `holidays`). | P0 | TC-013 |
| FR-SLA-002 | Super Admin mengelola SLA policy, business calendar, dan hari libur tanpa deploy. Policy berversi. | P0 | Integration |
| FR-SLA-003 | Dua clock resmi: Task Clock (target per task, contoh 8 business hours) dan Project Clock (target 5 bd, hanya waktu internal). | P0 | Unit |
| FR-SLA-004 | Project Clock berhenti saat `blocked_on = CLIENT`, ON_HOLD, EXTERNAL_DEPENDENCY, atau SIGNING_SCHEDULED. Pause EXTERNAL_DEPENDENCY wajib alasan. | P0 | TC-014 |
| FR-SLA-005 | Health dihitung dari rasio elapsed/target menjadi ON_TRACK, WARNING, HIGH_RISK, CRITICAL. Perubahan health mengirim notifikasi satu kali per level. | P0 | TC-015 |
| FR-SLA-006 | Job `sla.evaluate` berjalan tiap 5 menit dan idempotent. | P0 | Integration |
| FR-SLA-007 | Reminder Client mengikuti cadence 1, 2, 3, 5 bd. | P0 | Integration |

## 20. Escalation

Rujukan: `ESCALATION_ENGINE.md`, `RISK_ENGINE.md`.

| ID | Requirement | Prioritas | Verifikasi |
|---|---|---|---|
| FR-ESC-001 | Eskalasi bertingkat L1_OWNER, L2_ADMIN, L3_SUPER_ADMIN sesuai aturan ESC-R01 sampai ESC-R11. Setiap level terpicu maksimal satu kali per task. | P0 | TC-016 |
| FR-ESC-002 | Record eskalasi menyimpan level, rule, alasan, penerima, status, triggered_at, acknowledged_at, resolved_at. | P0 | Schema test |
| FR-ESC-003 | Penerima dapat acknowledge dan resolve dengan catatan. L3 yang tidak di-acknowledge dalam 4 business hours dikirim ulang. | P0 | Integration |
| FR-ESC-004 | Eskalasi AUTO_RESOLVED saat kondisi pemicu hilang (contoh: task selesai). | P0 | TC-017 |
| FR-ESC-005 | Admin dapat memicu eskalasi manual dengan alasan. | P0 | E2E |
| FR-RISK-001 | Operational Risk Score 0-100 dihitung harian dan saat event penting dengan formula `RISK_ENGINE.md`. Level LOW, MEDIUM, HIGH, CRITICAL. Tidak memicu eskalasi di MVP. | P1 | TC-034 |

## 21. Audit

Rujukan: `AUDIT_LOG.md`.

| ID | Requirement | Prioritas | Verifikasi |
|---|---|---|---|
| FR-AUDIT-001 | Setiap aksi dalam katalog audit mencatat actor, role, action, entitas, project, waktu, IP, user agent, before, after, request ID. | P0 | Integration |
| FR-AUDIT-002 | Super Admin mencari audit berdasarkan actor, action, project, rentang waktu, dan entitas. | P0 | E2E |
| FR-AUDIT-003 | PII di before/after diredaksi sesuai aturan redaksi. | P0 | Unit |
| FR-AUDIT-004 | Audit log append-only. UPDATE dan DELETE ditolak trigger database. Hash chain SHA-256 dapat diverifikasi. | P0 (append-only), P1 (hash chain) | TC-024, TC-025 |

## 22. Security

Rujukan: `SECURITY.md`, `AUTHORIZATION.md`. Requirement keamanan terukur dinyatakan sebagai NFR-SEC-001 sampai NFR-SEC-005 pada bagian 10. Kontrol tambahan wajib:

- Rate limit 6 tier per endpoint (`API_SPECIFICATION.md`).
- CSRF token untuk request mutasi berbasis cookie.
- Validasi input dengan skema Zod di semua boundary.
- Threat model 16 ancaman dengan mitigasi, termasuk IDOR, webhook spoofing, replay, dan SSRF.

## 23. Privacy

Rujukan: `PRIVACY.md`. Semua kewajiban hukum berstatus `LEGAL_REVIEW_REQUIRED`.

| ID | Requirement | Prioritas | Verifikasi |
|---|---|---|---|
| FR-PRIV-001 | Consent dicatat dengan versi teks, waktu, dan channel sebelum data pribadi pertama disimpan. | P0 | Integration |
| FR-PRIV-002 | Notary hanya melihat data project setelah menerima penugasan (LR-08). | P0 | Permission test |
| FR-PRIV-003 | Client dapat mengajukan akses, koreksi, dan penghapusan data. Permintaan tercatat di `data_subject_requests` dan diproses Admin/SA. | P1 | E2E |
| FR-PRIV-004 | Job retensi menghapus data sesuai kebijakan (A-015, A-016, LR-07). | P1 | Integration |

## 24. Analytics

Rujukan: `ANALYTICS.md`, `UX_SPECIFICATION.md`.

| ID | Requirement | Prioritas | Verifikasi |
|---|---|---|---|
| FR-ANL-001 | 17 metrik dengan definisi matematis, termasuk SLA compliance, rata-rata waktu selesai, response time per role, payment conversion. | P1 | Unit per rumus |
| FR-ANL-002 | Agregasi harian oleh job `analytics.aggregate.daily`. | P1 | Integration |
| FR-DASH-001 | Admin dashboard berorientasi tindakan (Today's Actions). | P0 | E2E |
| FR-DASH-002 | Client dashboard berorientasi progres dengan label non-teknis. | P0 | E2E |
| FR-DASH-003 | Super Admin dashboard: active, on track, warning, critical, SLA compliance, eskalasi, beban per Admin dan Notary, dengan drill-down. | P0 (dasar), P1 (drill-down lengkap) | E2E |
| FR-DASH-004 | Notary dashboard berorientasi tugas dan dokumen. | P0 | E2E |
| FR-SEARCH-001 | Daftar project dapat dicari dan difilter: kode project, Client, Notary, Admin, status, layanan, rentang tanggal, health, prioritas, status pembayaran. | P0 | API test |

## 25. AI

Rujukan: `AI_FEATURES.md`.

| ID | Requirement | Prioritas | Verifikasi |
|---|---|---|---|
| FR-AI-001 | AI tidak mengambil keputusan legal. Hasil AI hanya mempengaruhi alur melalui aturan auto-verify yang dapat diaudit. | P0 | Review desain |
| FR-AI-002 | Hasil AI menyimpan confidence, versi model, dan input reference. | P1 | Unit |
| FR-AI-003 | Klasifikasi dokumen WhatsApp melalui `DocumentClassifier`. Auto-verify aktif hanya setelah precision >= 98% pada sampel (TV-04). | P1 | Evaluasi offline |
| FR-AI-004 | OCR prefill KTP, intent detection, ringkasan, saran follow-up. | P2, P3 | Evaluasi offline |

## 26. API

Rujukan: `API_SPECIFICATION.md`. REST `/api/v1`, session cookie dengan CSRF, `Idempotency-Key` untuk operasi finansial dan upload, cursor pagination, optimistic locking via `If-Match`, format error seragam. Katalog ~100 endpoint dengan role, idempotensi, dan tier rate limit.

## 27. Database

Rujukan: `DATABASE_SCHEMA.md`, `ERD.md`. PostgreSQL 16, UUIDv7, `timestamptz`, kolom `version` untuk optimistic locking, partial unique index untuk invariant kritis (satu project per order, satu payment aktif per order, satu Notary aktif per project, satu eskalasi terbuka per task per level).

## 28. UX

Rujukan: `UX_SPECIFICATION.md`, `DESIGN_SYSTEM.md`.

| ID | Requirement | Prioritas | Verifikasi |
|---|---|---|---|
| FR-UX-001 | Setiap role memiliki dashboard berbeda: SA management-first, Admin action-first, Client progress-first, Notary task-first. | P0 | E2E |
| FR-UX-002 | Status visual memakai warna, ikon, label teks, dan kode. Warna tidak pernah menjadi satu-satunya indikator. | P0 | axe-core |
| FR-UX-003 | Client melihat label sederhana (mapping di `UX_SPECIFICATION.md`), bukan kode internal. | P0 | E2E |
| FR-UX-004 | Client flow optimal di layar 360 px. Admin dan SA optimal di >= 1280 px. | P0 | Visual test |
| FR-UX-005 | Setiap layar memiliki state loading, empty, error, dan no-permission. | P0 | Review UX |

## 29. Error Handling

Rujukan: `ERROR_HANDLING.md`. Kode error API seragam (contoh: `INVALID_STATE_TRANSITION` 409, `DUPLICATE_FILE` 409, `DOCUMENTS_NOT_VIEWED` 422). Kegagalan worker diklasifikasikan transient atau permanent. Automation gagal menghasilkan NEEDS_REVIEW atau task manual, tidak pernah COMPLETED diam-diam.

## 30. Edge Cases

Rujukan: `EDGE_CASES.md`. EC-01 sampai EC-31, masing-masing dengan Detection, Handling, Fallback, Notification, Audit, Recovery.

## 31. Acceptance Criteria

Format Gherkin. Setiap AC terhubung ke user story di bagian 8.

### AC-001 Registrasi Client (US-001)

```gherkin
Given a visitor opens the registration page
When the visitor submits email, password, WhatsApp number, and accepts the privacy policy
Then an account with role CLIENT and status INVITED is created
And a consent record with the policy version is stored
And a verification email is sent
When the visitor opens the verification link within its validity
Then the account status becomes ACTIVE
```

### AC-002 Pembuatan order (US-002)

```gherkin
Given an active Client views the service catalog
When the Client selects package "PT Standard" and submits an order with an Idempotency-Key
Then an order with status PENDING_PAYMENT is created with a price snapshot
And resubmitting the same Idempotency-Key returns the same order
```

### AC-003 Pembayaran terverifikasi (US-003)

```gherkin
Given an order in PENDING_PAYMENT with an active payment
When the gateway sends a PAID webhook with a valid signature and matching amount
Then the payment status becomes PAID
And the order status becomes PAID
And exactly one project is created with status DATA_COLLECTION
And the Client receives a PAYMENT_RECEIVED notification
And audit entries PAYMENT_CONFIRMED and PROJECT_CREATED are written
```

### AC-004 Pembayaran tidak dapat dipalsukan (US-003)

```gherkin
Given an order in PENDING_PAYMENT
When the Client browser is redirected to the success URL without a webhook
Then the payment status remains PENDING
When a webhook arrives with an invalid signature
Then the API responds 401 and no status changes
When a webhook arrives with a valid signature but a different amount
Then the payment status does not change
And an alert and audit PAYMENT_AMOUNT_MISMATCH are created
```

### AC-005 Upload dokumen identitas (US-004)

```gherkin
Given a project in DATA_COLLECTION owned by the Client
When the Client uploads a 3 MB JPG into slot KTP for founder 1
Then the file passes type, size, magic-byte, and malware checks
And a document with source WEB and classification_method DECLARED is created
And content_review_status is PENDING for human validation at DATA_VALIDATION
When the Client uploads the identical file again into the same slot
Then the upload is rejected with DUPLICATE_FILE
```

### AC-006 Timeline Client (US-005)

```gherkin
Given a project in IN_PROGRESS with active stage DRAFT_DEED
When the Client opens the project
Then the timeline shows "Pembayaran diterima" and "Data perusahaan lengkap" as done and "Notaris memproses dokumen" as in progress
And no internal code, internal note, escalation, or Admin name is displayed
```

### AC-007 Review draft (US-006)

```gherkin
Given the Notary's draft deed is VERIFIED and task "Review dan setujui draft" is OPEN for the Client
When the Client requests revision with a note
Then task UPLOAD_DRAFT_DEED is reopened and revision_count increases by 1
And the Notary receives a notification with the note
When revision_count exceeds the configured limit
Then a decision task is created for the primary admin
```

### AC-008 Today's Actions (US-008)

```gherkin
Given Admin Dimas is primary admin on 15 active projects
And 3 Client tasks exceed 2 business days, 2 Notary tasks are breached, and 1 project is CRITICAL
When Dimas opens the Admin dashboard
Then Today's Actions lists these items grouped by category
And items are ordered by priority score descending
And clicking an item opens the related action screen
And projects where Dimas is not a member are not shown
```

### AC-009 Review queue (US-009)

```gherkin
Given a document with status NEEDS_REVIEW and reason LOW_CONFIDENCE
When the Admin opens the review queue
Then the document appears with its reasons and preview
When the Admin verifies it as DRAFT_DEED for the correct project
Then the document status becomes VERIFIED
And the matching EVIDENCE task becomes COMPLETED
And audit DOCUMENT_VERIFIED records before and after values
```

### AC-010 Validasi data (US-010)

```gherkin
Given a project in DATA_REVIEW with all Client tasks completed
When the Admin rejects item "NPWP founder 2" with a reason
Then the project returns to DATA_COLLECTION
And only the related Client task is reopened
When the Admin later validates all items
Then the project moves to IN_PROGRESS and the Project Clock starts
```

### AC-011 Penugasan Notary (US-011)

```gherkin
Given a project just moved to IN_PROGRESS
When the Admin confirms the suggested Notary
Then the assignment status is PENDING_ACCEPTANCE
And the Notary sees only the project summary without company data
When the Notary accepts
Then the assignment becomes ACTIVE and the Notary can view company data
When two different Notaries decline or time out on the same project
Then escalation ESC-R08 at L3_SUPER_ADMIN is created
```

### AC-012 SLA pause (US-012)

```gherkin
Given a project with an active Project Clock
When the Admin creates a pause EXTERNAL_DEPENDENCY without a reason
Then the request is rejected with 422 REASON_REQUIRED
When the Admin creates the pause with a reason for 2 business days
Then Project Clock elapsed does not increase during those 2 business days
And an audit SLA_PAUSED entry is written
```

### AC-013 Daftar tugas Notary (US-014)

```gherkin
Given Notary Sari has 4 open tasks across 3 projects
When she opens her dashboard on mobile
Then tasks are sorted by due_at and health
And each task shows project code, task name, deadline in WIB, and a status label with icon
```

### AC-014 Auto-complete dari dokumen (US-015)

```gherkin
Given a project has an assigned notary
And the notary uploads the required draft document via the task slot
When the system successfully identifies the document
Then the corresponding task should be marked as completed
And the next task should become active
And an audit log should be created
```

### AC-015 Final QA (US-013)

```gherkin
Given a project in FINAL_REVIEW with DEED and REGISTRATION_PROOF VERIFIED
When the Admin approves Final QA without opening every final document
Then the API responds 422 DOCUMENTS_NOT_VIEWED
When the Admin opens all final documents and approves
Then the project becomes COMPLETED, the Project Clock stops, and a delivery job is queued
```

### AC-016 Delivery (US-007)

```gherkin
Given a project in COMPLETED with a queued delivery
When the email channel succeeds and WhatsApp fails
Then the project becomes DELIVERED
And the Client receives a portal link, not a raw file
When all external channels fail after retries
Then the project stays COMPLETED
And escalation ESC-R09 at L2_ADMIN is created
```

### AC-017 Dokumen WhatsApp dengan confidence rendah (US-016)

```gherkin
Given a Notary with one active project sends a PDF via WhatsApp
When the classifier returns DEED with confidence 0.72
Then the document status is NEEDS_REVIEW with reason LOW_CONFIDENCE
And no task changes status
And the Admin sees the document in the review queue
```

### AC-018 Resolusi project WhatsApp (US-016)

```gherkin
Given a Notary has 3 active projects
When the Notary sends a PDF without reply context or project code
Then the system asks the Notary to choose a project
And the document status is PENDING_RESOLUTION
When the Notary sends a project code belonging to another Notary
Then the document is not attached to that project
And audit SECURITY_SUSPICIOUS_REFERENCE is written
```

### AC-019 Relay pesan (US-017)

```gherkin
Given a Client sends a WhatsApp text to the platform number about project PRJ-2026-000123
When the message is relayed to the assigned Notary
Then the Notary receives the text with the project code
And the Client phone number is not included anywhere in the relayed message
```

### AC-020 Dashboard Super Admin (US-018)

```gherkin
Given 42 active projects with 31 ON_TRACK, 7 WARNING, and 4 CRITICAL
When the Super Admin opens the dashboard
Then the counts match these values
When the Super Admin clicks CRITICAL
Then the list shows 4 projects with health, blocked_on, primary admin, and Notary
```

### AC-021 Eskalasi bertingkat (US-019)

```gherkin
Given a Notary task breaches its SLA
Then escalation L1_OWNER is created once
When 2 business hours pass without completion
Then escalation L2_ADMIN is created once
When 1 business day passes after breach without completion
Then escalation L3_SUPER_ADMIN is created once
When the Notary completes the task
Then all open escalations for that task become AUTO_RESOLVED
```

### AC-022 Konfigurasi kalender (US-020)

```gherkin
Given Monday is added as a holiday
And a task with target 8 business hours opens on Friday at 16:00 WIB
Then its due_at is Tuesday at 16:00 WIB
```

### AC-023 Pencarian audit (US-021)

```gherkin
Given audit entries exist for project PRJ-2026-000045
When the Super Admin filters by project and action DOCUMENT_DOWNLOADED
Then results show actor, role, time, IP, and document ID
And PII values in before/after are redacted
```

### AC-024 Reassign Notary (US-022)

```gherkin
Given Notary A is ACTIVE on a project
When the Super Admin reassigns the project to Notary B with a reason
Then Notary A receives 404 on the project from the next request
And Notary B sees the full document and task history
And open Notary tasks are transferred to Notary B
```

### AC-025 Risk score (US-023)

```gherkin
Given factor values from the example in RISK_ENGINE.md
When the risk job computes the score
Then the stored score and level match the formula result
And no escalation is created from the risk level
```

### AC-026 Permintaan data pribadi (US-024)

```gherkin
Given an active Client
When the Client submits a data access request
Then a data_subject_request with status RECEIVED is created
And the Super Admin receives a notification
And audit PRIVACY_REQUEST_CREATED is written
```

## 32. MVP

Rujukan lengkap dengan alasan bisnis dan teknis: `MVP_SCOPE.md`.

| Prioritas | Isi utama | Alasan singkat |
|---|---|---|
| P0 MUST | Auth, RBAC, order, payment webhook, project, workflow PT/CV, task engine, upload web aman, auto-complete dari slot web, review queue, Final QA, delivery link + email, SLA, reminder, eskalasi, notifikasi in-app + email, 4 dashboard, communication center in-app, audit append-only, consent | Bisnis dapat berjalan tanpa spreadsheet dan grup WhatsApp dengan risiko terkendali |
| P1 SHOULD | WhatsApp keluar dan masuk, proxy relay, klasifikasi WhatsApp, risk score, analytics lengkap, MFA Admin, invoice PDF, hash chain audit | Bergantung pada validasi provider dan data nyata |
| P2 COULD | OCR prefill, intent detection, editor template visual, preferensi notifikasi granular, push notification | Peningkatan efisiensi |
| P3 FUTURE | Ringkasan AI, multi-tenant, layanan lain, payout Notary, integrasi pemerintah, e-signature | Butuh keputusan bisnis dan hukum |

Keputusan penting: WhatsApp berada di P1, bukan P0. Alasan: persetujuan akun bisnis dan template provider berada di luar kendali tim (R-04, TV-01). MVP tetap berjalan dengan in-app dan email. Feature flag `FEATURE_WA_OUTBOUND` dan `FEATURE_WA_RELAY` mengaktifkan channel ini tanpa perubahan kode.

## 33. Future Roadmap

Rujukan: `IMPLEMENTATION_PLAN.md` (Phase 0 sampai 14, 20 sampai 24 minggu) dan `FUTURE_ROADMAP.md` (pasca-MVP: 3-6 bulan, 6-12 bulan, 12 bulan+).

## 34. Risks

Rujukan: `00_DISCOVERY_AND_DESIGN.md` (R-01 sampai R-10) dan `DEVELOPMENT_READINESS.md` (risiko tertinggi dan mitigasi).

| ID | Risiko | Dampak | Mitigasi di requirement |
|---|---|---|---|
| R-01 | Target 5 hari tidak realistis karena proses eksternal | Compliance rendah, Client kecewa | FR-SLA-004, RBD-07 |
| R-02 | Notary mitra menolak memakai platform | Workflow macet | FR-DASH-004, FR-WA-003 |
| R-03 | Resolusi project WhatsApp salah | Dokumen masuk project salah | FR-WA-004, FR-DOC-003 |
| R-04 | Batasan kebijakan WhatsApp Business Platform | Reminder tidak terkirim | FR-WA-007, fallback email |
| R-05 | Webhook ganda atau tidak berurutan | Project ganda, status salah | FR-PAY-003, FR-TASK-005 |
| R-06 | Kebocoran dokumen identitas dan akta | Pelanggaran data | NFR-SEC-002, FR-DOC-008 |
| R-07 | Kewajiban UU PDP belum dipetakan | Sanksi regulasi | FR-PRIV-001..004, LR-04 |
| R-08 | Kewajiban kerahasiaan Notary | Pelanggaran jabatan | FR-PRIV-002, LR-08 |
| R-09 | Klasifikasi AI keliru | Task salah selesai | FR-DOC-003, FR-AI-003 |
| R-10 | Notifikasi berlebihan | User mengabaikan peringatan | FR-NOTIF-004, FR-NOTIF-005 |

## 35. Assumptions

Rujukan lengkap: `ASSUMPTIONS.md`. Asumsi yang paling mempengaruhi requirement:

| ID | Asumsi | Requirement terdampak |
|---|---|---|
| A-001 | Single-tenant | Seluruh skema |
| A-002 | Pembayaran penuh di muka | FR-PAY-* |
| A-003 | Notary adalah mitra eksternal dengan akun platform | FR-PROJECT-004, FR-PRIV-002 |
| A-006 | Hari kerja Senin-Jumat 09:00-17:00 WIB | FR-SLA-001 |
| A-007 | Project Clock mulai saat DATA_VALIDATION selesai | FR-SLA-003 |
| A-009 | Satu user satu role | FR-ROLE-001 |
| A-011 | Satu Notary aktif per project | FR-PROJECT-004, FR-PROJECT-007 |
| A-014 | Volume < 200 project baru per bulan | NFR-SCALE-001 |

## 36. Open Questions

| ID | Pertanyaan | Default sementara | Pemilik keputusan |
|---|---|---|---|
| Q-001 | Janji 5 hari ke Client dihitung dari mana? | Dari validasi data (A-007) | Bisnis (RBD-07) |
| Q-002 | Batas revisi draft? | 3 kali | Bisnis |
| Q-003 | Admin boleh upload atas nama Notary? | Boleh dengan `on_behalf_of` dan audit | Bisnis |
| Q-004 | Client boleh chat Notary sebelum Notary menerima? | Tidak | Bisnis |
| Q-005 | Notary dibayar melalui platform? | Tidak di MVP | Bisnis |
| Q-006 | Paket dengan deliverable berbeda? | Dikonfigurasi per paket | Bisnis dan hukum |
| Q-007 | Siapa menanggung biaya pesan WhatsApp keluar? | Perusahaan penyedia | Bisnis |

Keputusan bisnis (RBD-01..09), tinjauan hukum (LR-01..11), dan validasi teknis (TV-01..08) tercatat di `ASSUMPTIONS.md` dan diringkas di `DEVELOPMENT_READINESS.md`.

---

## Lampiran A. Traceability Matrix (P0)

| Requirement | Business rule | State machine | API | Test |
|---|---|---|---|---|
| FR-PAY-002 | BR-PAY-001, BR-PAY-002 | Payment | POST /webhooks/payment/{provider} | TC-002, TC-003, TC-005 |
| FR-PAY-003 | BR-PAY-003 | Payment | POST /webhooks/payment/{provider} | TC-001 |
| FR-PAY-004 | BR-ORDER-002 | Order EXPIRED -> PAID | POST /webhooks/payment/{provider} | TC-004 |
| FR-PROJECT-001 | BR-PROJECT-001 | Project (initial) | (event payment.confirmed) | TC-001 |
| FR-PROJECT-006 | BR-PROJECT-005, BR-PROJECT-006 | Project | Semua endpoint aksi project | TC-018 |
| FR-PROJECT-007 | BR-ASSIGN-* | Assignment | POST /projects/{id}/notary-assignment, POST /projects/{id}/admins | TC-029 |
| FR-WF-001 | BR-PROJECT-003 | - | POST /workflow-templates/{id}/publish | TC-026 |
| FR-WF-004 | BR-TASK-007 | Task COMPLETED -> OPEN | POST /projects/{id}/draft/request-revision | TC-027 |
| FR-TASK-002 | BR-TASK-002, BR-DOC-001 | Task, Document | POST /documents/{id}/complete | TC-006 |
| FR-TASK-005 | BR-TASK-006 | Task | (event task.completed) | TC-033 |
| FR-DOC-002 | BR-DOC-007 | Document QUARANTINED | POST /projects/{id}/documents/upload-intents | TC-010, TC-011 |
| FR-DOC-003 | BR-DOC-002 | Document NEEDS_REVIEW | POST /documents/{id}/review | TC-007 |
| FR-DOC-004 | BR-DOC-006 | Document SUPERSEDED | POST /projects/{id}/documents/upload-intents | TC-028 |
| FR-DOC-005 | BR-DOC-005 | - | POST /documents/{id}/complete | TC-012 |
| FR-DELIV-001 | BR-DOC-003 | Project FINAL_REVIEW -> COMPLETED, Delivery | POST /projects/{id}/final-qa | TC-023, TC-031 |
| FR-DELIV-002 | BR-WA-003 | Delivery | (job delivery.dispatch) | TC-022 |
| FR-SLA-001 | BR-SLA-001 | - | PUT /calendars/{code}/holidays | TC-013 |
| FR-SLA-004 | BR-SLA-002, BR-SLA-005 | - | POST /projects/{id}/sla-pauses | TC-014 |
| FR-SLA-005 | - | - | (job sla.evaluate) | TC-015 |
| FR-ESC-001 | BR-ESC-001 | Escalation | GET /escalations | TC-016 |
| FR-ESC-004 | BR-ESC-002 | Escalation AUTO_RESOLVED | - | TC-017 |
| FR-MSG-002 | BR-MSG-001 | - | GET /conversations/{id}/messages | TC-020 |
| FR-ROLE-003 | AUTHZ-001 | - | Semua endpoint scoped | TC-019 |
| FR-AUTH-006 | - | User DISABLED | POST /users/{id}/disable | TC-030 |
| FR-NOTIF-004 | - | - | (job notification.dispatch) | TC-032 |
| FR-AUDIT-004 | BR-AUDIT-001 | - | GET /audit-logs | TC-024, TC-025 |
| FR-SEARCH-001 | - | - | GET /projects | TC-035 |
| FR-AUTH-004 | - | - | POST /auth/password/reset | TC-036 |
| FR-PROJECT-003 | BR-DOC-004 | Project DATA_REVIEW | POST /projects/{id}/data-validation | TC-037 |
| FR-PRIV-002 | - | Assignment PENDING_ACCEPTANCE | GET /projects/{id}/company-data | TC-038 |
| FR-TASK-006 | BR-SLA-004 | - | (job sla.evaluate) | TC-039 |
| FR-PROJECT-010 | - | Project override | POST /projects/{id}/override-status | TC-040 |

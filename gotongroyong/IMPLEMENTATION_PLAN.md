# Implementation Plan

Estimasi durasi mengasumsikan tim 2 full-stack engineer, 1 QA paruh waktu, 1 PM/designer paruh waktu. `TBD: Requires business validation`.

| Phase | Objective | Deliverables | Dependencies | Risks | Definition of Done | Estimasi |
|---|---|---|---|---|---|---|
| 0. Architecture and Foundation | Fondasi repo dan infrastruktur | Monorepo, CI, Docker Compose, staging, skema awal, enum shared, outbox, audit log, logger, clock | RBD-03, RBD-08 | Salah pilih stack | Pipeline hijau, deploy staging otomatis, audit trigger aktif | 1 minggu |
| 1. Authentication and RBAC | Akses aman | Register, login, session, CSRF, reset password, invitation, permission seed, scope guard, MFA-ready, permission test generator | Phase 0 | Celah akses | TC-019, TC-020, TC-030 lulus | 1,5 minggu |
| 2. Client and Order | Client dapat memesan | Katalog, order, consent, halaman order | Phase 1 | Kebutuhan form belum final | Client membuat order di staging | 1 minggu |
| 3. Payment | Pembayaran terverifikasi | Provider adapter, webhook inbox, reconcile, order expiry | Phase 2, RBD-01, TV-02 | Perilaku webhook gateway | TC-001 sampai TC-005 lulus di sandbox | 1,5 minggu |
| 4. Project and Workflow | Project berjalan otomatis | Template PT dan CV, instansiasi, task engine, dependency, state machine, assignment admin, company data form | Phase 3, LR-01 draft | Template belum dikonfirmasi Notary | TC-018, TC-026, TC-027 lulus | 2 minggu |
| 5. Document Management | Dokumen aman dan terlacak | Upload intent, storage, ClamAV, validasi, versioning, dedup, review queue, auto-complete DECLARED | Phase 4 | Kualitas foto KTP mobile | TC-006, TC-010 sampai TC-012 lulus | 2 minggu |
| 6. Notary Workspace | Notary bekerja di platform | Accept/decline, daftar task, upload, signing appointment, komentar | Phase 5 | Adopsi Notary rendah | Notary uji coba menyelesaikan 1 project staging | 1 minggu |
| 7. Admin Dashboard | Admin action-first | Today's Actions, follow-up tasks, validasi data, Final QA, Communication Center in-app, internal note | Phase 6 | Terlalu banyak item | Admin uji coba memakai tanpa spreadsheet selama 1 minggu UAT | 1,5 minggu |
| 8. Super Admin Dashboard | Monitoring management | KPI, drill-down, user management, konfigurasi SLA dan kalender, audit search | Phase 7 | Metrik salah definisi | Angka dashboard cocok dengan query manual | 1 minggu |
| 9. WhatsApp Integration | Komunikasi tanpa grup | Provider adapter, template, outbound, inbound, resolver, relay, media ke pipeline | Phase 7, RBD-02, TV-01 | Kebijakan provider | TC-008, TC-009, TC-021 lulus di test number | 2,5 minggu |
| 10. SLA and Escalation | Keterlambatan terdeteksi dini | Business calendar, clock, pause, health, reminder, eskalasi, delivery fallback | Phase 4 (dapat paralel dengan 9) | Salah hitung waktu | TC-013 sampai TC-017, TC-022, TC-023 lulus | 2 minggu |
| 11. Analytics | Evaluasi kinerja | Agregasi harian, metrik ANALYTICS.md, risk score | Phase 10 | Data belum cukup | Metrik terverifikasi terhadap data sintetis | 1 minggu |
| 12. AI Automation | Kurangi review manual | Classifier (feature flag), evaluasi sampel | Phase 9, TV-04, LR-06 | Akurasi rendah | Precision memenuhi target pada sampel | 1,5 minggu |
| 13. Security Hardening | Siap produksi | MFA wajib internal, hash chain verify, pentest, perbaikan temuan, alert lengkap | Semua fase fungsional | Temuan pentest besar | Tidak ada temuan high/critical terbuka | 1,5 minggu |
| 14. Production Launch | Operasional nyata | Migrasi data aktif (jika ada), pelatihan, runbook, go-live bertahap dengan feature flag | Phase 13, tinjauan hukum | Resistensi perubahan | 2 minggu operasi tanpa spreadsheet, SLA terukur | 1 minggu + hypercare 2 minggu |

Catatan urutan: Phase 10 menyediakan kalkulator SLA yang dipakai oleh Phase 7 (health di Today's Actions). Kalkulator business calendar dibangun lebih awal di Phase 4 sebagai library, lalu job dan eskalasi di Phase 10.

Total estimasi kasar: 20 sampai 24 minggu. Dengan urutan MVP (tanpa Phase 11 dan 12 penuh) dapat go-live di minggu 18 sampai 20.

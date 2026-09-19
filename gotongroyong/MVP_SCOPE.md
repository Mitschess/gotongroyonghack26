# MVP Scope

## 1. Prinsip

MVP harus membuat bisnis berjalan tanpa spreadsheet dan grup WhatsApp. Fitur yang hanya meningkatkan efisiensi setelah alur berjalan menunggu fase berikutnya.

## 2. P0: MUST HAVE

| Fitur | Alasan bisnis | Alasan teknis |
|---|---|---|
| Auth, RBAC, scope data | Dokumen identitas tidak boleh bocor sejak hari pertama | Semua modul bergantung pada otorisasi |
| Katalog, order, pembayaran via webhook | Pendapatan masuk tanpa verifikasi manual | Project dibuat dari pembayaran terverifikasi |
| Project, workflow PT dan CV, task engine | Inti pengganti spreadsheet | Fondasi SLA, notifikasi, dashboard |
| Upload web, validasi, malware scan, versioning, review manual | Dokumen masuk dengan aman dan dapat dilacak | Fail-safe sebelum automation |
| Auto-complete task dari dokumen DECLARED via web | Automation First dengan risiko rendah | Tipe pasti dari slot |
| Final QA dan delivery via link portal + email | Client menerima dokumen dengan aman | Gerbang manusia untuk dokumen legal |
| SLA engine, business calendar, health | Keterlambatan terlihat lebih awal | Pemicu reminder dan eskalasi |
| Reminder dan eskalasi L1 sampai L3 | Tidak ada project yang diam | Rules sederhana berbasis tabel |
| Notifikasi in-app dan email | Channel dasar yang andal | Tidak bergantung persetujuan provider WhatsApp |
| Dashboard Admin (Today's Actions), Client (timeline), Notary (tugas), SA (monitoring dasar) | Setiap role tahu apa yang harus dilakukan | Read model dari data yang sama |
| Communication Center in-app dengan internal note | Komunikasi terpusat | Fondasi relay WhatsApp |
| Audit log append-only | Akuntabilitas | Sulit ditambah belakangan secara konsisten |
| Consent capture | Kewajiban pelindungan data | Harus ada sebelum data pertama masuk |

## 3. P1: SHOULD HAVE

| Fitur | Alasan menunda | Alasan penting |
|---|---|---|
| WhatsApp notifikasi keluar (template) | Butuh verifikasi bisnis dan template approval | Channel utama Client dan Notary di Indonesia |
| WhatsApp inbound + proxy relay + resolusi project | Kompleksitas tertinggi, butuh validasi provider | Menghapus grup WhatsApp |
| Klasifikasi dokumen WhatsApp (heuristik + AI) | Butuh sampel data nyata | Otomatisasi dokumen dari WhatsApp |
| Risk score | Butuh data untuk kalibrasi | Prioritas lebih tajam |
| Analytics lengkap dan drill-down SA | Butuh data historis | Evaluasi kinerja |
| MFA wajib Admin | Dapat menyusul setelah alur stabil | Mitigasi credential theft |
| Invoice PDF | Dapat dikirim manual sementara | Profesionalitas |
| Audit hash chain dan verifikasi | Append-only sudah melindungi jalur aplikasi | Tamper evidence |

## 4. P2: COULD HAVE

OCR KTP prefill, intent detection pesan, editor workflow template visual, preferensi notifikasi granular, ekspor data subject request otomatis, push notification.

## 5. P3: FUTURE

Ringkasan AI, saran follow-up AI, multi-tenant, layanan legalitas lain, payout Notary, integrasi sistem pemerintah jika tersedia jalur resmi, tanda tangan elektronik (LEGAL_REVIEW_REQUIRED).

## 6. Kriteria MVP Siap Rilis

1. Satu project PT dan satu project CV berjalan end-to-end di staging dengan data sintetis.
2. Semua TC kritis P0 lulus.
3. Pentest eksternal tanpa temuan high atau critical terbuka.
4. Tinjauan hukum LR-01, LR-04, LR-10 selesai.
5. Uji restore backup berhasil.

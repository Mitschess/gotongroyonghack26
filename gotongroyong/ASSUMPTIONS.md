# Assumptions, Open Questions, dan Keputusan Tertunda

## 1. ASSUMPTION

| ID | Asumsi | Dampak jika salah |
|---|---|---|
| A-001 | Satu organisasi penyedia jasa (single-tenant) | Perlu kolom `tenant_id` dan isolasi data |
| A-002 | Pembayaran penuh di muka | Perlu model termin dan status PARTIALLY_PAID |
| A-003 | Notary adalah mitra eksternal dengan akun platform | Jika Notary internal, alur accept/decline dapat disederhanakan |
| A-004 | UI hanya Bahasa Indonesia pada MVP | Perlu i18n untuk Client asing |
| A-005 | Zona waktu bisnis Asia/Jakarta | Perlu kalender per Notary |
| A-006 | Hari kerja Senin sampai Jumat, 09:00 sampai 17:00 | SLA salah hitung |
| A-007 | Project Clock mulai saat DATA_VALIDATION selesai | Janji 5 hari ke Client berbeda definisi |
| A-008 | Libur nasional diisi manual oleh Super Admin | Butuh integrasi sumber libur |
| A-009 | Satu user satu role | UI switch role diperlukan |
| A-010 | Satu nomor WhatsApp bisnis platform | Routing per nomor diperlukan |
| A-011 | Satu Notary aktif per project | Model multi-Notary diperlukan |
| A-012 | Bobot priority score dan risk score awal | Prioritas tidak akurat sampai kalibrasi |
| A-013 | Beban load test awal (50 user internal konkuren, 5.000 task aktif) | Ukuran infrastruktur berubah |
| A-014 | Volume tahun pertama di bawah 200 project baru per bulan | Arsitektur tetap cukup sampai jauh di atas angka ini, tetapi biaya WhatsApp berubah |
| A-015 | File karantina disimpan 30 hari | Kebijakan retensi |
| A-016 | Raw webhook disimpan 90 hari lalu PII dihapus | Kebijakan retensi |
| A-017 | Client adalah perwakilan pendiri dan berwenang mengunggah data semua pendiri | Butuh consent per pendiri |
| A-018 | Admin dan Super Admin adalah karyawan perusahaan penyedia | Model kontrak akses |

## 2. OPEN QUESTION

| ID | Pertanyaan | Default sementara |
|---|---|---|
| Q-001 | Apakah janji "5 hari" ke Client dihitung dari pembayaran, dari data lengkap, atau dari validasi? | Dari validasi data (A-007) |
| Q-002 | Berapa batas revisi draft? | 3 kali |
| Q-003 | Apakah Admin boleh upload dokumen atas nama Notary? | Boleh dengan `on_behalf_of` dan audit |
| Q-004 | Apakah Client boleh chat langsung ke Notary sebelum Notary menerima? | Tidak |
| Q-005 | Apakah Notary dibayar per project melalui platform? | Tidak di MVP |
| Q-006 | Apakah ada paket layanan dengan deliverable berbeda (contoh: termasuk NIB)? | Dikonfigurasi per paket |
| Q-007 | Siapa yang menanggung biaya pesan WhatsApp keluar? | Perusahaan penyedia |

## 3. TBD

| Item | Dokumen |
|---|---|
| Ukuran file maksimal final | DOCUMENT_MANAGEMENT.md |
| Order expiry final | BUSINESS_RULES.md |
| Rate limit final | API_SPECIFICATION.md |
| Retensi dokumen dan audit | PRIVACY.md |
| Target SLA compliance | ANALYTICS.md |
| RPO/RTO final | DEPLOYMENT.md |

## 4. REQUIRES BUSINESS DECISION

| ID | Keputusan |
|---|---|
| RBD-01 | Pilihan payment gateway |
| RBD-02 | Pilihan provider WhatsApp dan anggaran pesan |
| RBD-03 | Pilihan cloud provider |
| RBD-04 | Kebijakan refund per stage |
| RBD-05 | Pengiriman dokumen final sebagai lampiran WhatsApp atau hanya link portal |
| RBD-06 | Eskalasi L3 di luar jam kerja |
| RBD-07 | Definisi janji 5 hari ke Client (Q-001) |
| RBD-08 | Stack Option A atau B berdasarkan tim yang tersedia |
| RBD-09 | Kewajiban pajak dan format invoice |

## 5. LEGAL_REVIEW_REQUIRED

| ID | Topik |
|---|---|
| LR-01 | Urutan tahap pendirian PT dan CV, dokumen wajib, dan deliverable |
| LR-02 | Mekanisme penandatanganan akta dan kehadiran penghadap |
| LR-03 | Batas wilayah jabatan Notary terhadap domisili perusahaan |
| LR-04 | Peran pengendali dan prosesor data menurut UU PDP |
| LR-05 | Kewajiban pendaftaran PSE lingkup privat |
| LR-06 | Lokasi pemrosesan data dan provider luar negeri (email, AI) |
| LR-07 | Retensi dokumen, audit log, dan hak penghapusan |
| LR-08 | Kewajiban kerahasiaan Notary dan akses data sebelum accept |
| LR-09 | Tenggat dan prosedur pemberitahuan kegagalan pelindungan data |
| LR-10 | Teks consent dan kebijakan privasi |
| LR-11 | Jumlah usulan nama perusahaan dan aturan nama |

## 6. TECHNICAL_VALIDATION_REQUIRED

| ID | Item |
|---|---|
| TV-01 | Kemampuan provider WhatsApp: template, jendela layanan, relay teks bebas, retensi media |
| TV-02 | Skema signature dan retry webhook payment gateway |
| TV-03 | Laporan settlement untuk rekonsiliasi harian |
| TV-04 | Akurasi classifier pada sampel 200 dokumen |
| TV-05 | Grouping per aggregate di BullMQ versi terpilih |
| TV-06 | Parameter argon2id pada hardware produksi |
| TV-07 | Object lock atau WORM di storage terpilih |
| TV-08 | Integrasi dengan sistem pemerintah (tidak dalam MVP) |

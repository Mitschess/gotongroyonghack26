# Privacy

Platform memproses data pribadi: nama, NIK dan data KTP, KK, NPWP, alamat, nomor telepon, email, dan dokumen legal perusahaan. Dokumen ini menetapkan kontrol teknis. Dokumen ini bukan opini hukum.

## 1. Kerangka Regulasi yang Perlu Dikonfirmasi

| Regulasi | Relevansi | Status |
|---|---|---|
| UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP) | Dasar pemrosesan, hak subjek data, kewajiban pengendali, pemberitahuan kegagalan pelindungan | LEGAL_REVIEW_REQUIRED |
| UU ITE dan PP 71/2019 tentang Penyelenggaraan Sistem dan Transaksi Elektronik | Kewajiban penyelenggara sistem elektronik, lokasi pemrosesan data | LEGAL_REVIEW_REQUIRED |
| Ketentuan pendaftaran Penyelenggara Sistem Elektronik lingkup privat | Kemungkinan kewajiban pendaftaran platform | LEGAL_REVIEW_REQUIRED |
| UU Jabatan Notaris | Kewajiban kerahasiaan Notaris atas isi akta, penyimpanan minuta | LEGAL_REVIEW_REQUIRED |
| Regulasi pendirian PT dan pendaftaran CV | Data minimum yang wajib dikumpulkan | LEGAL_REVIEW_REQUIRED |

Tim tidak boleh menganggap tabel ini lengkap. Konsultan hukum wajib memvalidasi sebelum Phase 14.

## 2. Peran Pemrosesan

`LEGAL_REVIEW_REQUIRED`: apakah perusahaan penyedia platform bertindak sebagai pengendali data, dan bagaimana posisi Notary (pengendali terpisah, prosesor, atau pengendali bersama).

## 3. Kontrol Privacy by Design

| Prinsip | Kontrol |
|---|---|
| Data minimization | Form hanya meminta field yang dibutuhkan template layanan. Field opsional ditandai jelas. |
| Purpose limitation | Data hanya dipakai untuk layanan legalitas dan notifikasi terkait. Tidak ada pemakaian untuk pemasaran tanpa consent terpisah. |
| Access control | AUTHORIZATION.md. Notary hanya melihat project assigned. |
| Masking | NIK ditampilkan sebagian (`3273********0001`) di list. Tampilan penuh hanya di detail dan tercatat audit. |
| Enkripsi | SECURITY.md bagian 1 |
| Logging akses | Setiap view data identitas dan download dokumen tercatat |
| Privasi komunikasi | WhatsApp proxy, nomor tidak dibagikan |
| AI | Data dikirim ke provider AI hanya jika provider memenuhi syarat (tidak memakai data untuk training, lokasi pemrosesan jelas). TECHNICAL_VALIDATION_REQUIRED dan LEGAL_REVIEW_REQUIRED. |

## 4. Consent

| Consent | Kapan | Disimpan di |
|---|---|---|
| Kebijakan privasi dan syarat layanan | Registrasi | `client_profiles.consent_version`, `consent_at` |
| Notifikasi WhatsApp | Registrasi | `users.wa_opt_in_at` |
| Berbagi data dengan Notary | Pembuatan order | Audit `CONSENT_GIVEN` dengan versi teks |

Perubahan teks consent menaikkan versi dan meminta persetujuan ulang saat login berikutnya.

## 5. Hak Subjek Data

| Hak | Mekanisme MVP | SLA internal |
|---|---|---|
| Akses | Client melihat data di portal. Permintaan salinan lewat `/privacy/requests` | TBD (LEGAL_REVIEW_REQUIRED) |
| Ekspor | Job membuat arsip JSON dan dokumen, link 24 jam | TBD |
| Koreksi | Client mengubah data saat DATA_COLLECTION. Setelahnya lewat permintaan dan Admin. | TBD |
| Penghapusan | Permintaan ditinjau. Data yang wajib disimpan karena kewajiban hukum tidak dihapus. | TBD |
| Penarikan consent | Menonaktifkan notifikasi dan pemrosesan opsional | TBD |

## 6. Retensi

| Data | Retensi usulan | Status |
|---|---|---|
| Dokumen project DELIVERED | TBD | REQUIRES BUSINESS DECISION dan LEGAL_REVIEW_REQUIRED |
| Dokumen project CANCELLED | TBD | REQUIRES BUSINESS DECISION |
| Audit log | TBD | LEGAL_REVIEW_REQUIRED |
| File QUARANTINED | 30 hari lalu hapus aman | ASSUMPTION A-015 |
| Upload tidak selesai | 1 jam lalu hapus | Final |
| Raw webhook payload | 90 hari lalu hapus field PII | ASSUMPTION A-016 |

Job `retention.enforce` berjalan harian. Penghapusan aman: hapus objek storage termasuk seluruh versi, hapus atau anonimisasi baris database, catat `DATA_PURGED` di audit (tanpa PII).

## 7. Lokasi Data

Rekomendasi: database, storage, dan backup di region Indonesia. `LEGAL_REVIEW_REQUIRED` untuk kewajiban lokasi data dan pemakaian provider AI atau email di luar negeri.

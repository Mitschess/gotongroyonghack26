# User Roles

Permission detail per fitur ada di `AUTHORIZATION.md`. Dokumen ini mendefinisikan identitas, scope data, dan batasan setiap role.

## 1. Ringkasan

| Role | Kode | Cara akun dibuat | MFA | Scope data default |
|---|---|---|---|---|
| Super Admin | `SUPER_ADMIN` | Seed awal atau undangan Super Admin lain | Wajib | Semua data |
| Admin | `ADMIN` | Undangan Super Admin | Wajib (Phase 13) | Project tempat ia menjadi primary atau secondary admin |
| Client | `CLIENT` | Registrasi mandiri | Opsional | Data dan project milik sendiri |
| Notary | `NOTARY` | Undangan Super Admin | Direkomendasikan | Project yang di-assign |

`ASSUMPTION A-009`: satu user memiliki satu role. Skema tetap mendukung banyak role untuk kebutuhan masa depan.

## 2. Super Admin

**Tujuan:** memantau risiko dan kinerja, mengatur konfigurasi, menerima eskalasi L3.

Kapabilitas:
- Melihat semua project, client, dokumen, pembayaran, pesan eksternal dan internal.
- Mengelola user, role, SLA policy, workflow template, business calendar, template notifikasi.
- Mengubah assignment Admin dan Notary.
- Override status dengan alasan wajib. Override tercatat sebagai `STATUS_OVERRIDDEN`.
- Mencatat refund.
- Mencari audit log.

Batasan:
- Tidak dapat mengubah atau menghapus audit log.
- Tidak dapat menandai dokumen legal-critical VERIFIED tanpa membuka dokumen (sistem mencatat event `DOCUMENT_VIEWED` sebelum approve).

## 3. Admin

**Tujuan:** koordinasi. Admin bukan pemroses dokumen utama.

Kapabilitas:
- Melihat Today's Actions untuk project yang ia tangani.
- Follow-up Client dan Notary lewat Communication Center.
- Memvalidasi data Client pada tahap DATA_VALIDATION.
- Mereview dokumen berstatus NEEDS_REVIEW.
- Melakukan Final QA.
- Memicu eskalasi manual.
- Menjeda project (ON_HOLD) dan memasang pause reason SLA dengan alasan.
- Mengonfirmasi atau mengganti usulan Notary.

Batasan:
- Tidak mengelola user dan konfigurasi global.
- Tidak melihat project lain kecuali diberi akses oleh Super Admin.
- Tidak mencatat refund.

## 4. Client

**Tujuan:** menyelesaikan kewajiban data dan menerima dokumen.

Kapabilitas: register, login, order, bayar, isi data perusahaan, upload dokumen, review dan setujui draft, lihat timeline, kirim pertanyaan, unduh dokumen final, lihat histori.

Tidak boleh melihat: internal note, pesan internal, nomor telepon Notary, data client lain, eskalasi, audit internal, risk score, SLA internal.

Client melihat label progress sederhana. Pemetaan label ada di `UX_SPECIFICATION.md`.

## 5. Notary

**Tujuan:** memproses dokumen legal pada project yang di-assign.

Kapabilitas:
- Menerima atau menolak assignment.
- Melihat data Client yang dibutuhkan untuk akta.
- Upload draft, akta, surat kuasa, bukti pendaftaran, dokumen final.
- Mengatur jadwal signing.
- Menulis komentar pada task dan dokumen.
- Mengirim dan menerima pesan dengan Client lewat proxy.

Batasan:
- Tidak melihat project yang tidak di-assign.
- Tidak melihat nominal pembayaran. Hanya flag lunas.
- Tidak melihat internal note dengan visibility `INTERNAL_ADMIN`.
- Tidak mengubah status project secara langsung. Progress berubah dari event yang valid (K-05).

`LEGAL_REVIEW_REQUIRED`: batas data Client yang boleh dilihat Notary sebelum ia menerima assignment.

## 6. System Actor

| Actor | Kode audit | Contoh aksi |
|---|---|---|
| Workflow engine | `system:workflow` | Aktivasi task berikutnya |
| SLA scheduler | `system:sla` | Hitung health, kirim reminder |
| Document worker | `system:document` | Klasifikasi, verifikasi otomatis |
| Webhook processor | `system:webhook` | Update pembayaran |

## 7. Aturan Assignment

| Aturan | Detail |
|---|---|
| BR-ASSIGN-001 | Setiap project punya tepat satu primary admin aktif. |
| BR-ASSIGN-002 | Primary admin dipilih otomatis: Admin aktif dengan jumlah project aktif paling sedikit. Seri diputus oleh waktu assignment terakhir paling lama. |
| BR-ASSIGN-003 | Setiap project punya maksimal satu Notary aktif. |
| BR-ASSIGN-004 | Sistem mengusulkan Notary. Admin mengonfirmasi. Mode auto-confirm dapat diaktifkan Super Admin. |
| BR-ASSIGN-005 | Notary wajib accept atau decline dalam SLA task NOTARY_ACCEPTANCE. Decline atau timeout memicu reassignment. |
| BR-ASSIGN-006 | Reassignment menyimpan histori di `project_members` dengan `ended_at`. |

`LEGAL_REVIEW_REQUIRED`: apakah wilayah jabatan Notaris harus sesuai dengan domisili perusahaan. Jika ya, usulan Notary wajib memfilter berdasarkan wilayah.

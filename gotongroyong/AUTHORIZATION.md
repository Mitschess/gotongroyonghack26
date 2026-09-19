# Authorization

## 1. Model

RBAC dengan scope data. Keputusan akses = `permission(role, action)` AND `scope(user, resource)`.

| Scope | Definisi |
|---|---|
| ALL | Semua resource |
| ASSIGNED | Project dengan `project_members.user_id = user` dan `ended_at is null` |
| OWN | Resource milik user (`client_id = user`, `uploaded_by = user`, `actor_user_id = user`) |
| NONE | Tidak ada akses |

Implementasi: NestJS guard `@Permission('project.read')` + policy class per resource yang menambah filter SQL. Query list selalu memakai filter scope di level repository, bukan filter setelah fetch.

## 2. Permission Matrix

Legenda: ✓ penuh, A = assigned project, O = own, L = terbatas (lihat catatan), ✕ tidak.

| Fitur | Super Admin | Admin | Client | Notary | Catatan |
|---|---|---|---|---|---|
| Lihat daftar project | ✓ | A | O | A | |
| Lihat detail project | ✓ | A | O (view client) | A | Client melihat label sederhana |
| Buat order | ✕ | ✕ | ✓ | ✕ | |
| Kelola user | ✓ | ✕ | ✕ | ✕ | |
| Kelola role dan permission | ✓ | ✕ | ✕ | ✕ | MVP: role tetap |
| Kelola workflow template | ✓ | ✕ | ✕ | ✕ | |
| Kelola SLA policy dan kalender | ✓ | ✕ | ✕ | ✕ | |
| Assign primary admin | ✓ | ✕ | ✕ | ✕ | Otomatis oleh sistem, override oleh SA |
| Assign Notary | ✓ | A | ✕ | ✕ | Admin konfirmasi usulan |
| Accept atau decline assignment | ✕ | ✕ | ✕ | L | Hanya saat PENDING_ACCEPTANCE |
| Isi data perusahaan | ✓ | A | O | ✕ | Client hanya saat DATA_COLLECTION |
| Lihat data perusahaan | ✓ | A | O | A | Notary setelah accept (LEGAL_REVIEW_REQUIRED) |
| Validasi data | ✓ | A | ✕ | ✕ | |
| Upload dokumen | ✓ | A | L | L | Client: slot tipe Client. Notary: slot tipe Notary. |
| Lihat dokumen | ✓ | A | L | A | Client tidak melihat dokumen yang belum VERIFIED milik Notary, kecuali draft untuk review |
| Unduh dokumen | ✓ | A | L | A | Semua unduhan diaudit |
| Review dokumen NEEDS_REVIEW | ✓ | A | ✕ | ✕ | |
| Final QA | ✓ | A | ✕ | ✕ | |
| Approve draft | ✕ | ✕ | O | ✕ | Keputusan Client |
| Lihat pesan eksternal project | ✓ | A | O | A | |
| Kirim pesan eksternal | ✓ | A | O | A | |
| Lihat internal note INTERNAL_ADMIN | ✓ | A | ✕ | ✕ | |
| Lihat internal note INTERNAL_WITH_NOTARY | ✓ | A | ✕ | A | |
| Lihat pembayaran | ✓ | A | O | L | Notary: flag lunas saja, tanpa nominal |
| Catat refund | ✓ | ✕ | ✕ | ✕ | |
| Hold dan resume project | ✓ | A | ✕ | ✕ | |
| Cancel project | ✓ | ✕ | ✕ | ✕ | Admin dapat mengajukan lewat eskalasi |
| Pasang SLA pause | ✓ | A | ✕ | ✕ | Alasan wajib |
| Lihat SLA dan health | ✓ | A | ✕ | L | Notary: tenggat task miliknya |
| Lihat risk score | ✓ | A | ✕ | ✕ | |
| Picu eskalasi manual | ✓ | A | ✕ | ✕ | |
| Acknowledge atau resolve eskalasi | ✓ | L | ✕ | ✕ | Admin: eskalasi yang ditujukan kepadanya |
| Override status | ✓ | ✕ | ✕ | ✕ | Alasan wajib |
| Lihat audit log | ✓ | A | O | O | Admin: project assigned. Client dan Notary: aktivitas sendiri |
| Verifikasi hash chain audit | ✓ | ✕ | ✕ | ✕ | |
| Lihat analytics | ✓ | L | ✕ | ✕ | Admin: metrik pribadi |
| Resolve pesan tanpa project | ✓ | ✓ | ✕ | ✕ | Admin melihat antrean global karena project belum diketahui (hanya metadata minimal) |
| Ajukan permintaan data pribadi | ✕ | ✕ | ✓ | ✓ | |

## 3. Kode Permission

Format `resource.action[.scope]`. Contoh: `project.read.assigned`, `document.review.assigned`, `payment.refund.all`, `audit.read.own`. Daftar lengkap di-seed dari `packages/shared/src/permissions.ts` dan menjadi sumber tunggal untuk guard dan UI.

## 4. Aturan Tambahan

| ID | Aturan |
|---|---|
| AUTHZ-001 | Resource di luar scope mengembalikan 404. |
| AUTHZ-002 | Signed URL dibuat hanya setelah cek otorisasi dan berlaku 5 menit. |
| AUTHZ-003 | Admin yang di-reassign kehilangan akses project pada saat `ended_at` terisi. Session aktif mengikuti karena cek scope berjalan per request. |
| AUTHZ-004 | Notary yang declined atau ended kehilangan akses data perusahaan dan dokumen. Riwayat dokumen yang ia unggah tetap tercatat. |
| AUTHZ-005 | User DISABLED: semua session direvoke. Task miliknya memicu reassignment. |
| AUTHZ-006 | Super Admin tidak dapat menghapus audit log atau menonaktifkan dirinya jika ia Super Admin aktif terakhir. |

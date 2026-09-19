# Edge Cases

Setiap kasus memuat Detection, Handling, Fallback, Notification, Audit, Recovery.

| ID | Kasus | Detection | Handling | Fallback | Notification | Audit | Recovery |
|---|---|---|---|---|---|---|---|
| EC-01 | Payment webhook ganda | Unique `(provider, provider_event_id)` | Insert kedua diabaikan, respons 200 | State guard di consumer | Tidak ada | Event duplikat dicatat di log aplikasi | Tidak diperlukan |
| EC-02 | Payment webhook terlambat (setelah order EXPIRED) | `getStatus` PAID pada order EXPIRED | Transisi EXPIRED -> PAID, buat project | Jika order CANCELLED: tidak transisi, tandai refund candidate | Admin dan SA | PAYMENT_CONFIRMED + metadata `late=true` | Admin konfirmasi ke Client |
| EC-03 | Client upload dokumen salah | Classifier tipe berbeda dari slot, atau Admin menolak di validasi | NEEDS_REVIEW atau REJECTED dengan alasan | Admin ubah tipe | Client menerima alasan dan instruksi | DOCUMENT_REJECTED | Client upload ulang, versi baru |
| EC-04 | Client upload duplikat | SHA-256 sama di slot | Tolak dengan pesan "sudah diterima" | Tidak ada | Pesan inline | Log aplikasi | Tidak diperlukan |
| EC-05 | Notary kirim dokumen ke project salah | Kode project tidak cocok dengan konteks, hash lintas project, atau Admin menemukan saat review | NEEDS_REVIEW `PROJECT_AMBIGUOUS` atau `CROSS_PROJECT_DUPLICATE` | Admin pindah project (`/documents/{id}/reassign-project`) | Admin, Notary | DOCUMENT_REASSIGNED | Task project salah di-reopen jika sempat selesai |
| EC-06 | WhatsApp webhook ganda | Unique `provider_event_id` | Abaikan duplikat | Unique `messages.provider_message_id` | Tidak ada | Log aplikasi | Tidak diperlukan |
| EC-07 | WhatsApp provider tidak tersedia | Circuit breaker terbuka, error rate > 50% dalam 5 menit | Tahan outbound di queue | Email dan in-app | Alert teknis, banner internal | Log dan metrik | Kirim ulang saat circuit tertutup, pesan lebih dari 24 jam dikirim sebagai template ringkas |
| EC-08 | Klasifikasi dokumen gagal | Error provider atau confidence rendah | NEEDS_REVIEW | Alur manual | Admin (review queue) | DOCUMENT_CLASSIFIED dengan hasil gagal | Admin tetapkan tipe |
| EC-09 | File corrupt | Parse PDF atau decode gambar gagal | Tolak versi | Minta upload ulang | Pengunggah | DOCUMENT_REJECTED `CORRUPT_FILE` | Upload ulang |
| EC-10 | File terlalu besar | Validasi upload intent atau ukuran media WhatsApp | Tolak | Sarankan kompresi atau upload web | Pengunggah | Log | Upload ulang |
| EC-11 | Notary mengganti versi dokumen | Upload baru di slot yang sama | Versi baru. Jika versi lama sudah VERIFIED dan sudah dipakai (contoh: draft sudah disetujui), task terkait di-reopen | NEEDS_REVIEW jika stage sudah lewat | Admin dan Client (jika draft) | DOCUMENT_SUPERSEDED, TASK_REOPENED | Client review ulang |
| EC-12 | Client tidak merespons | CLIENT_CADENCE (1, 2, 3, 5 bd) | Reminder bertahap, follow-up task Admin | Usulan ON_HOLD | Client, Admin | REMINDER dicatat di notifikasi | Admin hubungi via telepon, hold jika perlu |
| EC-13 | Admin tidak merespons | Task ADMIN breach | Eskalasi L1 lalu L3 | SA reassign | Admin, SA | ESCALATION_TRIGGERED | SA pindahkan project |
| EC-14 | Notary tidak merespons | Task NOTARY breach, acceptance timeout | Eskalasi L1, L2, L3 | Reassign Notary | Notary, Admin, SA | ESCALATION_TRIGGERED | Reassign, histori tetap |
| EC-15 | Project dijeda | Admin hold | Status ON_HOLD, pause clock | Pause punya `expected_end_at` | Client (pesan netral), Notary | PROJECT_HELD | Resume ke `previous_status` |
| EC-16 | Project dibatalkan | SA cancel atau refund | CANCELLED, task CANCELLED, eskalasi AUTO_RESOLVED | Tidak ada | Client, Notary, Admin | PROJECT_CANCELLED | Tidak dapat diaktifkan ulang (BR-PROJECT-006) |
| EC-17 | Pembayaran di-refund | SA catat refund | Order dan payment REFUNDED, project CANCELLED jika belum DELIVERED | Refund setelah DELIVERED hanya dicatat | Client, Admin | REFUND_RECORDED | Rekonsiliasi harian cocokkan dengan gateway |
| EC-18 | SLA dijeda | Pause dibuat | Clock berhenti | Pause lewat `expected_end_at` memicu notif | Admin | SLA_PAUSED, SLA_RESUMED | Resume manual atau otomatis |
| EC-19 | Akun user dinonaktifkan | SA disable | Revoke session, task milik user memicu reassignment | Task tanpa owner masuk antrean SA | SA, Admin | USER_DISABLED | Reassign |
| EC-20 | Notary di-reassign | Admin/SA reassign | Member lama ENDED, task Notary lama dipindah ke Notary baru, clock task mulai ulang | Dokumen lama tetap tersimpan | Notary lama, baru, Client (pesan netral) | USER_UNASSIGNED, USER_ASSIGNED | Notary baru review histori |
| EC-21 | Admin di-reassign | SA reassign | Primary admin berganti, follow-up task pindah | Tidak ada | Admin lama dan baru | USER_ASSIGNED | Tidak diperlukan |
| EC-22 | System downtime | Health check gagal | Webhook provider di-retry oleh provider (TECHNICAL_VALIDATION_REQUIRED), reconcile menutup celah | Halaman maintenance | Status page internal | Log infrastruktur | Job SLA menghitung ulang dari timestamp. Tidak ada waktu hilang. |
| EC-23 | Notifikasi gagal | Delivery FAILED | Retry, fallback channel | In-app selalu ada | Alert jika failure rate > 10% dalam 15 menit | notification_deliveries | Replay dari DLQ |
| EC-24 | Delivery dokumen gagal | Semua channel FAILED | Project tetap COMPLETED | In-app | Eskalasi L2 | DELIVERY_FAILED | Admin kirim manual lewat Communication Center setelah memperbaiki kontak |

## Edge Case Tambahan

| ID | Kasus | Handling singkat |
|---|---|---|
| EC-25 | Nominal pembayaran berbeda | Status tidak berubah, alert SA, PAYMENT_AMOUNT_MISMATCH |
| EC-26 | Pesan dari nomor tidak terdaftar | Balasan generik, antrean Admin, tidak diteruskan |
| EC-27 | Client punya beberapa project aktif | Resolusi ASK_USER |
| EC-28 | Tidak ada Notary tersedia | Eskalasi L3 (ESC-R08), project tetap IN_PROGRESS dengan blocked_on SYSTEM |
| EC-29 | Revisi draft melebihi batas | Task Admin untuk keputusan, notif SA |
| EC-30 | Kalender libur tahun depan kosong | Alert SA 1 Desember |
| EC-31 | Event tiba tidak berurutan (task.completed sebelum document.verified tersimpan) | State guard dan re-read dari database, bukan dari payload |

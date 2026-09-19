# Analytics

Semua durasi dihitung dalam business time (SLA_ENGINE.md) kecuali disebut kalender. Periode default: bulan berjalan. Agregasi harian disimpan di `analytics_daily` (dimensi: tanggal, service_type, admin_id, notary_id).

## 1. Definisi Metrik

| Metrik | Formula | Catatan |
|---|---|---|
| Average project completion time | `Σ(project_clock_elapsed) / N` untuk project COMPLETED dalam periode | Waktu proses internal (Project Clock) |
| Average calendar lead time | `Σ(completed_at - created_at) / N` dalam hari kalender | Pengalaman Client end-to-end |
| Average task completion time | `Σ(task_elapsed) / N` per `template_task_code` untuk task COMPLETED | Dikelompokkan per tipe task |
| SLA compliance (project) | `N_completed_tanpa_breach / N_completed` x 100% | Project dengan `sla_breached = false` |
| SLA compliance (task) | `N_task_internal_selesai_sebelum_due / N_task_internal_selesai` x 100% | Owner ADMIN dan NOTARY |
| Overdue tasks | Jumlah task OPEN/IN_PROGRESS dengan `sla_breached = true` saat snapshot | Snapshot harian |
| Escalations | Jumlah eskalasi dipicu dalam periode, per level | |
| Client response time | Median business time dari task Client OPEN sampai aktivitas pertama Client | Median karena distribusi miring |
| Notary response time | Median business time dari task Notary OPEN sampai aktivitas pertama Notary | |
| Admin response time | Median business time dari dokumen NEEDS_REVIEW sampai keputusan review | |
| Payment conversion | `N_order_PAID / N_order_dibuat` x 100% per kohort tanggal order | Order EXPIRED dan CANCELLED masuk penyebut |
| Project completion rate | `N_DELIVERED / (N_DELIVERED + N_CANCELLED)` untuk project yang mencapai status akhir dalam periode | |
| Document turnaround time | Median business time dari `task.opened_at` sampai dokumen VERIFIED, per tipe dokumen | |
| Auto-verify rate | `N_dokumen_VERIFIED_otomatis / N_dokumen_VERIFIED` | Mengukur efektivitas automation |
| Review override rate | `N_review_yang_mengubah_tipe_AI / N_review` | Mengukur kualitas classifier |
| Delivery success rate | `N_project_DELIVERED_tanpa_fallback / N_project_DELIVERED` | |

## 2. Dashboard Mapping

| Dashboard | Metrik |
|---|---|
| Super Admin | Semua, dengan drill-down per Admin, Notary, service |
| Admin | Task miliknya, response time pribadi, project assigned per health |
| Notary | Task terbuka, tenggat, turnaround pribadi |
| Client | Tidak ada metrik. Timeline saja. |

## 3. Aturan Data

- Metrik harian dihitung ulang penuh untuk 7 hari terakhir setiap malam untuk menangkap event terlambat.
- Project CANCELLED dikeluarkan dari metrik waktu penyelesaian.
- Target angka (contoh: SLA compliance >= 90%) adalah `TBD: Requires business validation` setelah baseline 1 bulan.

# Product Overview

## 1. Vision

Setiap order legalitas PT dan CV memiliki status yang jelas, pemilik tugas yang jelas, dan tenggat yang terukur. Tidak ada pihak yang perlu bertanya "sudah sampai mana?".

## 2. Nilai per Role

| Role | Masalah hari ini | Nilai dari platform |
|---|---|---|
| Super Admin | Tidak tahu project mana yang terlambat sampai Client komplain | Dashboard risiko, SLA compliance, drill-down |
| Admin | Membuka setiap project untuk mencari yang perlu follow-up | Daftar "Today's Actions" berurutan prioritas |
| Client | Bertanya status via chat berulang kali | Timeline progress dengan bahasa sederhana |
| Notary | Menerima dokumen dari banyak grup WhatsApp | Satu workspace tugas dan kanal WhatsApp terstruktur |

## 3. Product Principles

| # | Prinsip | Penerapan |
|---|---|---|
| 1 | Automation First | Status berubah dari event, bukan input manual Admin |
| 2 | Human in the Loop | Confidence rendah atau dokumen legal-critical wajib review manusia |
| 3 | Actionable Dashboard | Setiap widget punya tombol aksi |
| 4 | Single Source of Truth | Status resmi hanya ada di database platform |
| 5 | Auditability | Setiap perubahan penting tercatat di audit log |
| 6 | Fail Safe | Automation gagal menghasilkan NEEDS_REVIEW, bukan COMPLETED |
| 7 | Privacy by Default | Akses minimal sesuai kebutuhan tugas |
| 8 | Configurable Workflow | Template workflow disimpan dan diberi versi di database |
| 9 | Provider Agnostic | Semua integrasi lewat interface |
| 10 | Production Mindset | Idempotency, observability, backup sejak Phase 0 |

## 4. Scope

### In Scope (MVP)

Order, pembayaran, project, workflow PT dan CV, task, dokumen, WhatsApp proxy, notifikasi, SLA, eskalasi, audit, dashboard empat role.

### Out of Scope (MVP)

| Item | Alasan |
|---|---|
| Integrasi langsung ke sistem pemerintah (AHU, OSS) | Tidak ada API publik terverifikasi. TECHNICAL_VALIDATION_REQUIRED. |
| Tanda tangan elektronik akta | LEGAL_REVIEW_REQUIRED |
| Payout fee Notaris | Proses finansial terpisah |
| Multi-tenant | A-001 |
| Layanan selain pendirian PT dan CV | Fokus MVP |

## 5. Glossary

| Istilah | Definisi |
|---|---|
| Order | Permintaan layanan oleh Client sebelum lunas |
| Project | Unit kerja yang dibuat setelah Order lunas |
| Stage | Tahap workflow dalam satu Project |
| Task | Unit tugas dengan satu owner dan satu tenggat |
| Evidence | Dokumen atau event yang membuktikan task selesai |
| Business time | Waktu kerja menurut business calendar |
| Task Clock | Pengukur business time satu task |
| Project Clock | Pengukur business time proses internal satu project |
| Health | Status visual SLA: ON_TRACK, WARNING, HIGH_RISK, CRITICAL |
| Blocked on | Pihak yang sedang ditunggu: CLIENT, NOTARY, ADMIN, SYSTEM, EXTERNAL, NONE |
| Legal-critical document | DRAFT_DEED, DEED, POWER_OF_ATTORNEY, REGISTRATION_PROOF, FINAL_DOCUMENT |
| Primary admin | Admin yang accountable atas satu project |

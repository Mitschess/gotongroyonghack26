# Design System

Arah visual: modern, profesional, dapat dipercaya, korporat-legal, SaaS. Tenang dan tidak ramai.

## 1. Typography

| Token | Ukuran / line-height | Pemakaian |
|---|---|---|
| font-family | Inter, system-ui, sans-serif | Semua teks |
| font-mono | JetBrains Mono, monospace | Kode project, ID |
| text-xs | 12 / 16 | Metadata |
| text-sm | 14 / 20 | Tabel, form |
| text-base | 16 / 24 | Body (minimum untuk Client mobile) |
| text-lg | 18 / 28 | Subjudul |
| text-xl | 20 / 28 | Judul kartu |
| text-2xl | 24 / 32 | Judul halaman |
| text-3xl | 30 / 36 | Angka KPI |

Weight: 400 body, 500 label, 600 judul.

## 2. Spacing dan Radius

Skala 4 px: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Radius: sm 4, md 8, lg 12, full. Shadow: sm untuk kartu, md untuk dropdown, lg untuk modal.

## 3. Color Tokens

| Token | Light | Dark | Pemakaian |
|---|---|---|---|
| brand-primary | #1E3A8A | #93C5FD | Aksi utama, link |
| brand-primary-hover | #1E40AF | #BFDBFE | Hover |
| surface | #FFFFFF | #0F172A | Latar kartu |
| surface-muted | #F8FAFC | #1E293B | Latar halaman |
| border | #E2E8F0 | #334155 | Garis |
| text-primary | #0F172A | #F1F5F9 | Teks utama |
| text-secondary | #475569 | #94A3B8 | Teks sekunder |
| danger | #B91C1C | #F87171 | Aksi destruktif |

## 4. Status Tokens

| Health | Warna | Icon | Label | Kode |
|---|---|---|---|---|
| ON_TRACK | Hijau #15803D | lingkaran centang | Sesuai jadwal | ON_TRACK |
| WARNING | Kuning #A16207 | segitiga | Mendekati tenggat | WARNING |
| HIGH_RISK | Oranye #C2410C | tanda seru dalam segitiga | Risiko tinggi | HIGH_RISK |
| CRITICAL | Merah #B91C1C | tanda seru dalam lingkaran | Kritis / terlambat | CRITICAL |

Komponen `StatusBadge` selalu menampilkan icon + label teks. Warna tidak pernah menjadi satu-satunya penanda. Warna teks badge memenuhi kontras 4.5:1 terhadap latar badge.

Status task dan dokumen memakai badge netral dengan label (contoh: "Perlu review", "Terverifikasi", "Ditolak").

## 5. Komponen

| Komponen | Varian dan aturan |
|---|---|
| Button | primary, secondary, ghost, danger. Tinggi 40 px (desktop), 48 px (mobile). Loading state menonaktifkan klik ganda. |
| Input | text, select, date, phone (+62 prefix), NIK (mask 16 digit). Error di bawah field. |
| Card | Header, body, footer aksi. Satu aksi utama per kartu. |
| Table | Sticky header, sort, filter chip, pagination cursor. Menjadi kartu di < 1024 px. |
| Modal | Untuk konfirmasi dan form pendek. Aksi destruktif wajib ketik alasan. |
| Toast | success, info, warning, error. Hilang 5 detik kecuali error. |
| Notification center | Panel samping, grup per hari, tanda belum dibaca |
| Timeline | Vertikal. Titik: selesai (centang), berjalan (titik penuh), belum (lingkaran kosong). |
| Progress indicator | Stepper horizontal di desktop, vertikal di mobile |
| File uploader | Drag and drop, kamera di mobile, progress per file, status pipeline (Memindai, Memeriksa, Diterima, Perlu review) |
| Chat interface | Bubble per sisi, label role ("Notaris", "Tim Admin"), tanpa nomor telepon, lampiran sebagai kartu dokumen, pemisah internal note berwarna berbeda dengan label "Catatan internal" |
| Empty state | Ilustrasi sederhana, satu kalimat, satu aksi |
| StatusBadge | Lihat bagian 4 |
| RiskMeter | Angka skor + level label |

## 6. Implementasi

Token didefinisikan sebagai CSS variables di `packages/ui/tokens.css` dan dipetakan ke Tailwind config. Komponen berbasis primitif headless yang accessible (contoh: Radix) untuk dialog, dropdown, dan tabs.

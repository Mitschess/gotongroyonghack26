# UX Specification

## 1. Prinsip per Role

| Role | Fokus | Layar utama | Device utama |
|---|---|---|---|
| Super Admin | Management-first | Risk dashboard | Desktop |
| Admin | Action-first | Today's Actions | Desktop |
| Client | Progress-first | Timeline project | Mobile |
| Notary | Task/document-first | Daftar task dan upload | Mobile dan desktop |

Setiap role punya route group dan navigasi sendiri. Tidak ada dashboard bersama.

## 2. Information Architecture

| Role | Navigasi |
|---|---|
| Super Admin | Dashboard, Projects, Escalations, Users, Analytics, Audit, Settings (SLA, Workflow, Kalender, Template notifikasi, Layanan) |
| Admin | Today, Projects, Review Queue, Inbox, Escalations |
| Client | Project saya, Order dan pembayaran, Pesan, Akun |
| Notary | Tugas, Project, Pesan, Akun |

Project Workspace tabs: Overview, Timeline, Tasks, Documents, Communication, Payment, Members, Activity, Audit.

| Tab | SA | Admin | Client | Notary |
|---|---|---|---|---|
| Overview | ✓ | ✓ | ✓ (versi sederhana) | ✓ |
| Timeline | ✓ | ✓ | ✓ | ✓ |
| Tasks | ✓ | ✓ | ✕ (diganti "Yang perlu Anda lakukan") | ✓ (miliknya) |
| Documents | ✓ | ✓ | ✓ (terbatas) | ✓ |
| Communication | ✓ | ✓ | ✓ (eksternal) | ✓ (eksternal + INTERNAL_WITH_NOTARY) |
| Payment | ✓ | ✓ | ✓ | ✕ (flag lunas di Overview) |
| Members | ✓ | ✓ | ✕ | ✕ |
| Activity | ✓ | ✓ | ✓ (aktivitas publik) | ✓ (miliknya) |
| Audit | ✓ | ✓ | ✕ | ✕ |

Catatan (CONSISTENCY_AUDIT.md, CA-09): izin audit "aktivitas sendiri" untuk Client dan Notary di `AUTHORIZATION.md` disajikan di halaman akun "Aktivitas Saya" (`GET /audit-logs?actor=me`), bukan di tab Audit project. Nama anggota project untuk Notary tampil di Overview dari `GET /projects/{id}/members` (nama saja).

## 3. Layar Kunci

### Admin: Today's Actions

```text
Hari ini, Sabtu 19 Sep                              [Filter: semua project saya]
┌───────────────────────────────────────────────────────────────┐
│ 5 Client perlu follow-up   2 Notary terlambat                  │
│ 3 Dokumen menunggu review  1 Project critical                  │
└───────────────────────────────────────────────────────────────┘
Urut prioritas
[!] CRITICAL  PRJ-2026-000041  Upload akta final  Notary  terlambat 6 jam   [Hubungi Notary]
[▲] HIGH      PRJ-2026-000057  Upload KTP         Client  3 hari kerja      [Kirim reminder]
[●] WARNING   PRJ-2026-000060  Review dokumen     Anda    2 jam lagi        [Buka review]
```

Setiap baris punya satu tombol aksi utama yang membuka layar tindakan langsung.

### Super Admin: Management Dashboard

```text
ACTIVE PROJECTS 42 | ON TRACK 31 | WARNING 7 | HIGH RISK 0 | CRITICAL 4 | SLA COMPLIANCE 90%
```
Widget: project per status, per Admin, per Notary, rata-rata waktu selesai, eskalasi terbuka, delay Client dan Notary. Setiap angka dapat di-klik (drill-down ke daftar terfilter).

### Client: Timeline

```text
PT Maju Jaya Abadi          PRJ-2026-000041

✓ Pembayaran diterima
✓ Data perusahaan lengkap
● Notaris memproses dokumen        (sedang berjalan)
○ Draft akta untuk Anda periksa
○ Penandatanganan
○ Dokumen final
○ Dokumen diserahkan

Yang perlu Anda lakukan: Tidak ada. Kami akan menghubungi Anda.
```

Pemetaan label Client:

| Kondisi internal | Label Client |
|---|---|
| Order PAID | Pembayaran diterima |
| DATA_SUBMISSION selesai + DATA_VALIDATION selesai | Data perusahaan lengkap |
| NOTARY_ACCEPTANCE sampai DRAFT_DEED | Notaris memproses dokumen |
| CLIENT_DRAFT_REVIEW | Draft akta untuk Anda periksa |
| SIGNING | Penandatanganan |
| DEED_FINALIZATION sampai FINAL_QA | Dokumen final disiapkan |
| DELIVERED | Dokumen diserahkan |
| ON_HOLD | Proses dijeda. Tim kami akan menghubungi Anda. |

Client tidak pernah melihat health, eskalasi, atau istilah internal.

### Notary: Tugas

Kartu task: kode project, nama perusahaan, task, tenggat dalam bahasa manusia ("Hari ini 15:00"), tombol Upload. Upload menampilkan tipe dokumen yang diharapkan sehingga Notary tidak perlu memilih.

## 4. Responsive

| Breakpoint | Lebar | Perilaku |
|---|---|---|
| sm | < 640 px | Client dan Notary: satu kolom, bottom navigation, tombol aksi sticky |
| md | 640 sampai 1023 px | Tabel menjadi kartu |
| lg | >= 1024 px | Sidebar navigasi, tabel penuh untuk Admin dan SA |

Client upload di mobile: pilih kamera atau file, kompresi gambar di client ke maksimal 2.500 px sisi panjang, preview sebelum kirim.

## 5. States Wajib per Layar

Loading (skeleton), empty (dengan aksi berikutnya), error (pesan jelas dan tombol coba lagi), partial (data sebagian gagal dimuat), offline (Client mobile).

## 6. Copy Guidelines

- Bahasa Indonesia baku yang sederhana.
- Kalimat aktif dan pendek.
- Sebut aksi yang diharapkan: "Unggah foto KTP Budi Santoso".
- Hindari istilah internal: "SLA", "NEEDS_REVIEW", "escalation" tidak tampil ke Client.
- Waktu relatif untuk tenggat dekat, tanggal absolut untuk lebih dari 2 hari.

## 7. Accessibility

Target WCAG 2.2 AA. Status tidak hanya memakai warna (lihat DESIGN_SYSTEM.md). Semua kontrol dapat dioperasikan keyboard. Label form eksplisit. Kontras teks minimal 4.5:1.

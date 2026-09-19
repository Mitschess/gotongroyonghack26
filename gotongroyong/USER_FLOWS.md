# User Flows

## 1. Overall Business Process

```mermaid
flowchart TD
  A[Client pilih layanan] --> B[Order PENDING_PAYMENT]
  B --> C{Pembayaran}
  C -- PAID --> D[Project DATA_COLLECTION]
  C -- EXPIRED/FAILED --> B2[Order EXPIRED atau bayar ulang]
  D --> E[Client isi data dan upload]
  E --> F[DATA_REVIEW: Admin validasi]
  F -- ditolak --> D
  F -- valid --> G[IN_PROGRESS: Notary diusulkan dan menerima]
  G --> H[Notary upload draft]
  H --> I{Client review draft}
  I -- revisi --> H
  I -- setuju --> J[Signing]
  J --> K[Akta final]
  K --> L[Bukti pendaftaran]
  L --> M[FINAL_REVIEW: Admin QA]
  M -- ditolak --> K
  M -- setuju --> N[COMPLETED]
  N --> O[Delivery]
  O --> P[DELIVERED]
```

## 2. Client Flow

```mermaid
flowchart TD
  R[Register + consent] --> V[Verifikasi email dan WhatsApp]
  V --> S[Pilih PT atau CV]
  S --> O[Buat order]
  O --> P[Bayar]
  P --> W[Halaman menunggu konfirmasi]
  W --> DC[Isi form data perusahaan]
  DC --> UP[Upload KTP, NPWP, domisili]
  UP --> TL[Pantau timeline]
  TL --> DR{Draft siap}
  DR --> RV[Review draft: setujui atau minta revisi]
  RV --> SG[Hadir penandatanganan]
  SG --> FN[Terima notifikasi dokumen siap]
  FN --> DL[Login dan unduh dokumen]
```

## 3. Admin Flow

```mermaid
flowchart TD
  L[Login + MFA] --> T[Today's Actions]
  T --> A1{Jenis aksi}
  A1 -- Validasi data --> V[Periksa data dan identitas] --> V2{Valid?}
  V2 -- ya --> NA[Konfirmasi usulan Notary]
  V2 -- tidak --> RJ[Tolak dengan daftar item]
  A1 -- Dokumen NEEDS_REVIEW --> DR[Review: verifikasi, ubah tipe, pindah project, tolak]
  A1 -- Follow-up Client/Notary --> FU[Kirim pesan dari Communication Center]
  A1 -- Final QA --> QA[Periksa paket final] --> QA2{Lengkap?}
  QA2 -- ya --> CP[Approve: COMPLETED]
  QA2 -- tidak --> RO[Reopen task Notary]
  A1 -- Eskalasi --> ES[Acknowledge dan tangani]
  A1 -- Pesan tanpa project --> UM[Tentukan project]
```

## 4. Notary Flow

```mermaid
flowchart TD
  N[Notifikasi penugasan via WhatsApp] --> A{Terima?}
  A -- tolak --> D[Isi alasan] --> R[Sistem reassign]
  A -- terima --> W[Workspace task]
  W --> DD[Upload draft via web atau WhatsApp]
  DD --> WR{Client setuju?}
  WR -- revisi --> DD
  WR -- setuju --> SC[Jadwalkan signing]
  SC --> SD[Konfirmasi signing selesai]
  SD --> AK[Upload akta final]
  AK --> RG[Upload bukti pendaftaran]
  RG --> DN[Menunggu QA Admin]
```

## 5. Super Admin Flow

```mermaid
flowchart TD
  L[Login + MFA] --> D[Management dashboard]
  D --> R{Risiko?}
  R -- Critical project --> DD[Drill-down project] --> AC[Reassign, override, atau instruksi Admin]
  R -- Eskalasi L3 --> EA[Acknowledge] --> ER[Resolve dengan catatan]
  D --> CFG[Konfigurasi: SLA, workflow, kalender, user]
  D --> AU[Cari audit log]
  D --> AN[Analytics]
```

## 6. Payment Flow

```mermaid
sequenceDiagram
  participant C as Client
  participant API
  participant GW as Gateway
  participant W as Worker
  C->>API: POST /orders/{id}/payments
  API->>GW: createPayment
  GW-->>C: halaman atau instruksi bayar
  C->>GW: bayar
  GW->>API: webhook (bisa ganda, bisa terlambat)
  API->>API: verify signature, insert payment_events unik
  API->>W: payment.process
  W->>GW: getStatus
  alt PAID dan nominal cocok
    W->>W: payment PAID, order PAID, project created (unik)
  else nominal beda
    W->>W: alert, status tetap
  end
  Note over W: Reconcile 15 menit menangkap webhook yang hilang
```

## 7. Document Flow

```mermaid
flowchart TD
  U[Upload] --> I{Integritas OK?}
  I -- tidak --> X[Tolak upload]
  I -- ya --> S{Malware?}
  S -- ya --> Q[QUARANTINED + alert]
  S -- tidak --> P{Project jelas?}
  P -- tidak --> PR[PENDING_RESOLUTION]
  PR -- terjawab --> C
  PR -- timeout --> NR
  P -- ya --> C[Klasifikasi]
  C --> AV{Syarat auto-verify terpenuhi?}
  AV -- ya --> VF[VERIFIED]
  AV -- tidak --> NR[NEEDS_REVIEW]
  NR --> AD{Admin}
  AD -- verifikasi --> VF
  AD -- tolak --> RJ[REJECTED + notif pengunggah]
  VF --> TM{Cocok dengan task OPEN?}
  TM -- ya --> TC[Task COMPLETED + task berikutnya aktif]
  TM -- tidak --> ST[Simpan sebagai pendukung]
```

## 8. WhatsApp Flow

```mermaid
flowchart TD
  M[Pesan masuk ke nomor platform] --> SIG{Signature valid?}
  SIG -- tidak --> DROP[401 + log]
  SIG -- ya --> DUP{Event sudah ada?}
  DUP -- ya --> OK[200, abaikan]
  DUP -- tidak --> SND{Pengirim terdaftar?}
  SND -- tidak --> UNK[Antrean Admin]
  SND -- ya --> RES{Resolusi project}
  RES -- reply context / kode --> CTX[Project pasti]
  RES -- satu project aktif --> INF[Project diinferensi]
  RES -- banyak project --> ASK[Tanya pilihan project]
  CTX & INF --> TYP{Tipe pesan}
  TYP -- teks --> RL[Simpan + relay ke pihak lain tanpa nomor]
  TYP -- dokumen/gambar --> DP[Document pipeline]
  TYP -- suara --> VN[Simpan + notif dengar di portal]
```

## 9. SLA Flow

```mermaid
flowchart TD
  J[Job sla.evaluate tiap 5 menit] --> E[Hitung business time dikurangi pause]
  E --> R[Hitung rasio r]
  R --> H{Threshold baru terlewati?}
  H -- tidak --> END[Selesai]
  H -- ya --> U[Update health + last_threshold_crossed]
  U --> A{Level}
  A -- WARNING --> N1[Reminder owner / SLA_WARNING]
  A -- HIGH_RISK --> N2[Notif owner + admin]
  A -- CRITICAL/breach --> ES[Eskalasi sesuai aturan]
```

## 10. Escalation Flow

```mermaid
flowchart TD
  B[Task breach] --> L1[L1: notif owner]
  L1 --> C1{Selesai dalam 2 bh?}
  C1 -- ya --> AR[AUTO_RESOLVED]
  C1 -- tidak --> L2[L2: notif primary admin]
  L2 --> C2{Selesai dalam 1 bd?}
  C2 -- ya --> AR
  C2 -- tidak --> L3[L3: notif Super Admin]
  L3 --> AK{Acknowledge dalam 4 bh?}
  AK -- tidak --> RN[Re-notify]
  AK -- ya --> RS[Resolve dengan catatan]
```

## 11. Final Document Delivery

```mermaid
flowchart TD
  QA[Final QA approved] --> CP[Project COMPLETED]
  CP --> J[delivery.dispatch]
  J --> WA[WhatsApp: template dokumen siap + link]
  WA -- SENT --> DV[Project DELIVERED]
  WA -- FAILED --> EM[Email + link]
  EM -- SENT --> DV
  EM -- FAILED --> IA[In-app saja + eskalasi L2]
  DV --> OPN{Client unduh?}
  OPN -- ya --> RD[Delivery READ + audit]
  OPN -- tidak dalam 3 bd --> FU[Follow-up task Admin]
```

## 12. Error dan Fallback Flow

```mermaid
flowchart TD
  OP[Operasi otomatis] --> OK{Berhasil?}
  OK -- ya --> DONE[Lanjut]
  OK -- tidak --> T{Error sementara?}
  T -- ya --> RT[Retry backoff]
  RT --> MX{Retry habis?}
  MX -- tidak --> OP
  MX -- ya --> DLQ[Dead letter + alert]
  T -- tidak --> FS[Fail safe: status NEEDS_REVIEW / tidak berubah]
  DLQ --> HT[Follow-up task untuk manusia]
  FS --> HT
  HT --> AUD[Audit + observability]
```

# Software Requirements Specification (SRS)
## Legal Work Management System

**Version:** 1.0  
**Platform:** Web Application  
**Domain:** Legal & Business Legalization Services

---

## 1. Introduction

### 1.1 Purpose

Dokumen ini mendefinisikan kebutuhan perangkat lunak untuk **Legal Work Management System**, yaitu aplikasi berbasis web yang digunakan untuk membantu perusahaan di bidang legalitas dalam mengelola pekerjaan, klien, dokumen, proses legalitas, serta aktivitas karyawan secara terpusat.

Sistem dirancang untuk menggantikan proses kerja yang masih bergantung pada komunikasi manual, spreadsheet, dokumen fisik, atau aplikasi komunikasi yang terpisah-pisah.

### 1.2 Scope

Sistem mencakup pengelolaan:

- Data klien
- Data perusahaan/customer
- Permintaan layanan legalitas
- Pekerjaan dan task
- Workflow proses legalitas
- Dokumen legal
- Deadline dan jadwal
- Karyawan/pegawai
- Status pekerjaan
- Komunikasi dan catatan pekerjaan
- Approval
- Laporan pekerjaan
- Dashboard monitoring

Sistem **tidak bertujuan memberikan nasihat hukum otomatis**. Sistem berfungsi sebagai alat manajemen pekerjaan dan administrasi perusahaan legalitas.

---

# 2. Product Overview

## 2.1 Product Perspective

Aplikasi merupakan sistem terpusat yang digunakan oleh berbagai pihak dalam perusahaan.

Alur kerja umum:

```text
Client
   │
   ▼
Permintaan Layanan
   │
   ▼
Staff / Admin
   │
   ▼
Pembuatan Work Order
   │
   ▼
Assignment ke Staff
   │
   ▼
Workflow Legalitas
   │
   ├── Dokumen
   ├── Task
   ├── Approval
   └── Deadline
   │
   ▼
Review / Supervisor
   │
   ▼
Pekerjaan Selesai
   │
   ▼
Client
```

---

# 3. User Roles

| Role | Deskripsi |
|---|---|
| **Super Admin** | Mengelola keseluruhan sistem |
| **Manager/Supervisor** | Mengawasi pekerjaan dan melakukan approval |
| **Legal Staff** | Menangani pekerjaan legalitas |
| **Admin** | Mengelola data administratif dan client |
| **Finance** | Mengelola informasi pembayaran/tagihan |
| **Client** | Melihat status pekerjaan dan dokumen miliknya |

Role dapat dikembangkan sesuai struktur perusahaan.

---

# 4. Functional Requirements

## 4.1 Authentication & Authorization

### FR-01 Login

Sistem harus menyediakan fitur login menggunakan:

- Email/username
- Password

### FR-02 Role-Based Access Control

Sistem harus membatasi akses berdasarkan role pengguna.

### FR-03 Logout

User harus dapat keluar dari sistem dengan aman.

### FR-04 Password Management

User dapat:

- Mengubah password
- Melakukan reset password
- Mendapatkan password recovery melalui email

---

# 5. Client Management

## FR-05 Client Registration

Admin dapat menambahkan data client.

Data dapat meliputi:

- Client ID
- Nama
- Nomor telepon
- Email
- Alamat
- Jenis client
- PIC
- Catatan

## FR-06 Client Profile

Sistem menyediakan halaman profil client yang menampilkan:

- Informasi client
- Daftar project
- Daftar layanan
- Dokumen
- Riwayat pekerjaan
- Riwayat komunikasi

## FR-07 Client Search

User yang memiliki hak akses dapat mencari client berdasarkan:

- Nama
- ID
- Email
- Nomor telepon

---

# 6. Legal Service Management

Sistem harus dapat mengelola berbagai jenis layanan legalitas.

Contoh:

- Pendirian perusahaan
- Perubahan data perusahaan
- Perizinan
- NIB
- NPWP
- Perubahan struktur perusahaan
- Pengurusan dokumen
- Legal document processing
- Layanan legal lainnya

## FR-08 Service Creation

Admin dapat membuat jenis layanan baru.

Data layanan:

```text
Service ID
Service Name
Description
Estimated Duration
Required Documents
Price
Workflow
Status
```

## FR-09 Service Request

Client atau staff dapat membuat permintaan layanan.

Informasi:

- Client
- Jenis layanan
- Deskripsi kebutuhan
- Dokumen pendukung
- Priority
- Request date

---

# 7. Work / Project Management

## FR-10 Create Work Order

Setiap permintaan layanan dapat dibuat menjadi **Work Order / Project**.

Contoh:

```text
WO-2026-00125

Client      : PT ABC
Service     : Pendirian PT
PIC         : Budi
Priority    : High
Start Date  : 20 September 2026
Deadline    : 30 September 2026
Status      : In Progress
```

## FR-11 Task Management

Staff dapat membuat task dalam sebuah work order.

Task memiliki:

- Task ID
- Task name
- Description
- Assignee
- Priority
- Deadline
- Status
- Attachment
- Notes

## FR-12 Task Status

Task memiliki status:

```text
To Do
   ↓
In Progress
   ↓
Review
   ↓
Completed
```

Status tambahan:

```text
Blocked
Cancelled
Rejected
```

## FR-13 Task Assignment

Manager/Supervisor dapat memberikan task kepada staff tertentu.

## FR-14 Task Reassignment

Manager dapat memindahkan task dari satu staff ke staff lain.

---

# 8. Workflow Management

Karena setiap layanan legalitas dapat memiliki proses berbeda, sistem harus menyediakan workflow.

Contoh:

```text
Request
   ↓
Document Collection
   ↓
Document Verification
   ↓
Processing
   ↓
Government Submission
   ↓
Review
   ↓
Completed
```

## FR-15 Workflow Definition

Admin/Manager dapat menentukan tahapan suatu layanan.

## FR-16 Workflow Tracking

Sistem menampilkan tahapan pekerjaan yang sedang berjalan.

Contoh:

```text
✓ Client Request
✓ Document Collection
✓ Document Verification
● Processing
○ Submission
○ Completed
```

---

# 9. Document Management

## FR-17 Upload Document

User yang memiliki akses dapat mengunggah dokumen.

Format yang dapat didukung:

- PDF
- DOC/DOCX
- XLS/XLSX
- JPG/JPEG
- PNG

## FR-18 Document Categorization

Dokumen dapat dikategorikan:

```text
Identity
Company Document
License
Contract
Government Document
Supporting Document
Other
```

## FR-19 Document Versioning

Sistem harus dapat menyimpan beberapa versi dokumen.

Contoh:

```text
Akta.pdf
 ├── Version 1
 ├── Version 2
 └── Version 3
```

## FR-20 Document Access Control

Dokumen hanya dapat diakses oleh user yang memiliki permission.

## FR-21 Document Download

User dengan permission dapat mengunduh dokumen.

---

# 10. Approval Management

## FR-22 Approval Request

Staff dapat meminta approval dari Manager/Supervisor.

Contoh:

```text
Document Ready
      ↓
Request Approval
      ↓
Manager Review
      ↓
Approved / Rejected
```

## FR-23 Approval Status

Approval memiliki status:

- Pending
- Approved
- Rejected
- Revision Required

## FR-24 Approval History

Sistem harus menyimpan:

- Approver
- Timestamp
- Decision
- Comment

---

# 11. Deadline & Scheduling

## FR-25 Deadline Management

Setiap project/task dapat memiliki deadline.

## FR-26 Deadline Notification

Sistem dapat memberikan notifikasi ketika:

- Deadline mendekat
- Deadline hari ini
- Deadline terlewat

## FR-27 Calendar

Sistem menyediakan calendar untuk melihat:

- Deadline
- Meeting
- Task
- Appointment
- Important dates

---

# 12. Notification System

## FR-28 In-App Notification

Sistem menyediakan notifikasi di dalam aplikasi.

Contoh:

```text
🔔 New task assigned to you.
🔔 Document requires approval.
🔔 Deadline is tomorrow.
```

## FR-29 Email Notification

Sistem dapat mengirim notifikasi melalui email untuk event tertentu.

---

# 13. Communication & Notes

## FR-30 Work Notes

Staff dapat menambahkan catatan pada project.

Contoh:

```text
19 Sep 2026
Budi:

Dokumen KTP direktur masih belum tersedia.
Menunggu client.
```

## FR-31 Activity Timeline

Sistem menampilkan riwayat aktivitas.

Contoh:

```text
10:30 — Budi uploaded document
11:15 — Manager approved document
13:20 — Task status changed to Processing
14:00 — Client uploaded new document
```

---

# 14. Finance Management

Modul finance bersifat opsional dan dapat digunakan untuk mengelola aspek pembayaran layanan.

## FR-32 Invoice

Sistem dapat membuat invoice.

Informasi:

- Invoice number
- Client
- Service
- Amount
- Due date
- Status

## FR-33 Payment Status

Status pembayaran:

```text
Unpaid
Partial
Paid
Overdue
Cancelled
```

---

# 15. Dashboard

## FR-34 Dashboard

Dashboard menampilkan informasi penting.

Contoh:

```text
+----------------+----------------+
| Active Projects| Completed      |
|      42        |      128       |
+----------------+----------------+

+----------------+----------------+
| Due Today      | Overdue        |
|       7        |       3        |
+----------------+----------------+
```

Dashboard Manager dapat menampilkan:

- Total active projects
- Completed projects
- Overdue projects
- Tasks per employee
- Pending approvals
- Client requests
- Project status

---

# 16. Reporting

## FR-35 Work Report

Manager dapat melihat laporan pekerjaan berdasarkan:

- Periode
- Staff
- Client
- Service
- Status
- Priority

## FR-36 Export Report

Laporan dapat diekspor ke:

- PDF
- Excel/CSV

---

# 17. Audit Trail

## FR-37 Activity Logging

Sistem harus mencatat aktivitas penting user.

Contoh:

```text
User       : Budi
Action     : Upload Document
Object     : Akta PT ABC
Timestamp  : 19/09/2026 10:32
```

Audit trail digunakan untuk mengetahui siapa yang melakukan perubahan terhadap data.

---

# 18. Non-Functional Requirements

## NFR-01 Performance

Halaman utama sistem harus dapat dimuat dalam waktu yang wajar pada koneksi internet normal.

## NFR-02 Security

Sistem harus menerapkan:

- Password hashing
- Authentication
- Authorization
- Role-Based Access Control
- HTTPS
- Secure file upload
- Session management

## NFR-03 Availability

Sistem harus dapat digunakan selama jam operasional perusahaan dengan downtime seminimal mungkin.

## NFR-04 Scalability

Sistem harus dapat dikembangkan untuk menangani:

- Bertambahnya client
- Bertambahnya employee
- Bertambahnya project
- Bertambahnya dokumen

## NFR-05 Usability

Interface harus mudah digunakan oleh pengguna non-teknis.

## NFR-06 Data Privacy

Data client dan dokumen legal harus dibatasi berdasarkan hak akses.

## NFR-07 Backup

Database dan dokumen penting harus memiliki mekanisme backup berkala.

---

# 19. Main Use Cases

```text
                    LEGAL WORK MANAGEMENT SYSTEM
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
      Client               Staff                Manager
        │                     │                     │
        ├─ Request Service    ├─ View Task         ├─ View Dashboard
        ├─ Upload Document    ├─ Update Task       ├─ Assign Task
        ├─ View Status        ├─ Upload Document   ├─ Approve
        └─ Download Document  ├─ Add Notes         ├─ Monitor Project
                              └─ Update Status      └─ Generate Report
```

---

# 20. Main Business Flow

```text
Client
  │
  │ Request Legal Service
  ▼
System
  │
  ▼
Admin
  │
  │ Verify Request
  ▼
Work Order Created
  │
  ▼
Manager
  │
  │ Assign Staff
  ▼
Legal Staff
  │
  ├── Collect Documents
  ├── Verify Documents
  ├── Process Legal Service
  └── Submit for Review
          │
          ▼
       Manager
          │
     ┌────┴────┐
     │         │
 Approved   Revision
     │         │
     │         └──────► Staff
     │
     ▼
 Completed
     │
     ▼
 Client
```

---

# 21. System Modules

```text
Legal Work Management System
│
├── Authentication
├── Dashboard
├── Client Management
├── Service Management
├── Project / Work Order
│   ├── Tasks
│   ├── Workflow
│   ├── Timeline
│   └── Notes
├── Document Management
├── Approval
├── Calendar
├── Notification
├── Finance
├── Reports
└── System Administration
    ├── Users
    ├── Roles
    └── Permissions
```

---

# 22. MVP Scope

Untuk versi pertama (**MVP**), fitur yang diprioritaskan:

1. Authentication
2. User & Role Management
3. Client Management
4. Service Management
5. Work Order / Project
6. Task Management
7. Workflow
8. Document Management
9. Approval
10. Dashboard
11. Notification

### Phase 2

- Calendar
- Activity Timeline
- Advanced Reporting
- Email Notification
- Document Versioning

### Phase 3

- Finance / Invoice
- Client Portal
- Advanced Analytics
- External Service Integration
- Automated Workflow
- Mobile Application

---

# 23. Core Data Entities

Database awal dapat menggunakan entity berikut:

```text
User
 ├── Role
 └── Permission

Client
 │
 └── Project / WorkOrder
       │
       ├── Service
       ├── Task
       ├── Workflow
       ├── Document
       ├── Approval
       ├── Note
       └── Activity

Invoice
 │
 └── Payment
```

Relasi utama:

```text
CLIENT
   │
   ├──────── PROJECT
   │             │
   │             ├──── TASK
   │             ├──── DOCUMENT
   │             ├──── APPROVAL
   │             ├──── NOTE
   │             └──── ACTIVITY
   │
   └──────── INVOICE
```

---

# 24. Success Criteria

Sistem dianggap memenuhi kebutuhan utama apabila perusahaan dapat melakukan proses berikut sepenuhnya melalui aplikasi:

```text
Client
   ↓
Request
   ↓
Work Order
   ↓
Assignment
   ↓
Task
   ↓
Document
   ↓
Processing
   ↓
Approval
   ↓
Completion
   ↓
Reporting
```

Dengan demikian, aplikasi berfungsi sebagai **sistem manajemen operasional pekerjaan perusahaan legalitas**, bukan hanya sebagai tempat penyimpanan data dan dokumen.

---

# 25. Future Development

Pengembangan lebih lanjut dapat mencakup:

- Client self-service portal
- E-signature integration
- WhatsApp notification
- Email integration
- Government service integration
- OCR untuk dokumen
- AI-assisted document classification
- Automated workflow
- Advanced business analytics
- Mobile application
- Multi-company / multi-branch support

---

# 26. Conclusion

**Legal Work Management System** merupakan aplikasi web yang dirancang untuk mengintegrasikan proses operasional perusahaan legalitas dalam satu sistem.

Fokus utama sistem adalah:

> **Manage Client → Manage Service → Manage Work → Manage Document → Manage Approval → Monitor Progress → Generate Report**

Sistem diharapkan dapat meningkatkan keteraturan proses kerja, transparansi status pekerjaan, pengelolaan dokumen, koordinasi antarpegawai, serta monitoring pekerjaan oleh management.

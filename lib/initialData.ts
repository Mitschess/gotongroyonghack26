import {
  User,
  Client,
  Service,
  WorkOrder,
  Task,
  LegalDocument,
  ApprovalRequest,
  CalendarEvent,
  NotificationItem,
  WorkNote,
  ActivityLog,
  Invoice
} from '../types/legal';

export const INITIAL_USERS: User[] = [
  { id: 'usr-1', name: 'Bambang Soetjipto', email: 'bambang@legalwork.co.id', role: 'super_admin', department: 'Executive Management', phone: '0812-1000-0001' },
  { id: 'usr-2', name: 'Maya Putri, S.H.', email: 'maya.putri@legalwork.co.id', role: 'admin', department: 'Legal Operations', phone: '0812-1000-0002' },
  { id: 'usr-3', name: 'Budi Santoso, S.H.', email: 'budi.santoso@legalwork.co.id', role: 'technical', department: 'Corporate Legal', phone: '0812-1000-0003' },
  { id: 'usr-4', name: 'Siti Rahma, S.H.', email: 'siti.rahma@legalwork.co.id', role: 'technical', department: 'Licensing & Permits', phone: '0812-1000-0004' },
  { id: 'usr-5', name: 'Eko Prasetyo', email: 'eko.prasetyo@legalwork.co.id', role: 'admin', department: 'Administration', phone: '0812-1000-0005' },
  { id: 'usr-6', name: 'Agus Hermawan, A.Md.', email: 'agus.hermawan@legalwork.co.id', role: 'finance', department: 'Finance & Billing', phone: '0812-1000-0006' },
  { id: 'usr-8', name: 'Notaris Soebagjo, S.H., M.Kn.', email: 'soebagjo.notaris@gmail.com', role: 'notary', department: 'Rekan Notaris Jakarta Pusat', phone: '0815-9988-1122' },
  { id: 'usr-9', name: 'Notaris Dewi Anggraini, S.H.', email: 'dewi.notaris@gmail.com', role: 'notary', department: 'Rekan Notaris Jakarta Selatan', phone: '0817-2233-4455' },
  { id: 'usr-7', name: 'Hendra Wijaya (PT Nusantara Tech)', email: 'hendra@nusantaratech.id', role: 'client', department: 'Client Portal', phone: '0812-9876-5432' }
];


export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    clientCode: 'CL-2026-001',
    name: 'PT Nusantara Tech Solution',
    companyName: 'PT Nusantara Tech Solution',
    email: 'contact@nusantaratech.id',
    phone: '021-5558910',
    address: 'Gedung Cyber 2 Lt. 18, Jl. H.R. Rasuna Said, Jakarta Selatan',
    type: 'PT',
    picName: 'Hendra Wijaya',
    picPhone: '0812-9876-5432',
    notes: 'Klien prioritas sektor teknologi informasi. Berencana upgrade status ke PT PMA.',
    createdAt: '2026-01-15',
    status: 'Active'
  },
  {
    id: 'cli-002',
    clientCode: 'CL-2026-002',
    name: 'CV Karya Mandiri Sejahtera',
    companyName: 'CV Karya Mandiri Sejahtera',
    email: 'admin@karyamandiri.co.id',
    phone: '022-4209811',
    address: 'Jl. Asia Afrika No. 45, Bandung',
    type: 'CV',
    picName: 'Rina Sugiarto',
    picPhone: '0813-1122-3344',
    notes: 'Perusahaan jasa konstruksi skala menengah.',
    createdAt: '2026-02-01',
    status: 'Active'
  },
  {
    id: 'cli-003',
    clientCode: 'CL-2026-003',
    name: 'PT Synergy Energi Utama',
    companyName: 'PT Synergy Energi Utama',
    email: 'legal@synergyenergi.com',
    phone: '021-2991002',
    address: 'Menara Astra Lt. 30, Jl. Jend. Sudirman Kaveling 5-6, Jakarta Pusat',
    type: 'PMA',
    picName: 'David Miller',
    picPhone: '0811-9988-7766',
    notes: 'Perusahaan penanaman modal asing energi terbarukan.',
    createdAt: '2026-02-18',
    status: 'Active'
  },
  {
    id: 'cli-004',
    clientCode: 'CL-2026-004',
    name: 'PT Prima Digital Indonesia',
    companyName: 'PT Prima Digital Indonesia',
    email: 'info@primadigital.id',
    phone: '021-7788990',
    address: 'Graha Mandiri Lt. 12, Jl. Imam Bonjol No. 61, Jakarta Pusat',
    type: 'PT',
    picName: 'Ahmad Dahlan',
    picPhone: '0856-7788-9900',
    notes: 'Klien pembuat aplikasi kesehatan digital.',
    createdAt: '2026-03-02',
    status: 'Active'
  },
  {
    id: 'cli-005',
    clientCode: 'CL-2026-005',
    name: 'Dr. Ir. Anisa Rahmawati (Perorangan)',
    companyName: 'Studio Arsitektur Rahmawati',
    email: 'anisa.rahmawati@gmail.com',
    phone: '0818-4455-6677',
    address: 'Jl. Cikini Raya No. 12, Jakarta Pusat',
    type: 'Perorangan',
    picName: 'Dr. Ir. Anisa Rahmawati',
    picPhone: '0818-4455-6677',
    notes: 'Konsultan perorangan pembuatan pendaftaran merek & Hak Cipta.',
    createdAt: '2026-03-10',
    status: 'Active'
  }
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-001',
    serviceCode: 'SRV-PT-LOCAL',
    name: 'Pendirian PT Perseroan Terbatas (Lokal)',
    description: 'Pengurusan akta pendirian, SK Kemenkumham, NIB OSS-RBA, NPWP Perusahaan, & rekening bank.',
    estimatedDays: 14,
    price: 9500000,
    requiredDocuments: ['KTP Direktur & Komisaris', 'NPWP Pengurus', 'PBB & Surat Sewa Kantor', 'Draft Nama PT'],
    status: 'Active',
    workflowStages: [
      { id: 'stg-1', name: 'Permintaan & Pengumpulan Dokumen', description: 'Pengumpulan KTP, NPWP, dan konfirmasi nama PT', order: 1 },
      { id: 'stg-2', name: 'Pengecekan Nama & Minuta Akta Notaris', description: 'Pengecekan Kemenkumham & draf akta', order: 2 },
      { id: 'stg-3', name: 'Penandatanganan Akta & SK Kemenkumham', description: 'Tanda tangan Notaris dan penerbitan SK', order: 3 },
      { id: 'stg-4', name: 'Pengurusan NIB & Perizinan OSS-RBA', description: 'Input KBLI dan penerbitan NIB', order: 4 },
      { id: 'stg-5', name: 'Pemeriksaan Akhir & Penyerahan Berkas', description: 'Verifikasi manager dan serah terima ke klien', order: 5 }
    ]
  },
  {
    id: 'srv-002',
    serviceCode: 'SRV-AKTA-MOD',
    name: 'Perubahan Akta & Anggaran Dasar Perusahaan',
    description: 'Perubahan susunan Direksi/Komisaris, pemegang saham, modal disetor, atau domisili PT.',
    estimatedDays: 10,
    price: 6500000,
    requiredDocuments: ['Akta Pendirian & Terakhir', 'SK Kemenkumham Terakhir', 'RUPS / Risalah Rapat', 'KTP/NPWP Pengurus Baru'],
    status: 'Active',
    workflowStages: [
      { id: 'stg-201', name: 'Pemeriksaan Dokumen RUPS', description: 'Verifikasi risalah RUPS & persetujuan pemegang saham', order: 1 },
      { id: 'stg-202', name: 'Pembuatan Draf Akta Perubahan', description: 'Penyusunan minutasi Notaris', order: 2 },
      { id: 'stg-203', name: 'Persetujuan / Pemberitahuan Kemenkumham', description: 'Submit AHU online Kemenkumham', order: 3 },
      { id: 'stg-204', name: 'Update Data NIB / AHU Online', description: 'Pembaruan profil perusahaan di OSS', order: 4 },
      { id: 'stg-205', name: 'Penyerahan Salinan Akta', description: 'Pengiriman dokumen final ke klien', order: 5 }
    ]
  },
  {
    id: 'srv-003',
    serviceCode: 'SRV-NIB-OSS',
    name: 'Pendaftaran NIB & Perizinan Berusaha OSS-RBA',
    description: 'Pengurusan Nomor Induk Berusaha, Sertifikat Standar, dan izin operasional berbasis risiko.',
    estimatedDays: 7,
    price: 4500000,
    requiredDocuments: ['Akta & SK Kemenkumham', 'NPWP PT', 'Akses Hak Akses OSS', 'Daftar KBLI Usaha'],
    status: 'Active',
    workflowStages: [
      { id: 'stg-301', name: 'Analisis KBLI & Verifikasi Lokasi', description: 'Penyesuaian KBLI 2020 & tata ruang RDTR', order: 1 },
      { id: 'stg-302', name: 'Penginputan Sistem OSS-RBA', description: 'Formulir data pelaku usaha', order: 2 },
      { id: 'stg-303', name: 'Verifikasi Instansi Teknis', description: 'Monitoring pemenuhan komitmen', order: 3 },
      { id: 'stg-304', name: 'Penerbitan Sertifikat Standar / NIB', description: 'Download berkas izin resmi', order: 4 }
    ]
  },
  {
    id: 'srv-004',
    serviceCode: 'SRV-HAKI-BRAND',
    name: 'Pendaftaran Merek Dagang & Hak Cipta (HAKI)',
    description: 'Pendaftaran merek ke DJKI Kemenkumham termasuk penelusuran kompatibilitas merek.',
    estimatedDays: 30,
    price: 3500000,
    requiredDocuments: ['Etiket / Logo Merek', 'Surat Pernyataan Kepemilikan', 'KTP / Akta Perusahaan', 'Surat Kuasa'],
    status: 'Active',
    workflowStages: [
      { id: 'stg-401', name: 'Penelusuran Merek (Trademark Search)', description: 'Cek potensi sanggahan & kemiripan merek di pangkalan data DJKI', order: 1 },
      { id: 'stg-402', name: 'Penyiapan Berkas & Klasifikasi Kelas', description: 'Penentuan kelas barang/jasa Nice Classification', order: 2 },
      { id: 'stg-403', name: 'Pendaftaran Online ke DJKI', description: 'Submit permohonan & pembayaran PNBP', order: 3 },
      { id: 'stg-404', name: 'Penerbitan Bukti Agenda & Pengawasan', description: 'Monitoring masa pengumuman koran merek', order: 4 }
    ]
  }
];

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo-101',
    woNumber: 'WO-2026-00101',
    clientId: 'cli-001',
    clientName: 'PT Nusantara Tech Solution',
    serviceId: 'srv-001',
    serviceName: 'Pendirian PT Perseroan Terbatas (Lokal)',
    picStaffId: 'usr-3',
    picStaffName: 'Budi Santoso, S.H.',
    notaryId: 'usr-8',
    notaryName: 'Notaris Soebagjo, S.H., M.Kn.',
    priority: 'High',
    startDate: '2026-09-10',
    deadline: '2026-09-24',
    status: 'In Progress',
    health: 'ON_TRACK',
    blockedOn: 'NOTARY',
    currentStageIndex: 3,
    progressPercent: 75,
    estimatedPrice: 9500000,
    description: 'Pengurusan pendirian PT baru untuk ekspansi lini bisnis cloud computing.',
    createdAt: '2026-09-10',
    actionRequired: 'Follow up Notaris Soebagjo untuk upload Minuta Akta Final',
    clientActionItem: 'Menunggu proses Notaris & penyusunan Akta Final',
    workflow: [
      { stageId: 'stg-1', stageName: 'Permintaan & Pengumpulan Dokumen', status: 'Completed', completedAt: '2026-09-12', completedBy: 'Budi Santoso, S.H.', clientFriendlyLabel: 'Pembayaran diterima & berkas diupload' },
      { stageId: 'stg-2', stageName: 'Pengecekan Nama & Minuta Akta Notaris', status: 'Completed', completedAt: '2026-09-15', completedBy: 'Budi Santoso, S.H.', clientFriendlyLabel: 'Data perusahaan lengkap & nama disetujui' },
      { stageId: 'stg-3', stageName: 'Penandatanganan Akta & SK Kemenkumham', status: 'Completed', completedAt: '2026-09-18', completedBy: 'Maya Putri, S.H.', clientFriendlyLabel: 'Notaris memproses dokumen akta' },
      { stageId: 'stg-4', stageName: 'Pengurusan NIB & Perizinan OSS-RBA', status: 'In Progress', clientFriendlyLabel: 'Draft akta disiapkan untuk disetujui' },
      { stageId: 'stg-5', stageName: 'Pemeriksaan Akhir & Penyerahan Berkas', status: 'Pending', clientFriendlyLabel: 'Dokumen final diserahkan' }
    ]
  },
  {
    id: 'wo-102',
    woNumber: 'WO-2026-00102',
    clientId: 'cli-002',
    clientName: 'CV Karya Mandiri Sejahtera',
    serviceId: 'srv-002',
    serviceName: 'Perubahan Akta & Anggaran Dasar Perusahaan',
    picStaffId: 'usr-4',
    picStaffName: 'Siti Rahma, S.H.',
    notaryId: 'usr-9',
    notaryName: 'Notaris Dewi Anggraini, S.H.',
    priority: 'Medium',
    startDate: '2026-09-14',
    deadline: '2026-09-22',
    status: 'Review',
    health: 'WARNING',
    blockedOn: 'ADMIN',
    currentStageIndex: 3,
    progressPercent: 85,
    estimatedPrice: 6500000,
    description: 'Perubahan susunan Sekutu Komanditer dan penambahan modal disetor.',
    createdAt: '2026-09-14',
    actionRequired: 'Review dokumen Draf RUPS & persetujuan Manager',
    clientActionItem: 'Menunggu review tim legal internal',
    workflow: [
      { stageId: 'stg-201', stageName: 'Pemeriksaan Dokumen RUPS', status: 'Completed', completedAt: '2026-09-15', completedBy: 'Siti Rahma, S.H.', clientFriendlyLabel: 'Pemeriksaan risalah RUPS' },
      { stageId: 'stg-202', stageName: 'Pembuatan Draf Akta Perubahan', status: 'Completed', completedAt: '2026-09-17', completedBy: 'Siti Rahma, S.H.', clientFriendlyLabel: 'Pembuatan draf perubahan' },
      { stageId: 'stg-203', stageName: 'Persetujuan / Pemberitahuan Kemenkumham', status: 'Completed', completedAt: '2026-09-19', completedBy: 'Siti Rahma, S.H.', clientFriendlyLabel: 'Pemberitahuan ke Kemenkumham' },
      { stageId: 'stg-204', stageName: 'Update Data NIB / AHU Online', status: 'In Progress', clientFriendlyLabel: 'Pembaruan NIB OSS' },
      { stageId: 'stg-205', stageName: 'Penyerahan Salinan Akta', status: 'Pending', clientFriendlyLabel: 'Salinan akta diserahkan' }
    ]
  },
  {
    id: 'wo-103',
    woNumber: 'WO-2026-00103',
    clientId: 'cli-003',
    clientName: 'PT Synergy Energi Utama',
    serviceId: 'srv-003',
    serviceName: 'Pendaftaran NIB & Perizinan Berusaha OSS-RBA',
    picStaffId: 'usr-3',
    picStaffName: 'Budi Santoso, S.H.',
    priority: 'Urgent',
    startDate: '2026-09-01',
    deadline: '2026-09-15',
    status: 'Completed',
    health: 'ON_TRACK',
    blockedOn: 'NONE',
    currentStageIndex: 3,
    progressPercent: 100,
    estimatedPrice: 4500000,
    description: 'Pengurusan NIB usaha sektor ketenagalistrikan dan panel surya.',
    createdAt: '2026-09-01',
    actionRequired: 'Pekerjaan telah selesai sepenuhnya.',
    clientActionItem: 'Seluruh dokumen legal siap diunduh di portal.',
    workflow: [
      { stageId: 'stg-301', stageName: 'Analisis KBLI & Verifikasi Lokasi', status: 'Completed', completedAt: '2026-09-03', completedBy: 'Budi Santoso, S.H.', clientFriendlyLabel: 'Analisis KBLI selesai' },
      { stageId: 'stg-302', stageName: 'Penginputan Sistem OSS-RBA', status: 'Completed', completedAt: '2026-09-07', completedBy: 'Budi Santoso, S.H.', clientFriendlyLabel: 'Input OSS RBA selesai' },
      { stageId: 'stg-303', stageName: 'Verifikasi Instansi Teknis', status: 'Completed', completedAt: '2026-09-11', completedBy: 'Budi Santoso, S.H.', clientFriendlyLabel: 'Verifikasi teknis selesai' },
      { stageId: 'stg-304', stageName: 'Penerbitan Sertifikat Standar / NIB', status: 'Completed', completedAt: '2026-09-14', completedBy: 'Maya Putri, S.H.', clientFriendlyLabel: 'NIB resmi terbit' }
    ]
  },
  {
    id: 'wo-104',
    woNumber: 'WO-2026-00104',
    clientId: 'cli-004',
    clientName: 'PT Prima Digital Indonesia',
    serviceId: 'srv-004',
    serviceName: 'Pendaftaran Merek Dagang & Hak Cipta (HAKI)',
    picStaffId: 'usr-4',
    picStaffName: 'Siti Rahma, S.H.',
    priority: 'Low',
    startDate: '2026-09-18',
    deadline: '2026-10-18',
    status: 'To Do',
    health: 'HIGH_RISK',
    blockedOn: 'CLIENT',
    currentStageIndex: 0,
    progressPercent: 10,
    estimatedPrice: 3500000,
    description: 'Pendaftaran merek aplikasi "HealthKu" Kelas 9 dan Kelas 42.',
    createdAt: '2026-09-18',
    actionRequired: 'Kirim WhatsApp reminder ke Klien untuk unggah Surat Pernyataan Merek',
    clientActionItem: 'Mohon unggah Surat Pernyataan Kepemilikan Merek',
    workflow: [
      { stageId: 'stg-401', stageName: 'Penelusuran Merek (Trademark Search)', status: 'In Progress', clientFriendlyLabel: 'Penelusuran nama merek' },
      { stageId: 'stg-402', stageName: 'Penyiapan Berkas & Klasifikasi Kelas', status: 'Pending', clientFriendlyLabel: 'Penyiapan berkas DJKI' },
      { stageId: 'stg-403', stageName: 'Pendaftaran Online ke DJKI', status: 'Pending', clientFriendlyLabel: 'Submit ke DJKI Kemenkumham' },
      { stageId: 'stg-404', stageName: 'Penerbitan Bukti Agenda & Pengawasan', status: 'Pending', clientFriendlyLabel: 'Penerbitan Sertifikat Merek' }
    ]
  }
];

export const INITIAL_WHATSAPP_MESSAGES = [
  {
    id: 'wa-001',
    workOrderId: 'wo-101',
    workOrderNumber: 'WO-2026-00101',
    senderRole: 'Notary' as const,
    senderName: 'Notaris Soebagjo, S.H., M.Kn.',
    maskedPhone: '0815-****-1122',
    recipientRole: 'Client' as const,
    messageText: 'Draf akta pendirian PT Nusantara Tech Solution sudah kami unggah ke platform. Mohon diperiksa.',
    timestamp: '19 Sep 2026, 09:30',
    resolutionMethod: 'REPLY_CONTEXT' as const,
    status: 'DELIVERED' as const
  },
  {
    id: 'wa-002',
    workOrderId: 'wo-101',
    workOrderNumber: 'WO-2026-00101',
    senderRole: 'Client' as const,
    senderName: 'Hendra Wijaya',
    maskedPhone: '0812-****-5432',
    recipientRole: 'Notary' as const,
    messageText: 'Baik Pak Notaris, kami telah menyetujui e-draf akta tersebut.',
    timestamp: '19 Sep 2026, 10:05',
    resolutionMethod: 'EXPLICIT_CODE' as const,
    status: 'DELIVERED' as const
  },
  {
    id: 'wa-003',
    workOrderId: 'wo-104',
    workOrderNumber: 'WO-2026-00104',
    senderRole: 'Platform' as const,
    senderName: 'System Bot LexiFlow',
    maskedPhone: '0811-0000-PROXY',
    recipientRole: 'Client' as const,
    messageText: 'Halo Pak Ahmad, reminder pengurusan merek HealthKu memerlukan unggahan Surat Pernyataan Merek.',
    timestamp: '19 Sep 2026, 11:15',
    resolutionMethod: 'SINGLE_ACTIVE' as const,
    templateCode: 'wa_task_reminder',
    status: 'SENT' as const
  }
];


export const INITIAL_TASKS: Task[] = [
  {
    id: 'tsk-01',
    workOrderId: 'wo-101',
    title: 'Verifikasi Kelengkapan KTP & NPWP Pengurus',
    description: 'Memastikan NIK terdaftar di Dukcapil dan status NPWP Valid (Konfirmasi KSWP).',
    assigneeId: 'usr-3',
    assigneeName: 'Budi Santoso, S.H.',
    priority: 'High',
    deadline: '2026-09-12',
    status: 'Completed',
    attachmentsCount: 4,
    notesCount: 2,
    createdAt: '2026-09-10'
  },
  {
    id: 'tsk-02',
    workOrderId: 'wo-101',
    title: 'Pemeriksaan Nama PT di AHU Kemenkumham',
    description: 'Cek ketersediaan nama PT Nusantara Tech Solution pada database AHU Online.',
    assigneeId: 'usr-3',
    assigneeName: 'Budi Santoso, S.H.',
    priority: 'High',
    deadline: '2026-09-14',
    status: 'Completed',
    attachmentsCount: 1,
    notesCount: 1,
    createdAt: '2026-09-11'
  },
  {
    id: 'tsk-03',
    workOrderId: 'wo-101',
    title: 'Submission NIB di OSS RBA',
    description: 'Input KBLI 62019 (Aktivitas Pemrograman Komputer Lainnya) & submit perizinan.',
    assigneeId: 'usr-3',
    assigneeName: 'Budi Santoso, S.H.',
    priority: 'Urgent',
    deadline: '2026-09-20',
    status: 'In Progress',
    attachmentsCount: 2,
    notesCount: 3,
    createdAt: '2026-09-16'
  },
  {
    id: 'tsk-04',
    workOrderId: 'wo-102',
    title: 'Review Draf RUPS & Akta Notaris Perubahan',
    description: 'Evaluasi kesesuaian pasal 15 Anggaran Dasar terkait kuorum pemegang saham.',
    assigneeId: 'usr-4',
    assigneeName: 'Siti Rahma, S.H.',
    priority: 'Medium',
    deadline: '2026-09-19',
    status: 'Review',
    attachmentsCount: 3,
    notesCount: 4,
    createdAt: '2026-09-15'
  },
  {
    id: 'tsk-05',
    workOrderId: 'wo-104',
    title: 'Penelusuran Merek "HealthKu" di DJKI',
    description: 'Lakukan penelusuran apakah nama "HealthKu" sudah terdaftar di Kelas 9 / 42.',
    assigneeId: 'usr-4',
    assigneeName: 'Siti Rahma, S.H.',
    priority: 'Medium',
    deadline: '2026-09-22',
    status: 'To Do',
    attachmentsCount: 0,
    notesCount: 1,
    createdAt: '2026-09-18'
  }
];

export const INITIAL_DOCUMENTS: LegalDocument[] = [
  {
    id: 'doc-001',
    docNumber: 'DOC-2026-0081',
    title: 'KTP & NPWP Direktur (Hendra Wijaya)',
    category: 'Identity',
    workOrderId: 'wo-101',
    workOrderNumber: 'WO-2026-00101',
    clientId: 'cli-001',
    clientName: 'PT Nusantara Tech Solution',
    currentVersion: 1,
    fileType: 'PDF',
    fileSize: '1.8 MB',
    uploadedBy: 'Eko Prasetyo',
    uploadedAt: '2026-09-10 09:30',
    accessLevel: 'Restricted',
    versions: [
      { version: 1, fileName: 'KTP_NPWP_Hendra.pdf', fileSize: '1.8 MB', uploadedBy: 'Eko Prasetyo', uploadedAt: '2026-09-10 09:30', notes: 'Dokumen asli terverifikasi' }
    ]
  },
  {
    id: 'doc-002',
    docNumber: 'DOC-2026-0082',
    title: 'Draft Minuta Akta Pendirian PT Nusantara Tech',
    category: 'Company Document',
    workOrderId: 'wo-101',
    workOrderNumber: 'WO-2026-00101',
    clientId: 'cli-001',
    clientName: 'PT Nusantara Tech Solution',
    currentVersion: 2,
    fileType: 'DOCX',
    fileSize: '450 KB',
    uploadedBy: 'Budi Santoso, S.H.',
    uploadedAt: '2026-09-16 14:15',
    accessLevel: 'Confidential',
    versions: [
      { version: 1, fileName: 'Draft_Akta_V1.docx', fileSize: '420 KB', uploadedBy: 'Budi Santoso, S.H.', uploadedAt: '2026-09-14 11:00', notes: 'Draft awal dari Notaris' },
      { version: 2, fileName: 'Draft_Akta_V2_Final.docx', fileSize: '450 KB', uploadedBy: 'Budi Santoso, S.H.', uploadedAt: '2026-09-16 14:15', notes: 'Revisi perbaikan modal disetor sesuai RUPS' }
    ]
  },
  {
    id: 'doc-003',
    docNumber: 'DOC-2026-0083',
    title: 'SK Kemenkumham Pendirian PT Nusantara Tech',
    category: 'Government Document',
    workOrderId: 'wo-101',
    workOrderNumber: 'WO-2026-00101',
    clientId: 'cli-001',
    clientName: 'PT Nusantara Tech Solution',
    currentVersion: 1,
    fileType: 'PDF',
    fileSize: '2.4 MB',
    uploadedBy: 'Budi Santoso, S.H.',
    uploadedAt: '2026-09-18 16:00',
    accessLevel: 'Public',
    versions: [
      { version: 1, fileName: 'SK_AHU_NusantaraTech.pdf', fileSize: '2.4 MB', uploadedBy: 'Budi Santoso, S.H.', uploadedAt: '2026-09-18 16:00', notes: 'Nomor AHU-0012345.AH.01.01.YEAR 2026' }
    ]
  },
  {
    id: 'doc-004',
    docNumber: 'DOC-2026-0084',
    title: 'NIB PT Synergy Energi Utama',
    category: 'License',
    workOrderId: 'wo-103',
    workOrderNumber: 'WO-2026-00103',
    clientId: 'cli-003',
    clientName: 'PT Synergy Energi Utama',
    currentVersion: 1,
    fileType: 'PDF',
    fileSize: '3.1 MB',
    uploadedBy: 'Maya Putri, S.H.',
    uploadedAt: '2026-09-14 10:20',
    accessLevel: 'Public',
    versions: [
      { version: 1, fileName: 'NIB_Synergy_Energi_Resmi.pdf', fileSize: '3.1 MB', uploadedBy: 'Maya Putri, S.H.', uploadedAt: '2026-09-14 10:20', notes: 'NIB terbit dari OSS RBA BKPM' }
    ]
  }
];

export const INITIAL_APPROVALS: ApprovalRequest[] = [
  {
    id: 'app-001',
    requestNumber: 'APR-2026-0041',
    workOrderId: 'wo-102',
    workOrderNumber: 'WO-2026-00102',
    workOrderTitle: 'Perubahan Akta CV Karya Mandiri',
    requestedBy: 'Siti Rahma, S.H.',
    requestedAt: '2026-09-19 10:15',
    targetApproverRole: 'admin',
    approverName: 'Maya Putri, S.H.',
    documentId: 'doc-002',
    documentTitle: 'Draf Akta Perubahan Notaris',
    type: 'Document Signoff',
    status: 'Pending',
    notes: 'Mohon persetujuan draf akta perubahan untuk disubmit ke Kemenkumham.'
  },
  {
    id: 'app-002',
    requestNumber: 'APR-2026-0040',
    workOrderId: 'wo-101',
    workOrderNumber: 'WO-2026-00101',
    workOrderTitle: 'Pendirian PT Nusantara Tech Solution',
    requestedBy: 'Budi Santoso, S.H.',
    requestedAt: '2026-09-18 15:30',
    targetApproverRole: 'admin',
    approverName: 'Maya Putri, S.H.',
    type: 'Stage Completion',
    status: 'Approved',
    notes: 'SK Kemenkumham telah terbit, mohon persetujuan transisi ke tahap OSS-RBA.',
    decisionDate: '2026-09-18 16:45',
    decisionComments: 'Disetujui. Lanjutkan penginputan NIB di OSS RBA.'
  },
  {
    id: 'app-003',
    requestNumber: 'APR-2026-0039',
    workOrderId: 'wo-103',
    workOrderNumber: 'WO-2026-00103',
    workOrderTitle: 'Pendaftaran NIB PT Synergy Energi Utama',
    requestedBy: 'Budi Santoso, S.H.',
    requestedAt: '2026-09-14 09:00',
    targetApproverRole: 'admin',
    approverName: 'Maya Putri, S.H.',
    type: 'Final WO Completion',
    status: 'Approved',
    notes: 'Seluruh tahap perizinan NIB dan Sertifikat Standar selesai.',
    decisionDate: '2026-09-14 10:00',
    decisionComments: 'Sangat baik. Berkas siap diserahkan ke klien.'
  }
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'cal-01', title: 'Deadline Submission NIB PT Nusantara Tech', date: '2026-09-24', type: 'Deadline', priority: 'High', relatedWoId: 'wo-101', relatedWoNumber: 'WO-2026-00101' },
  { id: 'cal-02', title: 'Meeting Notaris & Klien CV Karya Mandiri', date: '2026-09-20', type: 'Meeting', priority: 'Medium', relatedWoId: 'wo-102', relatedWoNumber: 'WO-2026-00102' },
  { id: 'cal-03', title: 'Review Pengajuan Merek PT Prima Digital', date: '2026-09-22', type: 'Task', priority: 'Low', relatedWoId: 'wo-104', relatedWoNumber: 'WO-2026-00104' },
  { id: 'cal-04', title: 'Pemeriksaan Berkas DJKI Kemenkumham', date: '2026-09-28', type: 'Government Submission', priority: 'High' }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'not-01', title: 'Permintaan Approval Baru', message: 'Siti Rahma meminta approval draf akta untuk WO-2026-00102', timestamp: '10 menit yang lalu', read: false, type: 'approval' },
  { id: 'not-02', title: 'Deadline Mendekat!', message: 'Deadline WO-2026-00101 tersisa 5 hari lagi', timestamp: '2 jam yang lalu', read: false, type: 'deadline' },
  { id: 'not-03', title: 'Tugas Diperbarui', message: 'Budi Santoso mengunggah SK Kemenkumham baru', timestamp: 'Yesterday', read: true, type: 'task' }
];

export const INITIAL_WORK_NOTES: WorkNote[] = [
  {
    id: 'not-001',
    workOrderId: 'wo-101',
    authorName: 'Budi Santoso, S.H.',
    authorRole: 'Legal Staff',
    content: 'Dokumen KTP Direktur telah diverifikasi. Nama PT Nusantara Tech Solution disetujui tanpa sanggahan.',
    timestamp: '2026-09-12 11:20'
  },
  {
    id: 'not-002',
    workOrderId: 'wo-101',
    authorName: 'Hendra Wijaya',
    authorRole: 'Client',
    content: 'Kami telah mentransfer pembayaran termin 1 sebesar 50% untuk pendirian PT.',
    timestamp: '2026-09-13 14:00'
  },
  {
    id: 'not-003',
    workOrderId: 'wo-102',
    authorName: 'Siti Rahma, S.H.',
    authorRole: 'Legal Staff',
    content: 'Draf RUPS telah disesuaikan dengan masukan pihak Kemenkumham.',
    timestamp: '2026-09-17 09:45'
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  { id: 'act-001', userName: 'Budi Santoso, S.H.', userRole: 'Legal Staff', action: 'Upload Document', targetObject: 'SK Kemenkumham PT Nusantara Tech', timestamp: '2026-09-18 16:00', ipAddress: '182.253.44.12' },
  { id: 'act-002', userName: 'Maya Putri, S.H.', userRole: 'Manager/Supervisor', action: 'Approve Request', targetObject: 'Stage Completion WO-2026-00101', timestamp: '2026-09-18 16:45', ipAddress: '182.253.44.15' },
  { id: 'act-003', userName: 'Siti Rahma, S.H.', userRole: 'Legal Staff', action: 'Submit Approval', targetObject: 'Draf Akta WO-2026-00102', timestamp: '2026-09-19 10:15', ipAddress: '182.253.44.18' },
  { id: 'act-004', userName: 'Agus Hermawan', userRole: 'Finance', action: 'Create Invoice', targetObject: 'INV-2026-00089 (PT Nusantara Tech)', timestamp: '2026-09-19 10:30', ipAddress: '182.253.44.20' }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-01',
    invoiceNumber: 'INV-2026-00089',
    clientId: 'cli-001',
    clientName: 'PT Nusantara Tech Solution',
    workOrderId: 'wo-101',
    workOrderNumber: 'WO-2026-00101',
    serviceName: 'Pendirian PT Perseroan Terbatas (Lokal)',
    amount: 9500000,
    taxAmount: 1045000,
    totalAmount: 10545000,
    paidAmount: 5272500,
    issueDate: '2026-09-10',
    dueDate: '2026-09-24',
    status: 'Partial',
    paymentMethod: 'Transfer Bank BCA',
    lastPaymentDate: '2026-09-13'
  },
  {
    id: 'inv-02',
    invoiceNumber: 'INV-2026-00088',
    clientId: 'cli-003',
    clientName: 'PT Synergy Energi Utama',
    workOrderId: 'wo-103',
    workOrderNumber: 'WO-2026-00103',
    serviceName: 'Pendaftaran NIB & Perizinan Berusaha OSS-RBA',
    amount: 4500000,
    taxAmount: 495000,
    totalAmount: 4995000,
    paidAmount: 4995000,
    issueDate: '2026-09-01',
    dueDate: '2026-09-15',
    status: 'Paid',
    paymentMethod: 'Transfer Bank Mandiri',
    lastPaymentDate: '2026-09-14'
  },
  {
    id: 'inv-03',
    invoiceNumber: 'INV-2026-00090',
    clientId: 'cli-002',
    clientName: 'CV Karya Mandiri Sejahtera',
    workOrderId: 'wo-102',
    workOrderNumber: 'WO-2026-00102',
    serviceName: 'Perubahan Akta & Anggaran Dasar Perusahaan',
    amount: 6500000,
    taxAmount: 715000,
    totalAmount: 7215000,
    paidAmount: 0,
    issueDate: '2026-09-14',
    dueDate: '2026-09-21',
    status: 'Unpaid'
  }
];

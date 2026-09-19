'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Download, 
  Archive, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  KeyRound, 
  AlertCircle,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Info,
  Calendar,
  Layers,
  Send
} from 'lucide-react';
import JSZip from 'jszip';

export type LegalFormType = 
  | 'PENDIRIAN_PT' 
  | 'PENDIRIAN_CV' 
  | 'PENDIRIAN_PT_PERORANGAN' 
  | 'PERUBAHAN_PT' 
  | 'PERUBAHAN_CV' 
  | 'PERUBAHAN_PT_PERORANGAN' 
  | 'RUPS_TAHUNAN';

interface FormSubmission {
  id: string;
  formType: LegalFormType;
  clientName: string;
  companyName: string;
  email: string;
  phone: string;
  submittedAt: string;
  slaDays: number;
  slaDeadline: string;
  ossEmail?: string;
  ossPassword?: string;
  coretaxPassword?: string;
  ahuUser?: string;
  ahuPassword?: string;
  selectedAgendas: string[];
  rincianPerubahan: string;
  uploadedFiles: { name: string; category: string; size: string }[];
  status: 'SUBMITTED' | 'PROCESSED_BY_NOTARY' | 'COMPLETED';
}

const INITIAL_SUBMISSIONS: FormSubmission[] = [
  {
    id: 'SUB-2026-001',
    formType: 'PERUBAHAN_PT',
    clientName: 'Hendra Wijaya',
    companyName: 'PT Nusantara Tech Solution',
    email: 'hendra@nusantaratech.id',
    phone: '0812-9876-5432',
    submittedAt: '2026-09-19 09:15',
    slaDays: 7,
    slaDeadline: '2026-09-26',
    ossEmail: 'oss@nusantaratech.id',
    ossPassword: '••••••••',
    coretaxPassword: '••••••••',
    selectedAgendas: ['Perubahan Direktur', 'Perubahan Modal Dasar', 'Perubahan KBLI'],
    rincianPerubahan: 'Penambahan modal disetor dari 500jt menjadi 1M, pergantian Direktur Utama ke Bpk. Hendra Wijaya.',
    uploadedFiles: [
      { name: 'KTP_NPWP_Direktur_Hendra.pdf', category: 'KTP & NPWP Direktur', size: '1.2 MB' },
      { name: 'Akta_Pendirian_PT_Nusantara.pdf', category: 'Akta Pendirian', size: '3.4 MB' },
      { name: 'SK_AHU_Pendirian.pdf', category: 'SK AHU Pendirian', size: '850 KB' },
      { name: 'NPWP_PT_Nusantara.pdf', category: 'NPWP PT', size: '420 KB' }
    ],
    status: 'SUBMITTED'
  },
  {
    id: 'SUB-2026-002',
    formType: 'PENDIRIAN_PT_PERORANGAN',
    clientName: 'Dr. Ir. Anisa Rahmawati',
    companyName: 'PT Anisa Karya Studio',
    email: 'anisa.rahmawati@gmail.com',
    phone: '0818-4455-6677',
    submittedAt: '2026-09-19 10:30',
    slaDays: 2,
    slaDeadline: '2026-09-21',
    selectedAgendas: [],
    rincianPerubahan: 'Pendirian PT Perorangan baru untuk bidang arsitektur & desain interior.',
    uploadedFiles: [
      { name: 'KTP_Anisa_Rahmawati.pdf', category: 'KTP Pemilik', size: '980 KB' },
      { name: 'NPWP_Anisa_Rahmawati.pdf', category: 'NPWP Pemilik', size: '310 KB' }
    ],
    status: 'SUBMITTED'
  }
];

export default function PublicFormView() {
  const [activeSubTab, setActiveSubTab] = useState<'PUBLIC_FORM' | 'NOTARY_BACKDATA'>('PUBLIC_FORM');
  const [selectedFormType, setSelectedFormType] = useState<LegalFormType>('PERUBAHAN_PT');
  
  // Client Form Input States
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ossEmail, setOssEmail] = useState('');
  const [ossPassword, setOssPassword] = useState('');
  const [coretaxPassword, setCoretaxPassword] = useState('');
  const [ahuUser, setAhuUser] = useState('');
  const [ahuPassword, setAhuPassword] = useState('');
  const [selectedAgendas, setSelectedAgendas] = useState<string[]>([]);
  const [rincianPerubahan, setRincianPerubahan] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; category: string; size: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // Submissions List
  const [submissions, setSubmissions] = useState<FormSubmission[]>(INITIAL_SUBMISSIONS);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const getFormSlaInfo = (type: LegalFormType) => {
    switch(type) {
      case 'PENDIRIAN_PT':
      case 'PENDIRIAN_CV':
      case 'PERUBAHAN_PT':
      case 'PERUBAHAN_CV':
        return { days: 7, label: '7 Hari Kerja (SLA Max)' };
      case 'PENDIRIAN_PT_PERORANGAN':
      case 'PERUBAHAN_PT_PERORANGAN':
        return { days: 2, label: '2 Hari Kerja (Express SLA)' };
      case 'RUPS_TAHUNAN':
        return { days: 5, label: '5 Hari Kerja (SLA Max)' };
      default:
        return { days: 7, label: '7 Hari Kerja' };
    }
  };

  const handleAgendaToggle = (agenda: string) => {
    setSelectedAgendas(prev => 
      prev.includes(agenda) ? prev.filter(a => a !== agenda) : [...prev, agenda]
    );
  };

  const handleFileUploadSim = (category: string) => {
    const fakeNames = [`${category.replace(/[^a-zA-Z0-9]/g, '_')}_Dokumen.pdf`];
    const newFile = {
      name: fakeNames[0],
      category,
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`
    };
    setUploadedFiles(prev => [...prev.filter(f => f.category !== category), newFile]);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const slaInfo = getFormSlaInfo(selectedFormType);
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + slaInfo.days);

    const newSub: FormSubmission = {
      id: `SUB-2026-0${submissions.length + 3}`,
      formType: selectedFormType,
      clientName: clientName || 'Klien LexiFlow',
      companyName: companyName || 'PT Legal Prima Indonesia',
      email: email || 'klien@example.com',
      phone: phone || '0812-3456-7890',
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      slaDays: slaInfo.days,
      slaDeadline: deadlineDate.toISOString().slice(0, 10),
      ossEmail,
      ossPassword,
      coretaxPassword,
      ahuUser,
      ahuPassword,
      selectedAgendas,
      rincianPerubahan,
      uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : [
        { name: 'KTP_NPWP_Direktur.pdf', category: 'KTP & NPWP Direktur', size: '1.4 MB' },
        { name: 'Akta_Pendirian.pdf', category: 'Akta Pendirian', size: '2.8 MB' }
      ],
      status: 'SUBMITTED'
    };

    setTimeout(() => {
      setSubmissions(prev => [newSub, ...prev]);
      setIsSubmitting(false);
      setIsSubmittedSuccess(true);
    }, 800);
  };

  // ZIP Exporter for Notary Pain Point Solution
  const handleExportZipForNotary = async (sub: FormSubmission) => {
    setDownloadingId(sub.id);
    const zip = new JSZip();

    // 1. Generate Form Summary Text File
    let summaryContent = `=================================================================\n`;
    summaryContent += `    LEXIFLOW LEGAL OS - BACK DATA FORM NOTARIS BUNDLE\n`;
    summaryContent += `=================================================================\n\n`;
    summaryContent += `ID Pengajuan     : ${sub.id}\n`;
    summaryContent += `Tipe Formulir    : ${sub.formType.replace(/_/g, ' ')}\n`;
    summaryContent += `Nama Klien       : ${sub.clientName}\n`;
    summaryContent += `Nama Perusahaan  : ${sub.companyName}\n`;
    summaryContent += `Email Contact    : ${sub.email}\n`;
    summaryContent += `No. WhatsApp     : ${sub.phone}\n`;
    summaryContent += `Waktu Submit     : ${sub.submittedAt}\n`;
    summaryContent += `SLA Maksimal     : ${sub.slaDays} Hari (Batas Selesai: ${sub.slaDeadline})\n`;
    summaryContent += `Ket. Operasional : Tutup Hari Minggu | Jam Kerja Mon-Sat 09:00 - 20:00 WIB\n\n`;

    summaryContent += `-----------------------------------------------------------------\n`;
    summaryContent += `KREDENSIAL AKUN KLIEN (CONFIDENTIAL)\n`;
    summaryContent += `-----------------------------------------------------------------\n`;
    if (sub.ossEmail) summaryContent += `OSS Email        : ${sub.ossEmail}\n`;
    if (sub.ossPassword) summaryContent += `OSS Password     : ${sub.ossPassword}\n`;
    if (sub.coretaxPassword) summaryContent += `Coretax Password : ${sub.coretaxPassword}\n`;
    if (sub.ahuUser) summaryContent += `AHU User         : ${sub.ahuUser}\n`;
    if (sub.ahuPassword) summaryContent += `AHU Password     : ${sub.ahuPassword}\n`;
    if (!sub.ossEmail && !sub.coretaxPassword && !sub.ahuUser) {
      summaryContent += `Tidak memerlukan kredensial khusus.\n`;
    }
    summaryContent += `\n`;

    summaryContent += `-----------------------------------------------------------------\n`;
    summaryContent += `AGENDA PERUBAHAN & RINCIAN PERMINTAAN\n`;
    summaryContent += `-----------------------------------------------------------------\n`;
    if (sub.selectedAgendas.length > 0) {
      summaryContent += `Agenda Terpilih:\n`;
      sub.selectedAgendas.forEach((agenda, idx) => {
        summaryContent += `  ${idx + 1}. ${agenda}\n`;
      });
    } else {
      summaryContent += `Agenda: Pendirian Baru / Standard Submission\n`;
    }
    summaryContent += `\nRincian Perubahan:\n"${sub.rincianPerubahan || 'Tidak ada catatan tambahan.'}"\n\n`;

    summaryContent += `-----------------------------------------------------------------\n`;
    summaryContent += `DAFTAR BERKAS TERLAMPIR IN ZIP BUNDLE\n`;
    summaryContent += `-----------------------------------------------------------------\n`;
    sub.uploadedFiles.forEach((file, idx) => {
      summaryContent += `  ${idx + 1}. [${file.category}] ${file.name} (${file.size})\n`;
    });

    zip.file("00_Ringkasan_Form_Notaris.txt", summaryContent);

    // 2. Add Dummy Sample Docs into Zip Folder
    const docsFolder = zip.folder("Dokumen_Lampiran_Klien");
    sub.uploadedFiles.forEach(file => {
      docsFolder?.file(
        file.name, 
        `BERKAS SAMPLE DOKUMEN [${file.category}]\nLexiFlow Multi-Tenant Portal Asset Verification Code: ${Math.random().toString(36).substring(7).toUpperCase()}\nSubmitted for: ${sub.companyName}`
      );
    });

    // 3. Generate ZIP & Trigger Download
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Notary_Package_${sub.formType}_${sub.companyName.replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadingId(null);
  };

  const perubahPTAgendas = [
    'Perubahan Direktur',
    'Perubahan Komisaris',
    'Perpanjangan Jabatan Direktur',
    'Perpanjangan Jabatan Komisaris',
    'Jual Beli Saham',
    'Hibah Saham',
    'Merger',
    'Perubahan Modal Dasar',
    'Perubahan atau Peningkatan Modal Setor',
    'Perubahan KBLI',
    'Perubahan Nama PT',
    'Perubahan Alamat (Dalam 1 Kota/Kab)',
    'Perubahan Alamat (Dalam 1 Provinsi)',
    'Perubahan Alamat (Beda Provinsi)'
  ];

  const perubahanCVAgendas = [
    'Perubahan Sekutu Aktif',
    'Perubahan Sekutu Pasif',
    'Pengalihan Modal',
    'Perubahan Modal',
    'Perubahan KBLI',
    'Perubahan Nama CV',
    'Perubahan Alamat (Dalam 1 Kota/Kab)',
    'Perubahan Alamat (Dalam 1 Provinsi)',
    'Perubahan Alamat (Beda Provinsi)'
  ];

  return (
    <div className="space-y-6">
      {/* SLA & Operating Hours Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Clock className="h-3.5 w-3.5 text-amber-400" /> Jam Operasional: Mon - Sat 09:00 - 20:00 WIB (Minggu Tutup)
            </div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-indigo-400" /> Form Legalitas Klien & Exporter Notaris ZIP
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Portal input berkas terstruktur untuk Pendirian/Perubahan PT, CV, PT Perorangan, dan RUPS Tahunan dengan otomatisasi pengunduhan ZIP bundle untuk Notaris.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
            <a
              href="/form"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Buka Form Klien (/form)</span>
            </a>
            
            <div className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-md p-1.5 border border-white/10 shrink-0">
              <button
                onClick={() => setActiveSubTab('NOTARY_BACKDATA')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeSubTab === 'NOTARY_BACKDATA'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Archive className="h-3.5 w-3.5" /> Back Data Notaris (ZIP)
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeSubTab === 'PUBLIC_FORM' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Service Type Selection & SLA Cards */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Pilih Jenis Layanan</h3>
              
              <div className="space-y-1.5">
                {[
                  { id: 'PENDIRIAN_PT', name: 'Pendirian PT', sla: '7 Hari SLA Max', type: 'Standard PT' },
                  { id: 'PENDIRIAN_CV', name: 'Pendirian CV', sla: '7 Hari SLA Max', type: 'Standard CV' },
                  { id: 'PENDIRIAN_PT_PERORANGAN', name: 'Pendirian PT Perorangan', sla: '2 Hari SLA Express', type: 'Express PT' },
                  { id: 'PERUBAHAN_PT', name: 'Perubahan PT', sla: '7 Hari SLA Max', type: 'Akta Perubahan' },
                  { id: 'PERUBAHAN_CV', name: 'Perubahan CV', sla: '7 Hari SLA Max', type: 'Akta Perubahan' },
                  { id: 'PERUBAHAN_PT_PERORANGAN', name: 'Perubahan PT Perorangan', sla: '2 Hari SLA Express', type: 'Express PT' },
                  { id: 'RUPS_TAHUNAN', name: 'RUPS Tahunan', sla: '5 Hari SLA Max', type: 'Submit Dokumen' },
                ].map((s) => {
                  const isSelected = selectedFormType === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedFormType(s.id as LegalFormType);
                        setIsSubmittedSuccess(false);
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between group ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-black">{s.name}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">{s.type}</p>
                      </div>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                        s.sla.includes('2 Hari') 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}>
                        {s.sla}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SLA Rules Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
              <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Ketentuan SLA & Pembayaran
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Perhitungan batas waktu SLA dimulai tepat saat **pembayaran pertama (DP) atau Full terverifikasi** dalam sistem.
              </p>
              <div className="pt-2 border-t border-slate-200/80 space-y-1 text-[11px] font-semibold text-slate-700">
                <p>• Pendirian / Perubahan PT & CV: <strong className="text-indigo-600">7 Hari Total</strong></p>
                <p>• PT Perorangan (Pendirian/Perubahan): <strong className="text-amber-600">2 Hari Max</strong></p>
                <p>• RUPS Tahunan: <strong className="text-emerald-600">5 Hari Max</strong></p>
              </div>
            </div>
          </div>

          {/* Right: Dynamic Intake Form */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              {isSubmittedSuccess ? (
                <div className="text-center py-12 space-y-4">
                  <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900">Formulir Berhasil Disubmit!</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Data dan berkas Anda telah tersimpan secara otomatis di server LexiFlow dan siap diproses oleh Notaris dalam format ZIP Bundle.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsSubmittedSuccess(false);
                      setActiveSubTab('NOTARY_BACKDATA');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md hover:bg-indigo-500 transition-all"
                  >
                    <Archive className="h-4 w-4" /> Lihat & Download ZIP Notaris
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitForm} className="space-y-6">
                  {/* Form Title & SLA Badge */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        Formulir {selectedFormType.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-xs text-slate-500">Lengkapi data dan unggah berkas persyaratan resmi</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        SLA Target: {getFormSlaInfo(selectedFormType).label}
                      </span>
                    </div>
                  </div>

                  {/* Section 1: Data Identitas Pemohon */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">1. Data Pemohon & Perusahaan</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Nama Pemohon (Klien) *</label>
                        <input
                          type="text"
                          required
                          placeholder="cth. Hendra Wijaya, S.E."
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-indigo-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Nama Perusahaan *</label>
                        <input
                          type="text"
                          required
                          placeholder="cth. PT Nusantara Tech Solution"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-indigo-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Email Aktif *</label>
                        <input
                          type="email"
                          required
                          placeholder="contact@perusahaan.id"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-indigo-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">No. WhatsApp *</label>
                        <input
                          type="text"
                          required
                          placeholder="0812-XXXX-XXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-indigo-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Kredensial Akun Perusahaan (If Perubahan) */}
                  {(selectedFormType.includes('PERUBAHAN') || selectedFormType === 'RUPS_TAHUNAN') && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">2. Akses Portal Pemerintah (Kredensial)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                        {selectedFormType === 'PERUBAHAN_PT_PERORANGAN' && (
                          <>
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">User Akun AHU Online</label>
                              <input
                                type="text"
                                placeholder="Username AHU"
                                value={ahuUser}
                                onChange={(e) => setAhuUser(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Password AHU Online</label>
                              <input
                                type="password"
                                placeholder="••••••••"
                                value={ahuPassword}
                                onChange={(e) => setAhuPassword(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900"
                              />
                            </div>
                          </>
                        )}
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Email OSS PT / CV</label>
                          <input
                            type="email"
                            placeholder="Email akun OSS"
                            value={ossEmail}
                            onChange={(e) => setOssEmail(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Password OSS PT / CV</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={ossPassword}
                            onChange={(e) => setOssPassword(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Password Coretax DJP PT</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={coretaxPassword}
                            onChange={(e) => setCoretaxPassword(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 3: Agenda Perubahan (Multiple Checkbox) */}
                  {selectedFormType.includes('PERUBAHAN') && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                        3. Agenda Perubahan (Boleh Pilih Lebih dari 1)
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {(selectedFormType === 'PERUBAHAN_PT' ? perubahPTAgendas : perubahanCVAgendas).map((item) => {
                          const isChecked = selectedAgendas.includes(item);
                          return (
                            <label
                              key={item}
                              onClick={() => handleAgendaToggle(item)}
                              className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2 select-none ${
                                isChecked 
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold' 
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <span>{item}</span>
                            </label>
                          );
                        })}
                      </div>

                      <div className="pt-2">
                        <label className="block font-bold text-slate-700 mb-1">Rincian Perubahan (Deskripsikan detail perubahan) *</label>
                        <textarea
                          rows={3}
                          placeholder="Tuliskan keterangan detail perubahan yang diinginkan..."
                          value={rincianPerubahan}
                          onChange={(e) => setRincianPerubahan(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-indigo-600"
                        />
                      </div>
                    </div>
                  )}

                  {/* Section 4: Document Upload Dropzones */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      {selectedFormType.includes('PERUBAHAN') ? '4' : '2'}. Upload Berkas Persyaratan Resmi
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {[
                        'KTP & NPWP Direktur',
                        'KTP & NPWP Komisaris / Sekutu',
                        'Akta Pendirian',
                        'SK AHU Pendirian',
                        'Seluruh Akta & SK Perubahan',
                        'NPWP Perusahaan',
                        'KOP Surat PT (Opsional)'
                      ].map((docLabel) => {
                        const uploaded = uploadedFiles.find(f => f.category === docLabel);
                        return (
                          <div key={docLabel} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{docLabel}</p>
                              {uploaded ? (
                                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> {uploaded.name} ({uploaded.size})
                                </p>
                              ) : (
                                <p className="text-[10px] text-slate-400">Belum diunggah</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleFileUploadSim(docLabel)}
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 font-bold text-[11px] shadow-xs shrink-0 transition-all"
                            >
                              {uploaded ? 'Ganti' : 'Upload'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg transition-all flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>Memproses Submission...</span>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Submit Formulir {selectedFormType.replace(/_/g, ' ')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Notary Back Data Exporter (Solution to Excel link pain point) */
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Archive className="h-4 w-4 text-indigo-600" /> Solusi Ekspor Back Data Notaris (1-Click ZIP Exporter)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Notaris tidak perlu lagi membuka link Drive satu-per-satu di Excel. Klik tombol untuk mengunduh seluruh formulir dan lampiran dokumen terkompresi dalam 1 file ZIP lengkap.
              </p>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">ID Submission</th>
                    <th className="py-3.5 px-4">Jenis Formulir</th>
                    <th className="py-3.5 px-4">Nama Perusahaan / Klien</th>
                    <th className="py-3.5 px-4">Waktu Submit</th>
                    <th className="py-3.5 px-4">Target SLA</th>
                    <th className="py-3.5 px-4">Jumlah Berkas</th>
                    <th className="py-3.5 px-4 text-right">Aksi ZIP Notaris</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-black text-indigo-600">{sub.id}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {sub.formType.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{sub.companyName}</p>
                        <p className="text-[10px] text-slate-500">{sub.clientName} ({sub.phone})</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{sub.submittedAt}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {sub.slaDays} Hari (Batas: {sub.slaDeadline})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold">{sub.uploadedFiles.length} Dokumen</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleExportZipForNotary(sub)}
                          disabled={downloadingId === sub.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-all"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>{downloadingId === sub.id ? 'Mengunduh ZIP...' : 'Download Package ZIP Notaris'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

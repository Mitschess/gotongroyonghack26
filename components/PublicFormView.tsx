'use client';

import React, { useState } from 'react';
import { 
  Download, 
  Archive, 
  Clock,
  FileCheck,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  FileText,
  User,
  Building2,
  Calendar
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
  },
  {
    id: 'SUB-2026-003',
    formType: 'PENDIRIAN_CV',
    clientName: 'Rina Sugiarto',
    companyName: 'CV Karya Mandiri Sejahtera',
    email: 'admin@karyamandiri.co.id',
    phone: '0813-1122-3344',
    submittedAt: '2026-09-18 14:20',
    slaDays: 7,
    slaDeadline: '2026-09-25',
    selectedAgendas: [],
    rincianPerubahan: 'Pendirian CV baru untuk bidang jasa konstruksi skala menengah.',
    uploadedFiles: [
      { name: 'KTP_Rina_Sugiarto.pdf', category: 'KTP Sekutu Aktif', size: '1.1 MB' },
      { name: 'KTP_Sekutu_Pasif.pdf', category: 'KTP Sekutu Pasif', size: '1.0 MB' },
      { name: 'NPWP_Rina.pdf', category: 'NPWP Sekutu', size: '280 KB' }
    ],
    status: 'SUBMITTED'
  }
];

const FORM_TYPE_BADGE: Record<LegalFormType, { label: string; color: string }> = {
  PENDIRIAN_PT:            { label: 'Pendirian PT',         color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  PENDIRIAN_CV:            { label: 'Pendirian CV',         color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  PENDIRIAN_PT_PERORANGAN: { label: 'Pendirian PT Perorang',color: 'bg-amber-50 text-amber-700 border-amber-200' },
  PERUBAHAN_PT:            { label: 'Perubahan PT',         color: 'bg-purple-50 text-purple-700 border-purple-200' },
  PERUBAHAN_CV:            { label: 'Perubahan CV',         color: 'bg-purple-50 text-purple-700 border-purple-200' },
  PERUBAHAN_PT_PERORANGAN: { label: 'Perubahan PT Perorang',color: 'bg-orange-50 text-orange-700 border-orange-200' },
  RUPS_TAHUNAN:            { label: 'RUPS Tahunan',         color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export default function PublicFormView() {
  const [submissions] = useState<FormSubmission[]>(INITIAL_SUBMISSIONS);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleExportZipForNotary = async (sub: FormSubmission) => {
    setDownloadingId(sub.id);
    const zip = new JSZip();

    let summaryContent = `=================================================================\n`;
    summaryContent += `    WAKTUNYA LEGAL - BACK DATA NOTARIS BUNDLE\n`;
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
    summaryContent += `\n-----------------------------------------------------------------\n`;
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
    summaryContent += `\nRincian:\n"${sub.rincianPerubahan || 'Tidak ada catatan tambahan.'}"\n\n`;
    summaryContent += `-----------------------------------------------------------------\n`;
    summaryContent += `DAFTAR BERKAS TERLAMPIR\n`;
    summaryContent += `-----------------------------------------------------------------\n`;
    sub.uploadedFiles.forEach((file, idx) => {
      summaryContent += `  ${idx + 1}. [${file.category}] ${file.name} (${file.size})\n`;
    });

    zip.file('00_Ringkasan_Form_Notaris.txt', summaryContent);

    const docsFolder = zip.folder('Dokumen_Lampiran_Klien');
    sub.uploadedFiles.forEach(file => {
      docsFolder?.file(
        file.name,
        `BERKAS SAMPLE DOKUMEN [${file.category}]\nWaktunya Legal Back Data Bundle\nVerification: ${Math.random().toString(36).substring(7).toUpperCase()}\nDiajukan untuk: ${sub.companyName}`
      );
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NotaryPkg_${sub.formType}_${sub.companyName.replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadingId(null);
  };

  const totalFiles = submissions.reduce((sum, s) => sum + s.uploadedFiles.length, 0);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Clock className="h-3.5 w-3.5 text-amber-400" /> Jam Operasional: Mon - Sat 09:00 - 20:00 WIB (Minggu Tutup)
            </div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Archive className="h-5 w-5 text-indigo-400" /> Back Data Notaris — ZIP Exporter
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Semua formulir yang telah diisi klien via portal publik tersimpan di sini. Notaris & Admin dapat mengunduh seluruh berkas dalam satu file ZIP terkompresi — tidak perlu buka link Drive satu per satu.
            </p>
          </div>
          <a
            href="/form"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Buka Form Klien (/form)</span>
          </a>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
          <p className="text-2xl font-black text-indigo-600">{submissions.length}</p>
          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Total Submission</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
          <p className="text-2xl font-black text-emerald-600">{totalFiles}</p>
          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Total Berkas</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
          <p className="text-2xl font-black text-amber-500">{submissions.filter(s => s.status === 'SUBMITTED').length}</p>
          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Menunggu Proses</p>
        </div>
      </div>

      {/* Submission Cards */}
      <div className="space-y-3">
        {submissions.map((sub) => {
          const badge = FORM_TYPE_BADGE[sub.formType];
          const isExpanded = expandedId === sub.id;
          const isDownloading = downloadingId === sub.id;

          return (
            <div key={sub.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* Card Header */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-xs text-indigo-600">{sub.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {sub.slaDays} Hari SLA
                      </span>
                    </div>
                    <p className="font-black text-sm text-slate-900 mt-0.5">{sub.companyName}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{sub.clientName}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{sub.submittedAt}</span>
                      <span className="flex items-center gap-1"><FileCheck className="h-3 w-3" />{sub.uploadedFiles.length} berkas</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    {isExpanded ? 'Tutup' : 'Lihat Detail'}
                  </button>
                  <button
                    onClick={() => handleExportZipForNotary(sub)}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{isDownloading ? 'Mengunduh...' : 'Download ZIP'}</span>
                  </button>
                </div>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-4">
                  {/* Client Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400 font-semibold uppercase tracking-wider text-[9px] mb-0.5">Email</p>
                      <p className="font-bold text-slate-800">{sub.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase tracking-wider text-[9px] mb-0.5">WhatsApp</p>
                      <p className="font-bold text-slate-800">{sub.phone}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase tracking-wider text-[9px] mb-0.5">Deadline SLA</p>
                      <p className="font-bold text-rose-600">{sub.slaDeadline}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase tracking-wider text-[9px] mb-0.5">Status</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                        {sub.status === 'SUBMITTED' ? 'Menunggu Proses' : sub.status}
                      </span>
                    </div>
                  </div>

                  {/* Credentials */}
                  {(sub.ossEmail || sub.coretaxPassword || sub.ahuUser) && (
                    <div className="rounded-xl bg-white border border-slate-200 p-3">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 text-rose-500" /> Kredensial Portal (Confidential)
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        {sub.ossEmail && <div><span className="text-slate-400">OSS Email: </span><strong>{sub.ossEmail}</strong></div>}
                        {sub.ossPassword && <div><span className="text-slate-400">OSS Pass: </span><strong className="font-mono">{sub.ossPassword}</strong></div>}
                        {sub.coretaxPassword && <div><span className="text-slate-400">Coretax: </span><strong className="font-mono">{sub.coretaxPassword}</strong></div>}
                      </div>
                    </div>
                  )}

                  {/* Agendas */}
                  {sub.selectedAgendas.length > 0 && (
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Agenda Perubahan</p>
                      <div className="flex flex-wrap gap-1.5">
                        {sub.selectedAgendas.map(a => (
                          <span key={a} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">{a}</span>
                        ))}
                      </div>
                      {sub.rincianPerubahan && (
                        <p className="mt-2 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg p-2.5 italic">
                          "{sub.rincianPerubahan}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Uploaded Files */}
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Berkas Terunggah ({sub.uploadedFiles.length})</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sub.uploadedFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-800 truncate">{f.name}</p>
                            <p className="text-[9px] text-slate-400">{f.category} · {f.size}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

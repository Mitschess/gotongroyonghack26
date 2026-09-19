'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Send,
  Upload,
  ChevronRight,
  Info,
  HelpCircle,
  FileCheck2
} from 'lucide-react';

export type PublicLegalFormType = 
  | 'PENDIRIAN_PT' 
  | 'PENDIRIAN_CV' 
  | 'PENDIRIAN_PT_PERORANGAN' 
  | 'PERUBAHAN_PT' 
  | 'PERUBAHAN_CV' 
  | 'PERUBAHAN_PT_PERORANGAN' 
  | 'RUPS_TAHUNAN';

export default function StandalonePublicFormPage() {
  const [selectedFormType, setSelectedFormType] = useState<PublicLegalFormType>('PENDIRIAN_PT');
  
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
  const [submissionId, setSubmissionId] = useState('');

  const getFormSlaInfo = (type: PublicLegalFormType) => {
    switch(type) {
      case 'PENDIRIAN_PT':
      case 'PENDIRIAN_CV':
      case 'PERUBAHAN_PT':
      case 'PERUBAHAN_CV':
        return '7 Hari Total SLA (Batas Operasional Mon-Sat 09:00-20:00 WIB)';
      case 'PENDIRIAN_PT_PERORANGAN':
      case 'PERUBAHAN_PT_PERORANGAN':
        return '2 Hari Express Max SLA (Batas Operasional Mon-Sat 09:00-20:00 WIB)';
      case 'RUPS_TAHUNAN':
        return '5 Hari SLA Max (Batas Operasional Mon-Sat 09:00-20:00 WIB)';
      default:
        return '7 Hari SLA Max';
    }
  };

  const handleAgendaToggle = (agenda: string) => {
    setSelectedAgendas(prev => 
      prev.includes(agenda) ? prev.filter(a => a !== agenda) : [...prev, agenda]
    );
  };

  const handleFileUploadSim = (category: string) => {
    const newFile = {
      name: `${category.replace(/[^a-zA-Z0-9]/g, '_')}_Dokumen.pdf`,
      category,
      size: `${(Math.random() * 2 + 0.6).toFixed(1)} MB`
    };
    setUploadedFiles(prev => [...prev.filter(f => f.category !== category), newFile]);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedId = `SUB-2026-${Math.floor(Math.random() * 9000 + 1000)}`;
    setSubmissionId(generatedId);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmittedSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 700);
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
    <div className="min-h-screen bg-[#f0f4f9] text-slate-800 font-sans antialiased py-8 px-4 selection:bg-purple-500 selection:text-white">
      <div className="max-w-2xl mx-auto space-y-4">
        
        {/* Google Forms Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          {/* Top Accent Color Bar */}
          <div className="h-3 bg-purple-700" />
          
          <div className="p-6 sm:p-8 space-y-4">
            <h1 className="text-2xl sm:text-3xl font-normal text-slate-900 tracking-tight">
              Form Legalitas Klien & Exporter Notaris ZIP
            </h1>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              Portal input berkas terstruktur untuk Pendirian/Perubahan PT, CV, PT Perorangan, dan RUPS Tahunan dengan otomatisasi pengunduhan ZIP bundle untuk Notaris.
            </p>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-purple-700">
                <Clock className="h-4 w-4" /> Operational: Mon - Sat 09:00 - 20:00 WIB (Sunday Closed)
              </span>
              <span className="text-slate-400 font-medium">* Menunjukkan pertanyaan wajib diisi</span>
            </div>
          </div>
        </div>

        {isSubmittedSuccess ? (
          /* Google Forms Response Recorded Card */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 text-left space-y-6">
            <div className="h-3 bg-purple-700 -mx-8 -mt-8 mb-6 rounded-t-2xl" />
            <h2 className="text-2xl font-normal text-slate-900">Formulir Legalitas Terkirim</h2>
            <p className="text-sm text-slate-600">
              Tanggapan dan berkas Anda telah berhasil direkam dalam sistem LexiFlow Notary Hub.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 font-mono text-xs text-slate-700">
              ID Registrasi: <strong className="text-purple-700">{submissionId}</strong>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsSubmittedSuccess(false);
                  setUploadedFiles([]);
                  setSelectedAgendas([]);
                }}
                className="text-sm font-medium text-purple-700 hover:text-purple-900 underline cursor-pointer"
              >
                Kirim tanggapan lain
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitForm} className="space-y-4">
            
            {/* Question Card 1: Pilih Layanan Legalitas */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <div className="space-y-1">
                <label className="text-base font-medium text-slate-900 block">
                  Pilih Layanan Legalitas <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-500">Pilih salah satu jenis pengurusan legalitas yang dibutuhkan.</p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { id: 'PENDIRIAN_PT', label: 'Pendirian PT (SLA Total 7 Hari)' },
                  { id: 'PENDIRIAN_CV', label: 'Pendirian CV (SLA Total 7 Hari)' },
                  { id: 'PENDIRIAN_PT_PERORANGAN', label: 'Pendirian PT Perorangan (SLA Max 2 Hari Express)' },
                  { id: 'PERUBAHAN_PT', label: 'Perubahan PT (SLA Total 7 Hari)' },
                  { id: 'PERUBAHAN_CV', label: 'Perubahan CV (SLA Total 7 Hari)' },
                  { id: 'PERUBAHAN_PT_PERORANGAN', label: 'Perubahan PT Perorangan (SLA Max 2 Hari Express)' },
                  { id: 'RUPS_TAHUNAN', label: 'RUPS Tahunan (SLA Max 5 Hari)' },
                ].map((item) => (
                  <label 
                    key={item.id} 
                    className="flex items-center gap-3 text-sm text-slate-800 cursor-pointer select-none py-1 hover:text-purple-900"
                  >
                    <input
                      type="radio"
                      name="legalFormType"
                      checked={selectedFormType === item.id}
                      onChange={() => setSelectedFormType(item.id as PublicLegalFormType)}
                      className="h-4 w-4 text-purple-700 focus:ring-purple-500 border-slate-300"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question Card 2: Data Pemohon */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-medium text-slate-900">Identitas Klien & Perusahaan</h3>
                <p className="text-xs text-slate-500">Masukkan kontak resmi pemohon</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1.5">
                    Nama Pemohon / Klien <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jawaban Anda"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full border-b-2 border-slate-200 focus:border-purple-700 py-2 text-sm text-slate-900 bg-transparent outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1.5">
                    Nama Perusahaan / PT / CV <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jawaban Anda"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full border-b-2 border-slate-200 focus:border-purple-700 py-2 text-sm text-slate-900 bg-transparent outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1.5">
                    Email Contact <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Jawaban Anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-b-2 border-slate-200 focus:border-purple-700 py-2 text-sm text-slate-900 bg-transparent outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1.5">
                    No. WhatsApp Aktif <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jawaban Anda"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border-b-2 border-slate-200 focus:border-purple-700 py-2 text-sm text-slate-900 bg-transparent outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Question Card 3: Agenda Perubahan (If Perubahan) */}
            {selectedFormType.includes('PERUBAHAN') && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
                <div className="space-y-1">
                  <label className="text-base font-medium text-slate-900 block">
                    Agenda Perubahan PT/CV <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-500">Pilih satu atau lebih agenda perubahan yang diinginkan.</p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {(selectedFormType === 'PERUBAHAN_PT' ? perubahPTAgendas : perubahanCVAgendas).map((item) => {
                    const isChecked = selectedAgendas.includes(item);
                    return (
                      <label 
                        key={item} 
                        className="flex items-center gap-3 text-sm text-slate-800 cursor-pointer select-none py-1 hover:text-purple-900"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleAgendaToggle(item)}
                          className="h-4 w-4 rounded text-purple-700 focus:ring-purple-500 border-slate-300"
                        />
                        <span>{item}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="pt-4">
                  <label className="block text-sm font-medium text-slate-800 mb-1.5">
                    Rincian Perubahan (Deskripsikan detailnya) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Jawaban Anda"
                    value={rincianPerubahan}
                    onChange={(e) => setRincianPerubahan(e.target.value)}
                    className="w-full border-b-2 border-slate-200 focus:border-purple-700 py-2 text-sm text-slate-900 bg-transparent outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Question Card 4: Kredensial Portal (If Perubahan / PT Perorangan) */}
            {(selectedFormType.includes('PERUBAHAN') || selectedFormType === 'RUPS_TAHUNAN') && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-medium text-slate-900">Kredensial Akun Portal Pemerintah</h3>
                  <p className="text-xs text-slate-500">Digunakan oleh Notaris untuk akses OSS & Coretax</p>
                </div>

                <div className="space-y-4">
                  {selectedFormType === 'PERUBAHAN_PT_PERORANGAN' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-800 mb-1">User Akun AHU Online</label>
                        <input
                          type="text"
                          placeholder="Jawaban Anda"
                          value={ahuUser}
                          onChange={(e) => setAhuUser(e.target.value)}
                          className="w-full border-b-2 border-slate-200 focus:border-purple-700 py-2 text-sm text-slate-900 bg-transparent outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-800 mb-1">Password AHU Online</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={ahuPassword}
                          onChange={(e) => setAhuPassword(e.target.value)}
                          className="w-full border-b-2 border-slate-200 focus:border-purple-700 py-2 text-sm text-slate-900 bg-transparent outline-none transition-colors"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1">Email Akun OSS PT/CV</label>
                    <input
                      type="email"
                      placeholder="Jawaban Anda"
                      value={ossEmail}
                      onChange={(e) => setOssEmail(e.target.value)}
                      className="w-full border-b-2 border-slate-200 focus:border-purple-700 py-2 text-sm text-slate-900 bg-transparent outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1">Password Akun OSS PT/CV</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={ossPassword}
                      onChange={(e) => setOssPassword(e.target.value)}
                      className="w-full border-b-2 border-slate-200 focus:border-purple-700 py-2 text-sm text-slate-900 bg-transparent outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1">Password Coretax DJP PT</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={coretaxPassword}
                      onChange={(e) => setCoretaxPassword(e.target.value)}
                      className="w-full border-b-2 border-slate-200 focus:border-purple-700 py-2 text-sm text-slate-900 bg-transparent outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Question Card 5: Unggah Berkas Persyaratan */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <div className="space-y-1">
                <label className="text-base font-medium text-slate-900 block">
                  Unggah Berkas Persyaratan <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-500">Unggah file PDF KTP, NPWP, Akta, dan SK terkait.</p>
              </div>

              <div className="space-y-3 pt-2">
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
                    <div key={docLabel} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{docLabel}</p>
                        {uploaded ? (
                          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="h-3.5 w-3.5" /> {uploaded.name}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 mt-0.5">Belum ada file dipilih</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFileUploadSim(docLabel)}
                        className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-purple-700 text-purple-700 font-medium text-xs shadow-xs shrink-0 transition-all flex items-center gap-1.5"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>{uploaded ? 'Ganti File' : 'Tambahkan file'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions: Submit & Clear */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-medium text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Mengirimkan...</span>
                ) : (
                  <span>Kirim</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setClientName('');
                  setCompanyName('');
                  setEmail('');
                  setPhone('');
                  setUploadedFiles([]);
                  setSelectedAgendas([]);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                Kosongkan formulir
              </button>
            </div>

          </form>
        )}

        {/* Footer */}
        <div className="text-center pt-4 text-xs text-slate-400">
          Formulir ini dibuat dengan LexiFlow Legal OS Notary Hub.
        </div>
      </div>
    </div>
  );
}

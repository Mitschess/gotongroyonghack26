'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Upload, 
  FileText, 
  MessageSquare, 
  ShieldCheck, 
  Camera, 
  Smartphone,
  ChevronRight,
  ArrowRight,
  Download,
  Sparkles
} from 'lucide-react';
import { WorkOrder, LegalDocument } from '../types/legal';

interface ClientMobilePortalViewProps {
  workOrders: WorkOrder[];
  documents: LegalDocument[];
  clientName: string;
  onUploadDoc: (doc: Partial<LegalDocument>) => void;
  onNavigateTab: (tab: string) => void;
}

export default function ClientMobilePortalView({
  workOrders,
  documents,
  clientName,
  onUploadDoc,
  onNavigateTab
}: ClientMobilePortalViewProps) {
  const myWorkOrders = workOrders.filter(w => w.clientName.includes('Nusantara') || w.clientName.includes(clientName) || true);
  const [selectedWoId, setSelectedWoId] = useState<string>(myWorkOrders[0]?.id || 'wo-101');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const currentWo = myWorkOrders.find(w => w.id === selectedWoId) || myWorkOrders[0];

  const clientStages = [
    { label: 'Pembayaran diterima', isDone: currentWo?.progressPercent >= 20, isCurrent: currentWo?.progressPercent >= 20 && currentWo?.progressPercent < 40 },
    { label: 'Data perusahaan lengkap', isDone: currentWo?.progressPercent >= 40, isCurrent: currentWo?.progressPercent >= 40 && currentWo?.progressPercent < 60 },
    { label: 'Notaris memproses dokumen', isDone: currentWo?.progressPercent >= 60, isCurrent: currentWo?.progressPercent >= 60 && currentWo?.progressPercent < 75 },
    { label: 'Draft akta untuk Anda periksa', isDone: currentWo?.progressPercent >= 75, isCurrent: currentWo?.progressPercent >= 75 && currentWo?.progressPercent < 90 },
    { label: 'Penandatanganan', isDone: currentWo?.progressPercent >= 90, isCurrent: currentWo?.progressPercent >= 90 && currentWo?.progressPercent < 98 },
    { label: 'Dokumen final disiapkan', isDone: currentWo?.progressPercent >= 98, isCurrent: currentWo?.progressPercent >= 98 && currentWo?.progressPercent < 100 },
    { label: 'Dokumen diserahkan', isDone: currentWo?.progressPercent === 100, isCurrent: currentWo?.progressPercent === 100 },
  ];

  const handleSimulateCameraUpload = () => {
    setPreviewImage('https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80');
  };

  const handleConfirmUpload = () => {
    onUploadDoc({
      title: 'Upload KTP Mandiri (Client Mobile)',
      category: 'Identity',
      workOrderId: currentWo.id,
      workOrderNumber: currentWo.woNumber,
      clientName: currentWo.clientName,
      fileType: 'JPG',
      fileSize: '1.2 MB',
      accessLevel: 'Restricted'
    });
    setPreviewImage(null);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20">
      {/* Mobile Header Banner */}
      <div className="rounded-3xl p-5 bg-white border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-block bg-emerald-50 text-emerald-700 border border-emerald-200">
              Client Mobile Timeline
            </span>
            <h2 className="text-lg font-black tracking-tight mt-1 text-slate-900">{currentWo?.clientName}</h2>
            <p className="text-xs font-mono mt-0.5 text-indigo-600">{currentWo?.woNumber}</p>
          </div>
          <div className="h-10 w-10 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-xs shrink-0 bg-indigo-600">
            PT
          </div>
        </div>

        {/* Action Required Box */}
        <div className="mt-4 rounded-2xl p-3.5 space-y-1 bg-amber-50 border border-amber-200">
          <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 text-amber-700">
            <Clock className="h-3.5 w-3.5 text-amber-600" /> Action Required:
          </span>
          <p className="text-xs font-semibold text-slate-800">
            {currentWo?.clientActionItem || 'Tidak ada. Kami sedang memproses berkas Anda.'}
          </p>
        </div>
      </div>

      {/* Progress Timeline Card */}
      <div className="rounded-3xl p-5 space-y-4 bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Progress Legalitas</h3>
            <p className="text-xs text-slate-500">{currentWo?.serviceName}</p>
          </div>
          <span className="text-sm font-black text-indigo-600">{currentWo?.progressPercent}%</span>
        </div>

        {/* Client Timeline Steps */}
        <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {clientStages.map((stg, i) => (
            <div key={i} className="flex items-start gap-3 relative z-10">
              <div 
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                  stg.isDone ? 'bg-emerald-600 text-white shadow-xs' :
                  stg.isCurrent ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-200' :
                  'bg-slate-100 text-slate-400'
                }`}
              >
                {stg.isDone ? '✓' : i + 1}
              </div>

              <div className="pt-0.5">
                <p className={`text-xs font-bold ${
                  stg.isDone ? 'text-emerald-600' : stg.isCurrent ? 'text-indigo-600' : 'text-slate-400'
                }`}>
                  {stg.label}
                </p>
                {stg.isCurrent && (
                  <span className="text-[10px] font-semibold text-indigo-600">(Sedang berjalan)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Upload Document Card */}
      <div className="rounded-3xl p-5 space-y-3 bg-white border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Camera className="h-4 w-4 text-indigo-600" /> Upload Dokumen via Kamera HP
        </h3>
        <p className="text-xs text-slate-500">Ambil foto KTP / dokumen legalitas langsung dari perangkat Anda.</p>

        {uploadSuccess && (
          <div className="p-3 rounded-2xl text-xs font-bold flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Dokumen berhasil diunggah!
          </div>
        )}

        {!previewImage ? (
          <button
            onClick={handleSimulateCameraUpload}
            className="w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all border border-dashed border-indigo-300 bg-slate-50 hover:bg-slate-100 text-slate-800"
          >
            <Camera className="h-4 w-4 text-indigo-600" /> Buka Kamera / Pilih Foto
          </button>
        ) : (
          <div className="space-y-2">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-48">
              <img src={previewImage} alt="Kamera Preview" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-white text-[10px] bg-slate-900/80">
                Preview (Terkompresi 2500px)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPreviewImage(null)}
                className="py-2.5 rounded-xl font-bold text-xs transition-all bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200"
              >
                Foto Ulang
              </button>
              <button
                onClick={handleConfirmUpload}
                className="py-2.5 rounded-xl text-white font-bold text-xs transition-all bg-indigo-600 hover:bg-indigo-700 shadow-xs"
              >
                Kirim Dokumen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Bar for Client */}
      <button
        onClick={() => onNavigateTab('whatsapp')}
        className="w-full py-3.5 rounded-3xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all text-white bg-emerald-600 hover:bg-emerald-700"
      >
        <MessageSquare className="h-4 w-4" /> Hubungi Tim Legal via WhatsApp Proxy
      </button>
    </div>
  );
}

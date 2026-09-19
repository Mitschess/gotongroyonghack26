'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Clock, 
  Tag, 
  FileCheck, 
  Layers, 
  X, 
  CheckCircle2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Service, Client, UserRole } from '../types/legal';

interface ServicesViewProps {
  services: Service[];
  clients: Client[];
  userRole?: UserRole;
  currentUserId?: string;
  onAddService: (newService: Partial<Service>) => void;
  onRequestServiceSubmit: (clientId: string, serviceId: string, description: string) => void;
}

export default function ServicesView({
  services,
  clients,
  userRole,
  currentUserId,
  onAddService,
  onRequestServiceSubmit
}: ServicesViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedServiceForRequest, setSelectedServiceForRequest] = useState<Service | null>(null);

  // New Service Form state
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceDays, setNewServiceDays] = useState(14);
  const [newServicePrice, setNewServicePrice] = useState(5000000);
  const [newServiceReqDocs, setNewServiceReqDocs] = useState('KTP, NPWP, Surat Sewa Kantor');

  // Request Service Form state
  const [requestClientId, setRequestClientId] = useState('');
  const [requestNotes, setRequestNotes] = useState('');

  const handleCreateServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName) return;

    onAddService({
      serviceCode: `SRV-${Date.now().toString().slice(-4)}`,
      name: newServiceName,
      description: newServiceDesc,
      estimatedDays: Number(newServiceDays),
      price: Number(newServicePrice),
      requiredDocuments: newServiceReqDocs.split(',').map(s => s.trim()),
      status: 'Active',
      workflowStages: [
        { id: 'stg-a', name: 'Permintaan & Verifikasi Berkas', description: 'Cek awal berkas pendukung', order: 1 },
        { id: 'stg-b', name: 'Pemrosesan Dokumen Notaris / Kemenkumham', description: 'Pengurusan legalitas formal', order: 2 },
        { id: 'stg-c', name: 'Pemeriksaan Final & Serah Terima', description: 'Review supervisor dan pengiriman', order: 3 }
      ]
    });

    setShowAddModal(false);
    setNewServiceName('');
    setNewServiceDesc('');
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestClientId || !selectedServiceForRequest) return;

    onRequestServiceSubmit(requestClientId, selectedServiceForRequest.id, requestNotes);
    setShowRequestModal(false);
    setRequestClientId('');
    setRequestNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-500" /> Katalog Layanan Legalitas Perusahaan
          </h2>
          <p className="text-xs text-slate-500">Definisi estimasi waktu, workflow standar, biaya, dan persyaratan dokumen (FR-08)</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Tambah Jenis Layanan Baru
        </button>
      </div>

      {/* Services Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{service.serviceCode}</span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-500">
                  {service.status}
                </span>
              </div>

              <h3 className="mt-3 text-lg font-extrabold text-slate-900 dark:text-slate-100">{service.name}</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{service.description}</p>

              {/* Price & Duration Badges */}
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                  <Clock className="h-4 w-4 text-indigo-500" /> Est: {service.estimatedDays} Hari Kerja
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <Tag className="h-4 w-4" /> Rp {service.price.toLocaleString('id-ID')}
                </div>
              </div>

              {/* Required Documents */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <FileCheck className="h-3.5 w-3.5 text-indigo-500" /> Dokumen Persyaratan:
                </h4>
                <ul className="mt-2 grid grid-cols-2 gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {service.requiredDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> {doc}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Workflow Stages Timeline Preview */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-2">
                  <Layers className="h-3.5 w-3.5 text-indigo-500" /> Standard Workflow Stages ({service.workflowStages.length} Tahap):
                </h4>
                <div className="space-y-1 text-xs">
                  {service.workflowStages.map((st) => (
                    <div key={st.id} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {st.order}
                      </span>
                      <span>{st.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setSelectedServiceForRequest(service);
                  setShowRequestModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 text-xs shadow-md transition-all"
              >
                Buat Permintaan Layanan (Service Request FR-09)
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create New Service (FR-08) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Tambah Jenis Layanan Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateServiceSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Layanan Legalitas:</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Pendaftaran Paten & Inovasi"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi:</label>
                <textarea
                  rows={2}
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Est. Hari Kerja:</label>
                  <input
                    type="number"
                    value={newServiceDays}
                    onChange={(e) => setNewServiceDays(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Estimasi Tarif (Rp):</label>
                  <input
                    type="number"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Persyaratan Dokumen (pisahkan koma):</label>
                <input
                  type="text"
                  value={newServiceReqDocs}
                  onChange={(e) => setNewServiceReqDocs(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border px-4 py-2 font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 text-white px-5 py-2 font-bold shadow-md"
                >
                  Simpan Layanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Service Request (FR-09) */}
      {showRequestModal && selectedServiceForRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Permintaan Layanan (Service Request)</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-3 border border-indigo-500/20">
                <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">Layanan Dipilih:</p>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{selectedServiceForRequest.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Biaya: Rp {selectedServiceForRequest.price.toLocaleString('id-ID')}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Klien / Perusahaan:</label>
                <select
                  required
                  value={requestClientId}
                  onChange={(e) => setRequestClientId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                >
                  <option value="">-- Pilih Klien Pemohon --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Tambahan / Deskripsi Kebutuhan:</label>
                <textarea
                  rows={3}
                  placeholder="Deskripsikan kebutuhan khusus klien..."
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="rounded-xl border px-4 py-2 font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 text-white px-5 py-2 font-bold shadow-md"
                >
                  Kirim Permintaan Layanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

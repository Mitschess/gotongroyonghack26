'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  FileText, 
  FolderKanban, 
  X, 
  ExternalLink,
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { Client, ClientType, WorkOrder, LegalDocument } from '../types/legal';
import ClientDocumentDrawer from './ClientDocumentDrawer';

interface ClientsViewProps {
  clients: Client[];
  workOrders: WorkOrder[];
  documents: LegalDocument[];
  onAddClient: (newClient: Partial<Client>) => void;
  onSelectWorkOrder: (wo: WorkOrder) => void;
  onSendWhatsappMessage?: (msg: any) => void;
  onUploadDocument?: (doc: Partial<LegalDocument>) => void;
}

export default function ClientsView({
  clients,
  workOrders,
  documents,
  onAddClient,
  onSelectWorkOrder,
  onSendWhatsappMessage,
  onUploadDocument
}: ClientsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [drawerClient, setDrawerClient] = useState<Client | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formState, setFormState] = useState({
    name: '',
    type: 'PT' as ClientType,
    picName: '',
    picPhone: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.clientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.picName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email) return;

    onAddClient({
      name: formState.name,
      companyName: formState.name,
      type: formState.type,
      picName: formState.picName,
      picPhone: formState.picPhone,
      email: formState.email,
      phone: formState.phone,
      address: formState.address,
      notes: formState.notes,
      status: 'Active',
      createdAt: '2026-09-19'
    });

    setShowAddModal(false);
    setFormState({ name: '', type: 'PT', picName: '', picPhone: '', email: '', phone: '', address: '', notes: '' });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" /> Manajemen Klien & Profil Perusahaan
          </h2>
          <p className="text-xs text-slate-500">Database terpusat klien PT, CV, PMA, dan perorangan</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Registrasi Klien Baru
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px] px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama klien, ID, email, atau nama PIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <Filter className="h-3.5 w-3.5" /> Jenis Klien:
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
          >
            <option value="all">Semua Tipe</option>
            <option value="PT">PT (Perseroan Terbatas)</option>
            <option value="CV">CV (Commanditaire Vennootschap)</option>
            <option value="PMA">PMA (Foreign Investment)</option>
            <option value="Perorangan">Perorangan</option>
          </select>
        </div>
      </div>

      {/* Client Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const clientWoList = workOrders.filter(w => w.clientId === client.id);
          const clientDocList = documents.filter(d => d.clientId === client.id);

          return (
            <div
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-all hover:border-indigo-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-600">{client.clientCode}</span>
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700 border border-indigo-100">
                    {client.type}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {client.name}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <p className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-indigo-600" /> PIC: <strong className="text-slate-800">{client.picName}</strong> ({client.picPhone})
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" /> {client.email}
                  </p>
                  <p className="flex items-center gap-2 line-clamp-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> {client.address}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <FolderKanban className="h-3.5 w-3.5 text-indigo-600" /> {clientWoList.length} Project Active
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <FileText className="h-3.5 w-3.5" /> {clientDocList.length} Dokumen
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Client Profile Detail Modal (FR-06) */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-lg">
                  {selectedClient.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{selectedClient.clientCode}</span>
                    <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-500">{selectedClient.type}</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{selectedClient.name}</h3>
                </div>
              </div>

              <button onClick={() => setSelectedClient(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100">Informasi Kontak & PIC</h4>
                <p><strong>PIC:</strong> {selectedClient.picName} ({selectedClient.picPhone})</p>
                <p><strong>Email:</strong> {selectedClient.email}</p>
                <p><strong>Telepon Kantor:</strong> {selectedClient.phone}</p>
                <p><strong>Alamat Domisili:</strong> {selectedClient.address}</p>
              </div>

              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100">Catatan Khusus Klien</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{selectedClient.notes}</p>
                <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                  Terdaftar sejak: {selectedClient.createdAt}
                </p>
              </div>
            </div>

            {/* Client Projects List */}
            <div className="mt-6">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                Daftar Project Legalitas Klien ({workOrders.filter(w => w.clientId === selectedClient.id).length})
              </h4>
              <div className="space-y-2">
                {workOrders.filter(w => w.clientId === selectedClient.id).map((wo) => (
                  <div
                    key={wo.id}
                    onClick={() => {
                      setSelectedClient(null);
                      onSelectWorkOrder(wo);
                    }}
                    className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{wo.woNumber}</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{wo.serviceName}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Deadline: {wo.deadline} • PIC: {wo.picStaffName}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-indigo-500/10 text-indigo-500 px-2.5 py-0.5 text-[10px] font-bold">
                        {wo.status}
                      </span>
                      <ExternalLink className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal (FR-05) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Registrasi Klien Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Perusahaan / Klien:</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: PT Nusantara Cloud Terpadu"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jenis Klien:</label>
                  <select
                    value={formState.type}
                    onChange={(e) => setFormState({ ...formState, type: e.target.value as ClientType })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                  >
                    <option value="PT">PT (Perseroan Terbatas)</option>
                    <option value="CV">CV (Commanditaire Vennootschap)</option>
                    <option value="PMA">PMA (Foreign Investment)</option>
                    <option value="Perorangan">Perorangan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Perusahaan:</label>
                  <input
                    type="email"
                    required
                    placeholder="email@perusahaan.com"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama PIC:</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap PIC"
                    value={formState.picName}
                    onChange={(e) => setFormState({ ...formState, picName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">No. HP / WA PIC:</label>
                  <input
                    type="text"
                    required
                    placeholder="0812-xxxx-xxxx"
                    value={formState.picPhone}
                    onChange={(e) => setFormState({ ...formState, picPhone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Kantor:</label>
                <textarea
                  rows={2}
                  value={formState.address}
                  onChange={(e) => setFormState({ ...formState, address: e.target.value })}
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
                  Simpan Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

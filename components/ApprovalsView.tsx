'use client';

import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  UserCheck, 
  MessageSquare, 
  Check, 
  X,
  History
} from 'lucide-react';
import { ApprovalRequest, ApprovalStatus, UserRole } from '../types/legal';

interface ApprovalsViewProps {
  approvals: ApprovalRequest[];
  userRole: UserRole;
  currentUserName: string;
  onDecisionSubmit: (approvalId: string, status: ApprovalStatus, comments: string) => void;
}

export default function ApprovalsView({
  approvals,
  userRole,
  currentUserName,
  onDecisionSubmit
}: ApprovalsViewProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [comments, setComments] = useState('');

  const filteredApprovals = approvals.filter(a => {
    return statusFilter === 'all' || a.status === statusFilter;
  });

  const isManagerOrAdmin = userRole === 'Manager/Supervisor' || userRole === 'Super Admin';

  const handleAction = (status: ApprovalStatus) => {
    if (!selectedApproval) return;
    onDecisionSubmit(selectedApproval.id, status, comments || (status === 'Approved' ? 'Disetujui.' : 'Perlu revisi.'));
    setSelectedApproval(null);
    setComments('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-indigo-500" /> Pusat Persetujuan & Hirarki (Approval Management)
          </h2>
          <p className="text-xs text-slate-500">Review dokumen, verifikasi perizinan, dan persetujuan transisi tahap WO (FR-22 s.d. FR-24)</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl">
          <Clock className="h-4 w-4 text-amber-500" />
          <span>Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved (Disetujui)</option>
            <option value="Rejected">Rejected (Ditolak)</option>
            <option value="Revision Required">Revision Required</option>
          </select>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Req Number</th>
                <th className="py-3.5 px-4">Judul Work Order</th>
                <th className="py-3.5 px-4">Tipe Approval</th>
                <th className="py-3.5 px-4">Pemohon Staff</th>
                <th className="py-3.5 px-4">Waktu Pengajuan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredApprovals.map((app) => {
                const statusBadge = {
                  Pending: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
                  Approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
                  Rejected: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
                  'Revision Required': 'bg-purple-500/10 text-purple-500 border-purple-500/30'
                }[app.status];

                return (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{app.requestNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{app.workOrderTitle}</td>
                    <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">{app.type}</td>
                    <td className="py-3 px-4">{app.requestedBy}</td>
                    <td className="py-3 px-4 text-slate-500">{app.requestedAt}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${statusBadge}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {app.status === 'Pending' ? (
                        <button
                          onClick={() => setSelectedApproval(app)}
                          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 font-bold text-xs shadow-sm transition-all"
                        >
                          Review & Keputusan
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedApproval(app)}
                          className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1 font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                        >
                          Lihat History
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision / History Modal Drawer */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-500">{selectedApproval.requestNumber}</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Review Pengajuan Approval</h3>
              </div>
              <button onClick={() => setSelectedApproval(null)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <p><strong>Work Order:</strong> {selectedApproval.workOrderTitle} ({selectedApproval.workOrderNumber})</p>
                <p><strong>Tipe Persetujuan:</strong> {selectedApproval.type}</p>
                <p><strong>Diminta oleh:</strong> {selectedApproval.requestedBy} ({selectedApproval.requestedAt})</p>
                <p className="pt-2 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                  <strong>Catatan Pemohon:</strong> "{selectedApproval.notes}"
                </p>
              </div>

              {selectedApproval.status !== 'Pending' ? (
                /* Display Decision History (FR-24) */
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-2">
                  <h4 className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <History className="h-4 w-4" /> History Keputusan Supervisor
                  </h4>
                  <p><strong>Status Akhir:</strong> {selectedApproval.status}</p>
                  <p><strong>Approver:</strong> {selectedApproval.approverName}</p>
                  <p><strong>Waktu Keputusan:</strong> {selectedApproval.decisionDate}</p>
                  <p><strong>Komentar Supervisor:</strong> "{selectedApproval.decisionComments}"</p>
                </div>
              ) : (
                /* Manager Decision Form */
                <div className="space-y-3 pt-2">
                  {!isManagerOrAdmin && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                      ⚠️ Catatan: Hanya role <strong>Manager/Supervisor</strong> atau <strong>Super Admin</strong> yang memiliki hak akses mengambil keputusan persetujuan. (Anda dapat mengubah role pada header).
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Komentar / Instruksi Supervisor:</label>
                    <textarea
                      rows={3}
                      placeholder="Tuliskan alasan persetujuan atau catatan perbaikan..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <button
                      onClick={() => handleAction('Approved')}
                      className="flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 text-xs shadow-sm"
                    >
                      <Check className="h-4 w-4" /> Disetujui
                    </button>
                    <button
                      onClick={() => handleAction('Revision Required')}
                      className="flex items-center justify-center gap-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 text-xs shadow-sm"
                    >
                      Minta Revisi
                    </button>
                    <button
                      onClick={() => handleAction('Rejected')}
                      className="flex items-center justify-center gap-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 text-xs shadow-sm"
                    >
                      <X className="h-4 w-4" /> Tolak
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

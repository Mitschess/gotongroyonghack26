'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Download, 
  FileText, 
  X,
  Building2
} from 'lucide-react';
import { Invoice, InvoiceStatus, Client, WorkOrder, User } from '../types/legal';
import { scopeInvoices, canManageFinance } from '../lib/iam';

interface FinanceViewProps {
  invoices: Invoice[];
  clients: Client[];
  workOrders: WorkOrder[];
  currentUser: User;
  onAddInvoice: (newInvoice: Partial<Invoice>) => void;
  onRecordPayment: (invoiceId: string, amount: number, method: string) => void;
}

export default function FinanceView({
  invoices,
  clients,
  workOrders,
  currentUser,
  onAddInvoice,
  onRecordPayment
}: FinanceViewProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // New Invoice Form
  const [clientId, setClientId] = useState('');
  const [workOrderId, setWorkOrderId] = useState('');
  const [amount, setAmount] = useState(5000000);
  const [dueDate, setDueDate] = useState('2026-10-01');

  // Payment Form
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('Transfer Bank BCA');

  // IAM Scoped Invoices
  const scopedInvoices = scopeInvoices(invoices, currentUser);

  const filteredInvoices = scopedInvoices.filter(inv => {
    return statusFilter === 'all' || inv.status === statusFilter;
  });

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalUnpaid = totalInvoiced - totalPaid;

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !workOrderId) return;

    const client = clients.find(c => c.id === clientId);
    const wo = workOrders.find(w => w.id === workOrderId);

    const tax = amount * 0.11; // 11% PPN

    onAddInvoice({
      clientId,
      clientName: client?.name || 'Client',
      workOrderId,
      workOrderNumber: wo?.woNumber || 'WO-2026-0000',
      serviceName: wo?.serviceName || 'Layanan Legalitas',
      amount,
      taxAmount: tax,
      totalAmount: amount + tax,
      paidAmount: 0,
      issueDate: '2026-09-19',
      dueDate,
      status: 'Unpaid'
    });

    setShowAddModal(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || payAmount <= 0) return;

    onRecordPayment(selectedInvoice.id, Number(payAmount), payMethod);
    setShowPaymentModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-500" /> Manajeman Keuangan & Invoicing Perizinan
          </h2>
          <p className="text-xs text-slate-500">Penerbitan tagihan, status pembayaran DP / pelunasan (FR-32 & FR-33)</p>
        </div>

        {canManageFinance(currentUser.role) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Terbitkan Invoice Baru
          </button>
        )}
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Nilai Tagihan (Total Invoiced)</p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
            Rp {totalInvoiced.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Total Pembayaran Diterima</p>
          <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            Rp {totalPaid.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <p className="text-xs font-semibold text-rose-500">Sisa Piutang Belum Lunas</p>
          <p className="mt-2 text-2xl font-black text-rose-500">
            Rp {totalUnpaid.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Filter & Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Daftar Tagihan & Invoice</h3>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="Paid">Paid (Lunas)</option>
              <option value="Partial">Partial (DP / Sebagian)</option>
              <option value="Unpaid">Unpaid (Belum Bayar)</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">No. Invoice</th>
                <th className="py-3.5 px-4">Klien</th>
                <th className="py-3.5 px-4">Work Order</th>
                <th className="py-3.5 px-4">Total Tagihan</th>
                <th className="py-3.5 px-4">Sudah Dibayar</th>
                <th className="py-3.5 px-4">Jatuh Tempo</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredInvoices.map((inv) => {
                const statusBadge = {
                  Paid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
                  Partial: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
                  Unpaid: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
                  Overdue: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
                  Cancelled: 'bg-gray-500/10 text-gray-500'
                }[inv.status];

                return (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{inv.clientName}</td>
                    <td className="py-3 px-4 font-mono">{inv.workOrderNumber}</td>
                    <td className="py-3 px-4 font-bold">Rp {inv.totalAmount.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Rp {inv.paidAmount.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{inv.dueDate}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${statusBadge}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {inv.status !== 'Paid' && (
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setPayAmount(inv.totalAmount - inv.paidAmount);
                            setShowPaymentModal(true);
                          }}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 font-bold text-xs shadow-sm"
                        >
                          + Catat Pembayaran
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

      {/* Modal: Create Invoice */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Terbitkan Invoice Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Klien:</label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                >
                  <option value="">-- Pilih Klien --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hubungkan Work Order:</label>
                <select
                  required
                  value={workOrderId}
                  onChange={(e) => setWorkOrderId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                >
                  <option value="">-- Pilih Work Order --</option>
                  {workOrders.map(w => (
                    <option key={w.id} value={w.id}>{w.woNumber} - {w.serviceName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nominal DPP (Rp):</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jatuh Tempo:</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                  />
                </div>
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
                  Terbitkan Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Payment */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Catat Pembayaran Masuk</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
                <p><strong>Invoice:</strong> {selectedInvoice.invoiceNumber}</p>
                <p><strong>Klien:</strong> {selectedInvoice.clientName}</p>
                <p><strong>Sisa Tagihan:</strong> Rp {(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toLocaleString('id-ID')}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jumlah Diterima (Rp):</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Metode Pembayaran:</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 focus:outline-none"
                >
                  <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                  <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                  <option value="Virtual Account">Virtual Account</option>
                  <option value="Tunai / Cash">Tunai / Cash</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="rounded-xl border px-4 py-2 font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 text-white px-5 py-2 font-bold shadow-md"
                >
                  Konfirmasi Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

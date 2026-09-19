'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  TrendingUp,
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X,
  ArrowUpRight,
  Banknote,
  Receipt,
  PieChart
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

// --- Mini SVG Bar Chart Component ---
function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-28 w-full">
      {data.map((d, i) => {
        const heightPct = (d.value / max) * 100;
        return (
          <div key={i} className="flex flex-col items-center flex-1 gap-1 group">
            <div className="relative w-full" style={{ height: '80px' }}>
              <div
                className="absolute bottom-0 left-0 right-0 rounded-t-md transition-all duration-700 group-hover:opacity-80"
                style={{
                  height: `${Math.max(heightPct, 4)}%`,
                  background: d.color,
                }}
              >
                <div
                  className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-slate-600 bg-white border border-slate-200 rounded px-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Rp {(d.value / 1_000_000).toFixed(1)}jt
                </div>
              </div>
            </div>
            <span className="text-[9px] font-semibold text-slate-400">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// --- SVG Donut Chart Component ---
function DonutChart({ paid, unpaid, partial }: { paid: number; unpaid: number; partial: number }) {
  const total = paid + unpaid + partial || 1;
  const paidPct = (paid / total) * 100;
  const partialPct = (partial / total) * 100;
  const unpaidPct = (unpaid / total) * 100;

  // SVG arc path helper
  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arcPath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    if (Math.abs(endAngle - startAngle) >= 360) endAngle = startAngle + 359.99;
    const s = polarToCartesian(cx, cy, r, startAngle);
    const e = polarToCartesian(cx, cy, r, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  const cx = 60, cy = 60, r = 44, strokeW = 14;
  const paidAngle = (paidPct / 100) * 360;
  const partialAngle = (partialPct / 100) * 360;

  return (
    <div className="flex items-center gap-5">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {/* Background track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeW} />
        {/* Unpaid arc (base) */}
        {unpaidPct > 0 && (
          <path
            d={arcPath(cx, cy, r, paidAngle + partialAngle, paidAngle + partialAngle + (unpaidPct / 100) * 360)}
            fill="none"
            stroke="#fda4af"
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        )}
        {/* Partial arc */}
        {partialPct > 0 && (
          <path
            d={arcPath(cx, cy, r, paidAngle, paidAngle + partialAngle)}
            fill="none"
            stroke="#fcd34d"
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        )}
        {/* Paid arc */}
        {paidPct > 0 && (
          <path
            d={arcPath(cx, cy, r, 0, paidAngle)}
            fill="none"
            stroke="#34d399"
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        )}
        {/* Center text */}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fontWeight="800" fill="#0f172a">
          {Math.round(paidPct)}%
        </text>
        <text x={cx} y={cy + 13} textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="600">
          LUNAS
        </text>
      </svg>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-slate-600 font-medium">Lunas</span>
          <span className="ml-auto font-bold text-slate-900">{Math.round(paidPct)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300 shrink-0" />
          <span className="text-slate-600 font-medium">Sebagian DP</span>
          <span className="ml-auto font-bold text-slate-900">{Math.round(partialPct)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-300 shrink-0" />
          <span className="text-slate-600 font-medium">Belum Bayar</span>
          <span className="ml-auto font-bold text-slate-900">{Math.round(unpaidPct)}%</span>
        </div>
      </div>
    </div>
  );
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

  const [clientId, setClientId] = useState('');
  const [workOrderId, setWorkOrderId] = useState('');
  const [amount, setAmount] = useState(5000000);
  const [dueDate, setDueDate] = useState('2026-10-01');
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('Transfer Bank BCA');

  const scopedInvoices = scopeInvoices(invoices, currentUser);
  const filteredInvoices = scopedInvoices.filter(inv => statusFilter === 'all' || inv.status === statusFilter);

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalUnpaid = totalInvoiced - totalPaid;
  const totalPartial = invoices.filter(i => i.status === 'Partial').reduce((sum, i) => sum + i.paidAmount, 0);

  const paidCount = invoices.filter(i => i.status === 'Paid').length;
  const partialCount = invoices.filter(i => i.status === 'Partial').length;
  const unpaidCount = invoices.filter(i => i.status === 'Unpaid' || i.status === 'Overdue').length;

  // Mock monthly revenue data derived from invoices + simulated past months
  const monthlyData = [
    { label: 'Apr', value: 8_200_000, color: 'linear-gradient(to top, #818cf8, #6366f1)' },
    { label: 'Mei', value: 12_500_000, color: 'linear-gradient(to top, #818cf8, #6366f1)' },
    { label: 'Jun', value: 9_800_000, color: 'linear-gradient(to top, #818cf8, #6366f1)' },
    { label: 'Jul', value: 15_300_000, color: 'linear-gradient(to top, #818cf8, #6366f1)' },
    { label: 'Ags', value: 11_000_000, color: 'linear-gradient(to top, #818cf8, #6366f1)' },
    { label: 'Sep', value: totalPaid, color: 'linear-gradient(to top, #34d399, #10b981)' },
  ];

  const collectionRate = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !workOrderId) return;
    const client = clients.find(c => c.id === clientId);
    const wo = workOrders.find(w => w.id === workOrderId);
    const tax = amount * 0.11;
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

  const statusBadgeMap: Record<string, string> = {
    Paid: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    Partial: 'bg-amber-50 text-amber-600 border-amber-200',
    Unpaid: 'bg-rose-50 text-rose-500 border-rose-200',
    Overdue: 'bg-purple-50 text-purple-600 border-purple-200',
    Cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-500" />
            Manajemen Keuangan & Invoicing
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Penerbitan tagihan, status DP & pelunasan, analitik pendapatan</p>
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

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-slate-500">Total Tagihan</p>
            <Receipt className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-lg font-black text-slate-900">Rp {(totalInvoiced / 1_000_000).toFixed(1)}jt</p>
          <p className="text-[10px] text-slate-400 mt-1">{invoices.length} invoice aktif</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-emerald-600">Total Diterima</p>
            <Banknote className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-lg font-black text-emerald-700">Rp {(totalPaid / 1_000_000).toFixed(1)}jt</p>
          <p className="text-[10px] text-emerald-500 mt-1 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> {paidCount} invoice lunas
          </p>
        </div>

        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-rose-500">Sisa Piutang</p>
            <AlertCircle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="text-lg font-black text-rose-600">Rp {(totalUnpaid / 1_000_000).toFixed(1)}jt</p>
          <p className="text-[10px] text-rose-400 mt-1">{unpaidCount} invoice belum lunas</p>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-indigo-600">Collection Rate</p>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-lg font-black text-indigo-700">{collectionRate}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-indigo-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-700"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Bar Chart: Monthly Revenue */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tren Pendapatan Bulanan</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Apr – Sep 2026 (Rp juta)</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              ↑ Aktif
            </span>
          </div>
          <BarChart data={monthlyData} />
        </div>

        {/* Donut Chart: Payment Status Breakdown */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Komposisi Pembayaran</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Berdasarkan jumlah invoice</p>
          </div>
          <DonutChart
            paid={paidCount}
            unpaid={unpaidCount}
            partial={partialCount}
          />
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs font-black text-emerald-600">{paidCount}</p>
              <p className="text-[9px] text-slate-400 font-medium">Lunas</p>
            </div>
            <div>
              <p className="text-xs font-black text-amber-500">{partialCount}</p>
              <p className="text-[9px] text-slate-400 font-medium">DP</p>
            </div>
            <div>
              <p className="text-xs font-black text-rose-500">{unpaidCount}</p>
              <p className="text-[9px] text-slate-400 font-medium">Belum</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Daftar Tagihan & Invoice</h3>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-900 focus:outline-none text-xs"
            >
              <option value="all">Semua Status</option>
              <option value="Paid">Paid (Lunas)</option>
              <option value="Partial">Partial (DP)</option>
              <option value="Unpaid">Unpaid (Belum)</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">No. Invoice</th>
                <th className="py-3 px-4">Klien</th>
                <th className="py-3 px-4">Work Order</th>
                <th className="py-3 px-4">Total Tagihan</th>
                <th className="py-3 px-4">Progres Bayar</th>
                <th className="py-3 px-4">Jatuh Tempo</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700">
              {filteredInvoices.map((inv) => {
                const progress = inv.totalAmount > 0 ? Math.round((inv.paidAmount / inv.totalAmount) * 100) : 0;
                return (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{inv.clientName}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{inv.workOrderNumber}</td>
                    <td className="py-3 px-4 font-bold">Rp {inv.totalAmount.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              progress >= 100 ? 'bg-emerald-400' : progress > 0 ? 'bg-amber-400' : 'bg-rose-300'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{inv.dueDate}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${statusBadgeMap[inv.status] || ''}`}>
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
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 font-bold text-[11px] shadow-sm transition-colors"
                        >
                          + Catat Bayar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 text-xs font-semibold">
                    Tidak ada invoice ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Invoice */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Terbitkan Invoice Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Klien:</label>
                <select required value={clientId} onChange={(e) => setClientId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:outline-none focus:border-indigo-400">
                  <option value="">-- Pilih Klien --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hubungkan Work Order:</label>
                <select required value={workOrderId} onChange={(e) => setWorkOrderId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:outline-none focus:border-indigo-400">
                  <option value="">-- Pilih Work Order --</option>
                  {workOrders.map(w => <option key={w.id} value={w.id}>{w.woNumber} - {w.serviceName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nominal DPP (Rp):</label>
                  <input type="number" required value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jatuh Tempo:</label>
                  <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:outline-none focus:border-indigo-400" />
                </div>
              </div>
              <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 text-indigo-700">
                <p>Total + PPN 11%: <strong>Rp {(amount * 1.11).toLocaleString('id-ID')}</strong></p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-100 cursor-pointer">Batal</button>
                <button type="submit"
                  className="rounded-xl bg-indigo-600 text-white px-5 py-2 font-bold shadow-md hover:bg-indigo-500 cursor-pointer">Terbitkan Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Payment */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Catat Pembayaran Masuk</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-1">
                <p><strong>Invoice:</strong> {selectedInvoice.invoiceNumber}</p>
                <p><strong>Klien:</strong> {selectedInvoice.clientName}</p>
                <p><strong>Sisa Tagihan:</strong> <span className="text-rose-600 font-bold">Rp {(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toLocaleString('id-ID')}</span></p>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jumlah Diterima (Rp):</label>
                <input type="number" required value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Metode Pembayaran:</label>
                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:outline-none focus:border-emerald-400">
                  <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                  <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                  <option value="Virtual Account">Virtual Account</option>
                  <option value="Tunai / Cash">Tunai / Cash</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPaymentModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-100 cursor-pointer">Batal</button>
                <button type="submit"
                  className="rounded-xl bg-emerald-600 text-white px-5 py-2 font-bold shadow-md hover:bg-emerald-500 cursor-pointer">Konfirmasi Pembayaran</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Filter, 
  FileSpreadsheet, 
  FileCheck2, 
  TrendingUp, 
  Calendar,
  UserCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { WorkOrder, Service, Client, User } from '../types/legal';

interface ReportsViewProps {
  workOrders: WorkOrder[];
  services: Service[];
  clients: Client[];
  users: User[];
}

export default function ReportsView({
  workOrders,
  services,
  clients,
  users
}: ReportsViewProps) {
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = workOrders.filter(wo => {
    const matchesStaff = staffFilter === 'all' || wo.picStaffId === staffFilter;
    const matchesService = serviceFilter === 'all' || wo.serviceId === serviceFilter;
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
    return matchesStaff && matchesService && matchesStatus;
  });

  const totalValue = filteredOrders.reduce((sum, w) => sum + w.estimatedPrice, 0);

  const handleExportCSV = () => {
    const headers = ['WO Number', 'Client Name', 'Service Name', 'PIC Staff', 'Priority', 'Start Date', 'Deadline', 'Progress', 'Status', 'Price'];
    const rows = filteredOrders.map(w => [
      w.woNumber,
      `"${w.clientName}"`,
      `"${w.serviceName}"`,
      `"${w.picStaffName}"`,
      w.priority,
      w.startDate,
      w.deadline,
      `${w.progressPercent}%`,
      w.status,
      w.estimatedPrice
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Pekerjaan_Legal_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-500" /> Pelaporan Kinerja Operasional (Work Report)
          </h2>
          <p className="text-xs text-slate-500">Laporan terstruktur per periode, staff, perizinan, dan ekspor data (FR-35 & FR-36)</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all self-start sm:self-auto"
        >
          <FileSpreadsheet className="h-4 w-4" /> Ekspor Laporan (.CSV / Excel)
        </button>
      </div>

      {/* Filter Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm text-xs">
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Filter Staff Legal:</label>
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
          >
            <option value="all">Semua Legal Staff</option>
            {users.filter(u => u.role === 'Legal Staff' || u.role === 'Manager/Supervisor').map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Filter Jenis Layanan:</label>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
          >
            <option value="all">Semua Jenis Layanan</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Filter Status Pekerjaan:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Completed">Completed</option>
            <option value="To Do">To Do</option>
          </select>
        </div>
      </div>

      {/* Summary KPI for Filtered Data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500 font-semibold">Total Pekerjaan</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-slate-100">{filteredOrders.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Pekerjaan Selesai</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {filteredOrders.filter(w => w.status === 'Completed').length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-indigo-500 font-semibold">Dalam Proses</p>
          <p className="mt-1 text-2xl font-extrabold text-indigo-500">
            {filteredOrders.filter(w => w.status === 'In Progress' || w.status === 'Review').length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500 font-semibold">Total Nilai Pekerjaan</p>
          <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Rp {totalValue.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Report Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Nomor WO</th>
                <th className="py-3.5 px-4">Klien / Perusahaan</th>
                <th className="py-3.5 px-4">Layanan Legal</th>
                <th className="py-3.5 px-4">PIC Staff</th>
                <th className="py-3.5 px-4">Prioritas</th>
                <th className="py-3.5 px-4">Deadline</th>
                <th className="py-3.5 px-4">Progres (%)</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredOrders.map((wo) => (
                <tr key={wo.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{wo.woNumber}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{wo.clientName}</td>
                  <td className="py-3 px-4">{wo.serviceName}</td>
                  <td className="py-3 px-4">{wo.picStaffName}</td>
                  <td className="py-3 px-4 font-bold text-[10px] text-indigo-500">{wo.priority}</td>
                  <td className="py-3 px-4 font-mono">{wo.deadline}</td>
                  <td className="py-3 px-4 font-bold">{wo.progressPercent}%</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                      {wo.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

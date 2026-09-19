'use client';

import React from 'react';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileCheck2, 
  TrendingUp,
  Building2,
  ArrowRight,
  UserCheck,
  Zap,
  Activity,
  CalendarDays
} from 'lucide-react';
import { WorkOrder, Client, Task, ApprovalRequest, ActivityLog, User } from '../types/legal';

interface DashboardViewProps {
  workOrders: WorkOrder[];
  clients: Client[];
  tasks: Task[];
  approvals: ApprovalRequest[];
  activityLogs: ActivityLog[];
  users: User[];
  onNavigateTab: (tab: string) => void;
  onSelectWorkOrder: (wo: WorkOrder) => void;
}

export default function DashboardView({
  workOrders,
  clients,
  tasks,
  approvals,
  activityLogs,
  users,
  onNavigateTab,
  onSelectWorkOrder
}: DashboardViewProps) {
  const activeProjects = workOrders.filter(w => w.status === 'In Progress' || w.status === 'Review' || w.status === 'To Do');
  const completedProjects = workOrders.filter(w => w.status === 'Completed');
  const pendingApprovals = approvals.filter(a => a.status === 'Pending');
  
  // Calculate due today or overdue
  const todayStr = '2026-09-19';
  const dueToday = workOrders.filter(w => w.deadline === todayStr && w.status !== 'Completed');
  const overdue = workOrders.filter(w => w.deadline < todayStr && w.status !== 'Completed');

  const totalEstimatedRevenue = workOrders.reduce((acc, curr) => acc + curr.estimatedPrice, 0);

  // Employee workload computation
  const staffMembers = users.filter(u => u.role === 'Legal Staff' || u.role === 'Manager/Supervisor');
  const staffWorkload = staffMembers.map(staff => {
    const assignedWO = workOrders.filter(w => w.picStaffId === staff.id && w.status !== 'Completed').length;
    const assignedTasks = tasks.filter(t => t.assigneeId === staff.id && t.status !== 'Completed').length;
    return {
      staff,
      assignedWO,
      assignedTasks,
      totalActive: assignedWO + assignedTasks
    };
  });

  return (
    <div className="space-[#1a1f2c] space-y-6">
      {/* Top Banner / Welcome */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 p-6 text-white border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
              <Zap className="h-3.5 w-3.5" /> Monitoring Operasional Legal Real-time
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Legal Work Management System</h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Pusat kendali berkas, proyek legalitas, approval hirarki, dan pemantauan deadline perusahaan secara terstruktur.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('workorders')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30"
            >
              <FolderKanban className="h-4 w-4" /> Kelola Work Order
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards (FR-34) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Active Projects */}
        <div 
          onClick={() => onNavigateTab('workorders')}
          className="cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all hover:border-indigo-500/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Project Aktif</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{activeProjects.length}</p>
          <p className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Dalam proses
          </p>
        </div>

        {/* Completed Projects */}
        <div 
          onClick={() => onNavigateTab('workorders')}
          className="cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all hover:border-emerald-500/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Selesai</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{completedProjects.length}</p>
          <p className="mt-1 text-[11px] text-slate-500">Bulan ini</p>
        </div>

        {/* Pending Approvals */}
        <div 
          onClick={() => onNavigateTab('approvals')}
          className="cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all hover:border-amber-500/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Approval</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{pendingApprovals.length}</p>
          <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Butuh review manager</p>
        </div>

        {/* Due Today */}
        <div 
          onClick={() => onNavigateTab('calendar')}
          className="cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all hover:border-blue-500/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Deadline Hari Ini</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{dueToday.length}</p>
          <p className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">19 Sep 2026</p>
        </div>

        {/* Overdue */}
        <div 
          onClick={() => onNavigateTab('calendar')}
          className="cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all hover:border-rose-500/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overdue</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">{overdue.length}</p>
          <p className="mt-1 text-[11px] text-rose-500 font-semibold">Perlu perhatian</p>
        </div>

        {/* Clients Total */}
        <div 
          onClick={() => onNavigateTab('clients')}
          className="cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all hover:border-purple-500/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Klien</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{clients.length}</p>
          <p className="mt-1 text-[11px] text-slate-500">Perusahaan & Individu</p>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Work Orders Breakdown (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Progres Work Order Terkini</h3>
                <p className="text-xs text-slate-500">Status dan tahapan workflow proyek legalitas berjalan</p>
              </div>
              <button
                onClick={() => onNavigateTab('workorders')}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {workOrders.map((wo) => {
                const priorityBadge = {
                  Urgent: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
                  High: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
                  Medium: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
                  Low: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30'
                }[wo.priority];

                const statusBadge = {
                  'Completed': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                  'In Progress': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                  'Review': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                  'To Do': 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
                  'Draft': 'bg-gray-500/10 text-gray-600',
                  'Blocked': 'bg-rose-500/10 text-rose-600',
                  'Cancelled': 'bg-gray-500/10 text-gray-600'
                }[wo.status];

                return (
                  <div
                    key={wo.id}
                    onClick={() => onSelectWorkOrder(wo)}
                    className="py-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 px-3 rounded-xl transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{wo.woNumber}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${priorityBadge}`}>
                            {wo.priority}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${statusBadge}`}>
                            {wo.status}
                          </span>
                        </div>
                        <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">{wo.clientName}</h4>
                        <p className="text-xs text-slate-500">{wo.serviceName}</p>
                      </div>

                      <div className="sm:text-right min-w-[140px]">
                        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-500 mb-1">
                          <span>Progress:</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{wo.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${wo.progressPercent}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">PIC: {wo.picStaffName}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Employee Workload Summary (FR-34) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-indigo-500" /> Beban Kerja Tim Legal Staff (Workload)
                </h3>
                <p className="text-xs text-slate-500">Distribusi penugasan Work Order & Task aktif</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {staffWorkload.map(({ staff, assignedWO, assignedTasks, totalActive }) => (
                <div key={staff.id} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                      {staff.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{staff.name}</p>
                      <p className="text-[10px] text-slate-400">{staff.role}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] text-slate-500">Work Orders</p>
                      <p className="font-bold text-indigo-600 dark:text-indigo-400">{assignedWO}</p>
                    </div>
                    <div className="rounded-lg bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] text-slate-500">Tugas / Task</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{assignedTasks}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column: Timeline & Approvals */}
        <div className="space-y-4">
          {/* Pending Approval Widget (FR-22) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-amber-500" /> Pending Approvals
              </h3>
              <button onClick={() => onNavigateTab('approvals')} className="text-xs text-indigo-500 font-semibold hover:underline">
                Kelola
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {pendingApprovals.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-500">Tidak ada pengajuan persetujuan pending.</p>
              ) : (
                pendingApprovals.map((app) => (
                  <div key={app.id} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                    <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-amber-600 dark:text-amber-400">
                      <span>{app.requestNumber}</span>
                      <span>{app.type}</span>
                    </div>
                    <p className="mt-1 text-xs font-bold text-slate-900 dark:text-slate-100">{app.workOrderTitle}</p>
                    <p className="text-[11px] text-slate-500">Diminta oleh: {app.requestedBy}</p>
                    <button
                      onClick={() => onNavigateTab('approvals')}
                      className="mt-2 w-full rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-1 text-xs transition-colors"
                    >
                      Review Sekarang
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Timeline (FR-31, FR-37) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-500" /> Activity Timeline
              </h3>
              <button onClick={() => onNavigateTab('audit')} className="text-xs text-slate-400 hover:text-slate-200">
                Audit Trail
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {activityLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{log.userName}</span>
                      <span className="text-[10px] text-slate-400">{log.timestamp.split(' ')[1] || log.timestamp}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">{log.action}:</span> {log.targetObject}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
} from 'lucide-react';
import { WorkOrder, Client, Task, ApprovalRequest, ActivityLog, User, UserRole } from '../types/legal';

interface DashboardViewProps {
  workOrders: WorkOrder[];
  clients: Client[];
  tasks: Task[];
  approvals: ApprovalRequest[];
  activityLogs: ActivityLog[];
  users: User[];
  currentUser: User;
  onNavigateTab: (tab: string) => void;
  onSelectWorkOrder: (wo: WorkOrder) => void;
}

// Minimalist Light SaaS KPI card colors
const kpiCards = (activeProjects: number, completedProjects: number, pendingApprovals: number, dueTodayCount: number, overdueCount: number, clientsCount: number) => [
  {
    label: 'Project Aktif',
    value: activeProjects,
    sub: 'Dalam proses',
    subColor: '#059669',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF',
    border: '#E0E7FF',
    Icon: FolderKanban,
    tab: 'workorders',
  },
  {
    label: 'Selesai',
    value: completedProjects,
    sub: 'Bulan ini',
    subColor: '#059669',
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    border: '#A7F3D0',
    Icon: CheckCircle2,
    tab: 'workorders',
  },
  {
    label: 'Pending Approval',
    value: pendingApprovals,
    sub: 'Butuh review',
    subColor: '#D97706',
    iconColor: '#D97706',
    iconBg: '#FFFBEB',
    border: '#FDE68A',
    Icon: FileCheck2,
    tab: 'approvals',
  },
  {
    label: 'Deadline Hari Ini',
    value: dueTodayCount,
    sub: '19 Sep 2026',
    subColor: '#2563EB',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
    border: '#BFDBFE',
    Icon: Clock,
    tab: 'calendar',
  },
  {
    label: 'Overdue',
    value: overdueCount,
    sub: 'Perlu perhatian',
    subColor: '#DC2626',
    iconColor: '#DC2626',
    iconBg: '#FEF2F2',
    border: '#FECACA',
    Icon: AlertTriangle,
    tab: 'calendar',
  },
  {
    label: 'Total Klien',
    value: clientsCount,
    sub: 'Perusahaan & Individu',
    subColor: '#0891B2',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF',
    border: '#A5F3FC',
    Icon: Building2,
    tab: 'clients',
  },
];

export default function DashboardView({
  workOrders,
  clients,
  tasks,
  approvals,
  activityLogs,
  users,
  currentUser,
  onNavigateTab,
  onSelectWorkOrder
}: DashboardViewProps) {
  // IAM-based data scoping
  const isClient = currentUser.role === 'client';
  const isNotary = currentUser.role === 'notary';
  const isStaff = !isClient && !isNotary;

  // Filter WOs based on role
  const scopedWorkOrders = isClient
    ? workOrders.filter(w => w.clientId === currentUser.linkedClientId)
    : isNotary
    ? workOrders.filter(w => w.notaryId === currentUser.id)
    : workOrders;

  const [selectedTimelineWoId, setSelectedTimelineWoId] = React.useState<string>(scopedWorkOrders[0]?.id || workOrders[0]?.id);
  const activeTimelineWo = (isClient || isNotary)
    ? scopedWorkOrders.find(w => w.id === selectedTimelineWoId) || scopedWorkOrders[0]
    : workOrders.find(w => w.id === selectedTimelineWoId) || workOrders[0];
  const timelineOrders = isClient || isNotary ? scopedWorkOrders : workOrders;

  const activeProjects = scopedWorkOrders.filter(w => w.status === 'In Progress' || w.status === 'Review' || w.status === 'To Do');
  const completedProjects = scopedWorkOrders.filter(w => w.status === 'Completed');
  const pendingApprovals = approvals.filter(a => a.status === 'Pending');
  
  const todayStr = '2026-09-19';
  const dueToday = workOrders.filter(w => w.deadline === todayStr && w.status !== 'Completed');
  const overdue = workOrders.filter(w => w.deadline < todayStr && w.status !== 'Completed');

  const staffMembers = users.filter(u => u.role === 'technical' || u.role === 'admin' || u.role === 'super_admin');

  const staffWorkload = staffMembers.map(staff => {
    const assignedWO = workOrders.filter(w => w.picStaffId === staff.id && w.status !== 'Completed').length;
    const assignedTasks = tasks.filter(t => t.assigneeId === staff.id && t.status !== 'Completed').length;
    return { staff, assignedWO, assignedTasks, totalActive: assignedWO + assignedTasks };
  });

  const cards = kpiCards(activeProjects.length, completedProjects.length, pendingApprovals.length, dueToday.length, overdue.length, clients.length);

  const statusColor: Record<string, { bg: string; text: string }> = {
    'Completed':  { bg: '#ECFDF5', text: '#059669' },
    'In Progress':{ bg: '#EEF2FF', text: '#4F46E5' },
    'Review':     { bg: '#FFFBEB', text: '#D97706' },
    'To Do':      { bg: '#F1F5F9', text: '#475569' },
    'Draft':      { bg: '#F1F5F9', text: '#475569' },
    'Blocked':    { bg: '#FEF2F2', text: '#DC2626' },
    'Cancelled':  { bg: '#F1F5F9', text: '#475569' },
  };

  const priorityColor: Record<string, { bg: string; text: string; border: string }> = {
    'Urgent': { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
    'High':   { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
    'Medium': { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' },
    'Low':    { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' },
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-2 bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Zap className="h-3.5 w-3.5 text-indigo-600" />
              {isClient ? 'Client Portal — Status Proyek Legalitas Anda' : isNotary ? 'Notary Portal — Penugasan Akta & Dokumen' : 'Live — Monitoring Operasional Legal'}
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
              {isClient ? `Halo, ${currentUser.name.split('(')[0].trim()} 👋` : isNotary ? `Notaris Dashboard` : 'Legal Work Management'}
            </h2>
            <p className="text-xs md:text-sm mt-1 text-slate-500 max-w-xl">
              {isClient
                ? 'Pantau status dan perkembangan seluruh proyek legalitas perusahaan Anda secara real-time.'
                : isNotary
                ? 'Tampilan penugasan akta, minuta, dan Work Order yang membutuhkan tindakan notaris.'
                : 'Pusat kendali berkas, proyek legalitas, approval hirarki, dan pemantauan deadline perusahaan secara terstruktur.'}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('workorders')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold bg-indigo-600 hover:bg-indigo-700 transition-all shrink-0 shadow-xs"
          >
            <FolderKanban className="h-4 w-4" /> {isClient ? 'Lihat Order Saya' : 'Kelola Work Order'}
          </button>
        </div>
      </div>

      {/* KPI Cards — Staff/Admin only */}
      {isStaff && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {cards.map((card) => (
            <div
              key={card.label}
              onClick={() => onNavigateTab(card.tab)}
              className="cursor-pointer rounded-xl p-4 bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all relative overflow-hidden group"
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: card.iconColor }} />
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{card.label}</span>
                <div className="p-1.5 rounded-lg" style={{ background: card.iconBg }}>
                  <card.Icon className="h-3.5 w-3.5" style={{ color: card.iconColor }} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{card.value}</p>
              <p className="mt-1 text-[10px] font-semibold flex items-center gap-1" style={{ color: card.subColor }}>
                <TrendingUp className="h-3 w-3" /> {card.sub}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Client KPI mini strip */}
      {(isClient || isNotary) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Order Berjalan', value: activeProjects.length, color: '#4F46E5', bg: '#EEF2FF' },
            { label: 'Order Selesai', value: completedProjects.length, color: '#059669', bg: '#ECFDF5' },
            { label: 'Total Proyek', value: scopedWorkOrders.length, color: '#0891B2', bg: '#ECFEFF' },
            { label: 'Deadline Aktif', value: scopedWorkOrders.filter(w => w.status !== 'Completed').length, color: '#D97706', bg: '#FFFBEB' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl p-4 bg-white border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: item.color }} />
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">{item.label}</p>
              <p className="text-2xl font-black" style={{ color: item.color }}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Work Orders List — 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Work Orders */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Progres Work Order Terkini</h3>
                <p className="text-xs text-slate-500 mt-0.5">Status dan tahapan workflow proyek legalitas berjalan</p>
              </div>
              <button
                onClick={() => onNavigateTab('workorders')}
                className="flex items-center gap-1 text-xs font-bold transition-all px-3 py-1.5 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
              >
                Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {scopedWorkOrders.map((wo) => {
                const sc = statusColor[wo.status] || statusColor['To Do'];
                const pc = priorityColor[wo.priority] || priorityColor['Medium'];
                return (
                  <div
                    key={wo.id}
                    onClick={() => onSelectWorkOrder(wo)}
                    className="px-5 py-4 cursor-pointer transition-all hover:bg-slate-50 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-black text-indigo-600">{wo.woNumber}</span>
                          <span className="badge-pill" style={{ background: pc.bg, color: pc.text, border: `1px solid ${pc.border}` }}>
                            {wo.priority}
                          </span>
                          <span className="badge-pill" style={{ background: sc.bg, color: sc.text }}>
                            {wo.status}
                          </span>
                        </div>
                        <h4 className="mt-1.5 text-sm font-bold truncate text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {wo.clientName}
                        </h4>
                        <p className="text-xs truncate text-slate-500">{wo.serviceName}</p>
                      </div>

                      <div className="sm:text-right min-w-[140px]">
                        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs mb-1.5 text-slate-500">
                          <span>Progress</span>
                          <span className="font-black text-slate-900">{wo.progressPercent}%</span>
                        </div>
                        <div className="w-full rounded-full h-1.5 overflow-hidden bg-slate-100">
                          <div
                            className="h-full rounded-full transition-all duration-500 bg-indigo-600"
                            style={{ width: `${wo.progressPercent}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[10px] text-slate-400">PIC: {wo.picStaffName.split(' ')[0]}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Client Timeline Tracker embedded inside Dashboard */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-600" /> Client Timeline Tracker (Real-Time SLA & Progress)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Pantau alur tahapan pengerjaan legalitas secara transparan</p>
              </div>

              {timelineOrders.length > 0 && (
                <div className="text-xs">
                  <span className="text-slate-400 font-medium mr-1.5">{isClient ? 'Order Anda:' : 'Pilih Perusahaan:'}</span>
                  <select
                    value={selectedTimelineWoId}
                    onChange={(e) => setSelectedTimelineWoId(e.target.value)}
                    className="border border-slate-200 rounded-lg px-2.5 py-1 font-bold text-slate-800 bg-slate-50 focus:bg-white text-xs outline-none"
                  >
                    {timelineOrders.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.clientName} ({w.woNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {activeTimelineWo && (
              <div className="space-y-4">
                {/* Header Summary Card */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-mono font-black text-indigo-600">{activeTimelineWo.woNumber}</span>
                    <h4 className="text-sm font-black text-slate-900 mt-0.5">{activeTimelineWo.clientName}</h4>
                    <p className="text-slate-500 font-medium">{activeTimelineWo.serviceName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Progres Total</span>
                    <span className="text-lg font-black text-indigo-600">{activeTimelineWo.progressPercent}%</span>
                    <span className="block text-[10px] text-emerald-600 font-bold mt-0.5">SLA Deadline: {activeTimelineWo.deadline}</span>
                  </div>
                </div>

                {/* Timeline Step Indicators */}
                <div className="relative pl-4 space-y-3 before:absolute before:left-6 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {activeTimelineWo.workflow.map((st, idx) => {
                    const isCompleted = st.status === 'Completed';
                    const isInProgress = st.status === 'In Progress';
                    return (
                      <div key={st.stageId} className="relative flex items-start gap-3.5 z-10">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : isInProgress
                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md animate-pulse'
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <div className={`flex-1 rounded-xl p-3 border transition-all ${
                          isInProgress 
                            ? 'bg-indigo-50/60 border-indigo-200 shadow-xs' 
                            : 'bg-white border-slate-100'
                        }`}>
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-xs font-bold ${isInProgress ? 'text-indigo-900' : 'text-slate-800'}`}>
                              {st.stageName}
                            </p>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                              isCompleted ? 'bg-emerald-100 text-emerald-800' : isInProgress ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {st.status}
                            </span>
                          </div>
                          {st.completedAt && (
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">
                              Selesai pada: {st.completedAt} oleh {st.completedBy}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Workload Summary — Staff only */}
          {isStaff && (
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900">
                  <UserCheck className="h-4 w-4 text-indigo-600" />
                  Beban Kerja Tim Legal
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Distribusi penugasan Work Order & Task aktif</p>
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {staffWorkload.map(({ staff, assignedWO, assignedTasks, totalActive }) => (
                <div key={staff.id} className="rounded-xl p-3.5 bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black text-white shrink-0 bg-indigo-600">
                      {staff.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate text-slate-900">{staff.name}</p>
                      <p className="text-[10px] text-slate-500">{staff.role}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg p-2 text-center bg-white border border-slate-200">
                      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">WO</p>
                      <p className="text-lg font-black text-indigo-600">{assignedWO}</p>
                    </div>
                    <div className="rounded-lg p-2 text-center bg-white border border-slate-200">
                      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Tasks</p>
                      <p className="text-lg font-black text-emerald-600">{assignedTasks}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Pending Approvals — Staff only */}
          {isStaff && (
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900">
                <FileCheck2 className="h-4 w-4 text-amber-500" />
                Pending Approvals
              </h3>
              <button onClick={() => onNavigateTab('approvals')}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Kelola
              </button>
            </div>

            <div className="p-4 space-y-3">
              {pendingApprovals.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-500">Tidak ada approval pending.</p>
              ) : (
                pendingApprovals.map((app) => (
                  <div key={app.id} className="rounded-xl p-3 bg-amber-50/70 border border-amber-200">
                    <div className="flex items-center justify-between text-[10px] font-bold font-mono text-amber-700">
                      <span>{app.requestNumber}</span>
                      <span>{app.type}</span>
                    </div>
                    <p className="mt-1 text-xs font-bold text-slate-900">{app.workOrderTitle}</p>
                    <p className="text-[11px] mt-0.5 text-slate-500">Diminta oleh: {app.requestedBy}</p>
                    <button
                      onClick={() => onNavigateTab('approvals')}
                      className="mt-2.5 w-full rounded-lg py-1.5 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-xs"
                    >
                      Review Sekarang →
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          )}

          {/* Activity Timeline */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900">
                <Activity className="h-4 w-4 text-indigo-600" />
                Activity Feed
              </h3>
              <button onClick={() => onNavigateTab('audit')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900">
                Audit Trail
              </button>
            </div>

            <div className="p-4 space-y-3.5">
              {activityLogs.slice(0, 5).map((log, idx) => (
                <div key={log.id} className="flex items-start gap-3 text-xs">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-black text-white shrink-0 mt-0.5 ${
                    idx % 2 === 0 ? 'bg-indigo-600' : 'bg-purple-600'
                  }`}>
                    {log.userName.substring(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold truncate text-slate-900">{log.userName}</span>
                      <span className="text-[9px] shrink-0 text-slate-400">
                        {log.timestamp.split(' ')[1] || log.timestamp}
                      </span>
                    </div>
                    <p className="mt-0.5 leading-tight text-slate-500">
                      <span className="font-semibold text-indigo-600">{log.action}:</span>{' '}
                      {log.targetObject}
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

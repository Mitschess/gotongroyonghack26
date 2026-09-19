'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Kanban, 
  List, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  MessageSquare, 
  User, 
  Calendar, 
  ChevronRight, 
  X, 
  Send, 
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Paperclip,
  TrendingUp,
  Check,
  Edit2
} from 'lucide-react';
import { 
  WorkOrder, 
  Client, 
  Service, 
  Task, 
  LegalDocument, 
  WorkNote, 
  UserRole,
  Priority,
  WorkOrderStatus 
} from '../types/legal';

interface WorkOrdersViewProps {
  workOrders: WorkOrder[];
  clients: Client[];
  services: Service[];
  tasks: Task[];
  documents: LegalDocument[];
  workNotes: WorkNote[];
  userRole: UserRole;
  currentUserId: string;
  selectedWorkOrder?: WorkOrder | null;
  onClearSelectedWorkOrder?: () => void;
  onAddWorkOrder: (newWo: Partial<WorkOrder>) => void;
  onUpdateWorkOrderStatus: (woId: string, status: WorkOrderStatus) => void;
  onAdvanceWorkflowStage: (woId: string) => void;
  onAddTask: (newTask: Partial<Task>) => void;
  onUpdateTaskStatus: (taskId: string, status: Task['status']) => void;
  onAddWorkNote: (woId: string, content: string) => void;
  onRequestApproval: (woId: string, type: 'Stage Completion' | 'Document Signoff' | 'Final WO Completion') => void;
}

export default function WorkOrdersView({
  workOrders,
  clients,
  services,
  tasks,
  documents,
  workNotes,
  userRole,
  currentUserId,
  selectedWorkOrder,
  onClearSelectedWorkOrder,
  onAddWorkOrder,
  onUpdateWorkOrderStatus,
  onAdvanceWorkflowStage,
  onAddTask,
  onUpdateTaskStatus,
  onAddWorkNote,
  onRequestApproval
}: WorkOrdersViewProps) {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  // Selected Work Order Drawer State
  const [selectedWo, setSelectedWo] = useState<WorkOrder | null>(selectedWorkOrder || null);
  const [activeWoTab, setActiveWoTab] = useState<'workflow' | 'tasks' | 'documents' | 'notes'>('workflow');

  React.useEffect(() => {
    if (selectedWorkOrder) {
      setSelectedWo(selectedWorkOrder);
    }
  }, [selectedWorkOrder]);

  
  // Modal for new Work Order
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWoForm, setNewWoForm] = useState({
    clientId: '',
    serviceId: '',
    picStaffId: 'usr-3',
    priority: 'Medium' as Priority,
    startDate: '2026-09-20',
    deadline: '2026-10-05',
    description: ''
  });

  // Modal for new Task inside Drawer
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    priority: 'Medium' as Priority,
    deadline: '2026-09-25'
  });

  // Note input state
  const [newNoteText, setNewNoteText] = useState('');

  // IAM Scoped Work Orders
  const scopedWorkOrders = workOrders.filter(wo => {
    if (userRole === 'client') {
      return wo.clientId === 'cli-101' || wo.clientName.toLowerCase().includes('nusantara');
    }
    if (userRole === 'notary') {
      return wo.notaryId === currentUserId || (wo.notaryName && wo.notaryName.toLowerCase().includes('soebagjo'));
    }
    return true;
  });

  // Filtering
  const filteredWorkOrders = scopedWorkOrders.filter(wo => {
    const matchesSearch = wo.woNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          wo.clientName.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          wo.serviceName.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateWoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWoForm.clientId || !newWoForm.serviceId) return;

    const client = clients.find(c => c.id === newWoForm.clientId);
    const service = services.find(s => s.id === newWoForm.serviceId);

    onAddWorkOrder({
      clientId: newWoForm.clientId,
      clientName: client?.name || 'Client',
      serviceId: newWoForm.serviceId,
      serviceName: service?.name || 'Layanan Legal',
      picStaffId: newWoForm.picStaffId,
      picStaffName: 'Budi Santoso, S.H.',
      priority: newWoForm.priority,
      startDate: newWoForm.startDate,
      deadline: newWoForm.deadline,
      description: newWoForm.description,
      estimatedPrice: service?.price || 5000000,
      status: 'In Progress',
      currentStageIndex: 0,
      progressPercent: 15,
      workflow: service?.workflowStages.map((st, i) => ({
        stageId: st.id,
        stageName: st.name,
        status: i === 0 ? 'In Progress' : 'Pending'
      })) || []
    });

    setShowAddModal(false);
    setNewWoForm({
      clientId: '',
      serviceId: '',
      picStaffId: 'usr-3',
      priority: 'Medium',
      startDate: '2026-09-20',
      deadline: '2026-10-05',
      description: ''
    });
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWo || !newTaskForm.title) return;

    onAddTask({
      workOrderId: selectedWo.id,
      title: newTaskForm.title,
      description: newTaskForm.description,
      assigneeId: selectedWo.picStaffId,
      assigneeName: selectedWo.picStaffName,
      priority: newTaskForm.priority,
      deadline: newTaskForm.deadline,
      status: 'To Do',
      attachmentsCount: 0,
      notesCount: 0,
      createdAt: '2026-09-19'
    });

    setShowAddTaskModal(false);
    setNewTaskForm({ title: '', description: '', priority: 'Medium', deadline: '2026-09-25' });
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWo || !newNoteText.trim()) return;

    onAddWorkNote(selectedWo.id, newNoteText);
    setNewNoteText('');
  };

  const statusColumns: { status: WorkOrderStatus; title: string; color: string }[] = [
    { status: 'To Do', title: 'TO DO / ANTREAN', color: '#3B82F6' },
    { status: 'In Progress', title: 'DALAM PROSES', color: '#4F46E5' },
    { status: 'Review', title: 'REVIEW MANAGER', color: '#D97706' },
    { status: 'Completed', title: 'SELESAI', color: '#059669' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Kanban className="h-5 w-5 text-indigo-600" /> Manajemen Work Order & Task Legal
          </h2>
          <p className="text-xs text-slate-500">Kelola berkas pekerjaan, penugasan staff, dan workflow perizinan</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl p-1 bg-white border border-slate-200">
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'board'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" /> Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="h-3.5 w-3.5" /> Tabel List
            </button>
          </div>

          {['super_admin', 'admin', 'technical'].includes(userRole) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Work Order Baru
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3 bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px] px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor WO, nama client, atau jenis layanan..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Filter className="h-3.5 w-3.5" /> Status:
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            Priority:
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none"
            >
              <option value="all">Semua Prioritas</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Board View / Kanban */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusColumns.map((col) => {
            const colWorkOrders = filteredWorkOrders.filter(wo => wo.status === col.status);
            return (
              <div 
                key={col.status} 
                className="rounded-2xl p-3 flex flex-col min-h-[500px] bg-slate-100/70 border border-slate-200/80"
              >
                <div className="flex items-center justify-between pb-3" style={{ borderBottom: `2px solid ${col.color}` }}>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: col.color }} />
                    {col.title}
                  </h3>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white" style={{ background: col.color }}>
                    {colWorkOrders.length}
                  </span>
                </div>

                <div className="mt-3 space-y-3 flex-1 overflow-y-auto">
                  {colWorkOrders.map((wo) => (
                    <div
                      key={wo.id}
                      onClick={() => setSelectedWo(wo)}
                      className="cursor-pointer rounded-xl p-4 bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all group hover:border-indigo-300"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                        <span className="text-indigo-600">{wo.woNumber}</span>
                        <span 
                          className={`px-2 py-0.5 rounded font-black text-[9px] ${
                            wo.priority === 'Urgent' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                            wo.priority === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-blue-50 text-blue-600 border border-blue-200'
                          }`}
                        >
                          {wo.priority}
                        </span>
                      </div>

                      <h4 className="mt-2 text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {wo.clientName}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{wo.serviceName}</p>

                      {/* Progress Bar */}
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                          <span>Tahap {wo.currentStageIndex + 1}/{wo.workflow.length}</span>
                          <span className="font-bold text-slate-900">{wo.progressPercent}%</span>
                        </div>
                        <div className="w-full rounded-full h-1.5 overflow-hidden bg-slate-100">
                          <div
                            className="h-full rounded-full transition-all bg-indigo-600"
                            style={{ width: `${wo.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <User className="h-3 w-3 text-indigo-600" /> {wo.picStaffName.split(' ')[0]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {wo.deadline}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl overflow-hidden shadow-xs bg-white border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase font-extrabold text-[11px] bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">WO Number</th>
                  <th className="py-3.5 px-4">Klien / Perusahaan</th>
                  <th className="py-3.5 px-4">Jenis Layanan</th>
                  <th className="py-3.5 px-4">PIC Staff</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Deadline</th>
                  <th className="py-3.5 px-4">Progress</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredWorkOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{wo.woNumber}</td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">{wo.clientName}</td>
                    <td className="py-3 px-4 text-slate-600">{wo.serviceName}</td>
                    <td className="py-3 px-4">{wo.picStaffName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {wo.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{wo.deadline}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 rounded-full h-1.5 bg-slate-100">
                          <div className="h-1.5 rounded-full bg-indigo-600" style={{ width: `${wo.progressPercent}%` }} />
                        </div>
                        <span className="font-bold">{wo.progressPercent}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge-pill status-progress text-[10px]">
                        {wo.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedWo(wo)}
                        className="rounded-lg px-2.5 py-1 text-xs font-bold transition-all text-white"
                        style={{ background: '#252535', border: '1px solid #2E2E45' }}
                      >
                        Detail Drawer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Work Order Detail Drawer (FR-10 to FR-16, FR-30) */}
      {selectedWo && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div>
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50 dark:bg-slate-950">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{selectedWo.woNumber}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-500">
                      {selectedWo.priority}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                      {selectedWo.status}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-extrabold text-slate-900 dark:text-slate-100">{selectedWo.clientName}</h3>
                  <p className="text-xs text-slate-500">{selectedWo.serviceName}</p>
                </div>
                <button
                  onClick={() => setSelectedWo(null)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sub Navigation Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
                <button
                  onClick={() => setActiveWoTab('workflow')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                    activeWoTab === 'workflow'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Workflow & Status (FR-16)
                </button>
                <button
                  onClick={() => setActiveWoTab('tasks')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                    activeWoTab === 'tasks'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Tasks ({tasks.filter(t => t.workOrderId === selectedWo.id).length})
                </button>
                <button
                  onClick={() => setActiveWoTab('documents')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                    activeWoTab === 'documents'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Dokumen ({documents.filter(d => d.workOrderId === selectedWo.id).length})
                </button>
                <button
                  onClick={() => setActiveWoTab('notes')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                    activeWoTab === 'notes'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Catatan Pekerjaan (FR-30)
                </button>
              </div>

              {/* Drawer Tab Content */}
              <div className="p-6 space-y-6">
                {/* TAB 1: WORKFLOW ENGINE TRACKER */}
                {activeWoTab === 'workflow' && (
                  <div className="space-y-6">
                    {/* Status Change Control — Internal Staff & Notary only */}
                    {userRole !== 'client' ? (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Ubah Status Work Order:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(['To Do', 'In Progress', 'Review', 'Completed'] as WorkOrderStatus[]).map((st) => (
                            <button
                              key={st}
                              onClick={() => {
                                onUpdateWorkOrderStatus(selectedWo.id, st);
                                setSelectedWo({ ...selectedWo, status: st });
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                selectedWo.status === st
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs text-indigo-900 font-medium">
                        ⓘ Progres & tahapan legalitas pengerjaan dikelola secara transparan oleh Tim Legal LexiFlow & Notaris Mitra.
                      </div>
                    )}

                    {/* Interactive Visual Stage Tracker (FR-16) */}
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
                        Workflow Stage Tracker
                      </h4>
                      <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                        {selectedWo.workflow.map((wf, idx) => {
                          const isCompleted = wf.status === 'Completed';
                          const isInProgress = wf.status === 'In Progress';

                          return (
                            <div key={wf.stageId} className="flex items-start gap-4 relative z-10">
                              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 transition-all ${
                                isCompleted ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' :
                                isInProgress ? 'bg-indigo-600 text-white animate-pulse' :
                                'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
                              </div>

                              <div className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{wf.stageName}</h5>
                                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                                    isCompleted ? 'bg-emerald-500/10 text-emerald-500' :
                                    isInProgress ? 'bg-indigo-500/10 text-indigo-500' :
                                    'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                  }`}>
                                    {wf.status}
                                  </span>
                                </div>
                                {wf.completedAt && (
                                  <p className="mt-1 text-[11px] text-slate-400">
                                    Selesai oleh {wf.completedBy} pada {wf.completedAt}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Advance Stage Button & Request Approval Button — Internal Staff only */}
                      {userRole !== 'client' && (
                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => {
                              onAdvanceWorkflowStage(selectedWo.id);
                              // Refresh local view
                              const nextStageIndex = Math.min(selectedWo.currentStageIndex + 1, selectedWo.workflow.length - 1);
                              const updatedWf = [...selectedWo.workflow];
                              if (updatedWf[selectedWo.currentStageIndex]) {
                                updatedWf[selectedWo.currentStageIndex].status = 'Completed';
                                updatedWf[selectedWo.currentStageIndex].completedAt = '2026-09-19';
                                updatedWf[selectedWo.currentStageIndex].completedBy = 'Current User';
                              }
                              if (updatedWf[nextStageIndex]) {
                                updatedWf[nextStageIndex].status = 'In Progress';
                              }
                              setSelectedWo({
                                ...selectedWo,
                                currentStageIndex: nextStageIndex,
                                workflow: updatedWf,
                                progressPercent: Math.round(((nextStageIndex + 1) / updatedWf.length) * 100)
                              });
                            }}
                            className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
                          >
                            Lanjutkan Tahap Berikutnya →
                          </button>

                          <button
                            onClick={() => onRequestApproval(selectedWo.id, 'Stage Completion')}
                            className="rounded-xl border border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 py-2.5 px-4 text-xs font-bold transition-all cursor-pointer"
                          >
                            Minta Approval Staff / Notaris (Review)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: TASKS MANAGEMENT */}
                {activeWoTab === 'tasks' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Daftar Tugas (Task Item)</h4>
                      <button
                        onClick={() => setShowAddTaskModal(true)}
                        className="flex items-center gap-1 rounded-lg bg-indigo-600 text-white px-2.5 py-1 text-xs font-bold"
                      >
                        <Plus className="h-3.5 w-3.5" /> Tambah Task
                      </button>
                    </div>

                    <div className="space-y-3">
                      {tasks.filter(t => t.workOrderId === selectedWo.id).map((task) => (
                        <div key={task.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{task.title}</h5>
                              <p className="mt-1 text-xs text-slate-500">{task.description}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                              task.status === 'In Progress' ? 'bg-indigo-500/10 text-indigo-500' :
                              'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                              {task.status}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                            <span className="text-slate-500">Assignee: <strong className="text-slate-800 dark:text-slate-200">{task.assigneeName}</strong></span>
                            
                            <select
                              value={task.status}
                              onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as Task['status'])}
                              className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Review">Review</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: DOCUMENTS */}
                {activeWoTab === 'documents' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Dokumen Terlampir</h4>
                    {documents.filter(d => d.workOrderId === selectedWo.id).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-indigo-500" />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{doc.title}</p>
                            <span className="text-[10px] text-slate-400">{doc.category} • Versi {doc.currentVersion} • {doc.fileSize}</span>
                          </div>
                        </div>
                        <span className="rounded bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                          {doc.accessLevel}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 4: WORK NOTES (FR-30) */}
                {activeWoTab === 'notes' && (
                  <div className="space-y-4">
                    <form onSubmit={handleAddNoteSubmit} className="space-y-2">
                      <textarea
                        rows={3}
                        placeholder="Tulis catatan perkembangan pekerjaan legalitas di sini..."
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 text-xs font-bold ml-auto"
                      >
                        <Send className="h-3.5 w-3.5" /> Simpan Catatan
                      </button>
                    </form>

                    <div className="space-y-3 pt-2">
                      {workNotes.filter(n => n.workOrderId === selectedWo.id).map((note) => (
                        <div key={note.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-bold text-slate-900 dark:text-slate-100">{note.authorName} ({note.authorRole})</span>
                            <span>{note.timestamp}</span>
                          </div>
                          <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Work Order */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Buat Work Order Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWoSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Klien:</label>
                <select
                  required
                  value={newWoForm.clientId}
                  onChange={(e) => setNewWoForm({ ...newWoForm, clientId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="">-- Pilih Klien --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jenis Layanan Legalitas:</label>
                <select
                  required
                  value={newWoForm.serviceId}
                  onChange={(e) => setNewWoForm({ ...newWoForm, serviceId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="">-- Pilih Layanan --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Est: {s.estimatedDays} hari)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Priority:</label>
                  <select
                    value={newWoForm.priority}
                    onChange={(e) => setNewWoForm({ ...newWoForm, priority: e.target.value as Priority })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Deadline:</label>
                  <input
                    type="date"
                    required
                    value={newWoForm.deadline}
                    onChange={(e) => setNewWoForm({ ...newWoForm, deadline: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi & Catatan Awal:</label>
                <textarea
                  rows={3}
                  placeholder="Kebutuhan khusus atau catatan instruksi..."
                  value={newWoForm.description}
                  onChange={(e) => setNewWoForm({ ...newWoForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 text-white px-5 py-2 font-bold hover:bg-indigo-500 shadow-md"
                >
                  Buat Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Task inside Drawer */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Tambah Task Baru</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddTaskSubmit} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Task:</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Verifikasi KTP ke Dukcapil"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi:</label>
                <textarea
                  rows={2}
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="rounded-lg border px-3 py-1.5 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 text-white px-4 py-1.5 font-bold"
                >
                  Simpan Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

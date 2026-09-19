'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DashboardView from '../components/DashboardView';
import WorkOrdersView from '../components/WorkOrdersView';
import ClientsView from '../components/ClientsView';
import ServicesView from '../components/ServicesView';
import DocumentsView from '../components/DocumentsView';
import ApprovalsView from '../components/ApprovalsView';
import CalendarView from '../components/CalendarView';
import FinanceView from '../components/FinanceView';
import ReportsView from '../components/ReportsView';
import AuditLogView from '../components/AuditLogView';

import { 
  INITIAL_USERS, 
  INITIAL_CLIENTS, 
  INITIAL_SERVICES, 
  INITIAL_WORK_ORDERS, 
  INITIAL_TASKS, 
  INITIAL_DOCUMENTS, 
  INITIAL_APPROVALS, 
  INITIAL_CALENDAR_EVENTS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_WORK_NOTES, 
  INITIAL_ACTIVITY_LOGS, 
  INITIAL_INVOICES 
} from '../lib/initialData';

import { 
  User, 
  Client, 
  Service, 
  WorkOrder, 
  Task, 
  LegalDocument, 
  ApprovalRequest, 
  CalendarEvent, 
  NotificationItem, 
  WorkNote, 
  ActivityLog, 
  Invoice,
  ApprovalStatus,
  WorkOrderStatus,
  InvoiceStatus
} from '../types/legal';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[1]); // Maya Putri, S.H. (Manager)
  const [users] = useState<User[]>(INITIAL_USERS);
  
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [documents, setDocuments] = useState<LegalDocument[]>(INITIAL_DOCUMENTS);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(INITIAL_APPROVALS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [workNotes, setWorkNotes] = useState<WorkNote[]>(INITIAL_WORK_NOTES);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Selected Work Order for deep view
  const [selectedWoFromDashboard, setSelectedWoFromDashboard] = useState<WorkOrder | null>(null);

  // Helper to log audit activity
  const logActivity = (action: string, targetObject: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      targetObject,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      ipAddress: '182.253.44.' + Math.floor(Math.random() * 80 + 10)
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Helper to add notification
  const addNotification = (title: string, message: string, type: NotificationItem['type']) => {
    const newNotif: NotificationItem = {
      id: `not-${Date.now()}`,
      title,
      message,
      timestamp: 'Baru saja',
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Action Handlers
  const handleRoleChange = (selectedUser: User) => {
    setCurrentUser(selectedUser);
    logActivity('Switch User Role', `Beralih ke role ${selectedUser.role} (${selectedUser.name})`);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleAddClient = (newClientData: Partial<Client>) => {
    const newClient: Client = {
      id: `cli-${Date.now().toString().slice(-3)}`,
      clientCode: `CL-2026-00${clients.length + 1}`,
      name: newClientData.name || '',
      companyName: newClientData.companyName || newClientData.name,
      email: newClientData.email || '',
      phone: newClientData.phone || '',
      address: newClientData.address || '',
      type: newClientData.type || 'PT',
      picName: newClientData.picName || '',
      picPhone: newClientData.picPhone || '',
      notes: newClientData.notes || '',
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'Active'
    };

    setClients(prev => [newClient, ...prev]);
    logActivity('Tambah Klien Baru', newClient.name);
    addNotification('Klien Terdaftar', `Klien ${newClient.name} berhasil ditambahkan.`, 'system');
  };

  const handleAddService = (newServiceData: Partial<Service>) => {
    const newService: Service = {
      id: `srv-${Date.now().toString().slice(-3)}`,
      serviceCode: newServiceData.serviceCode || `SRV-GEN-${Date.now().toString().slice(-3)}`,
      name: newServiceData.name || '',
      description: newServiceData.description || '',
      estimatedDays: newServiceData.estimatedDays || 14,
      price: newServiceData.price || 5000000,
      requiredDocuments: newServiceData.requiredDocuments || ['KTP', 'NPWP'],
      workflowStages: newServiceData.workflowStages || [],
      status: 'Active'
    };

    setServices(prev => [newService, ...prev]);
    logActivity('Tambah Layanan Baru', newService.name);
  };

  const handleRequestServiceSubmit = (clientId: string, serviceId: string, notes: string) => {
    const client = clients.find(c => c.id === clientId);
    const service = services.find(s => s.id === serviceId);
    if (!client || !service) return;

    // Automatically create a Work Order from Service Request (FR-09 & FR-10)
    handleAddWorkOrder({
      clientId: client.id,
      clientName: client.name,
      serviceId: service.id,
      serviceName: service.name,
      picStaffId: 'usr-3',
      picStaffName: 'Budi Santoso, S.H.',
      priority: 'High',
      startDate: new Date().toISOString().slice(0, 10),
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      description: notes || `Permintaan layanan ${service.name} oleh ${client.name}`,
      estimatedPrice: service.price,
      status: 'To Do',
      currentStageIndex: 0,
      progressPercent: 10,
      workflow: service.workflowStages.map((st, i) => ({
        stageId: st.id,
        stageName: st.name,
        status: i === 0 ? 'In Progress' : 'Pending'
      }))
    });

    logActivity('Submit Service Request', `${service.name} untuk ${client.name}`);
    addNotification('Permintaan Layanan Baru', `Service Request ${service.name} dibuat untuk ${client.name}`, 'task');
  };

  const handleAddWorkOrder = (newWoData: Partial<WorkOrder>) => {
    const newWo: WorkOrder = {
      id: `wo-${Date.now().toString().slice(-3)}`,
      woNumber: `WO-2026-00${workOrders.length + 101}`,
      clientId: newWoData.clientId || '',
      clientName: newWoData.clientName || '',
      serviceId: newWoData.serviceId || '',
      serviceName: newWoData.serviceName || '',
      picStaffId: newWoData.picStaffId || 'usr-3',
      picStaffName: newWoData.picStaffName || 'Budi Santoso, S.H.',
      priority: newWoData.priority || 'Medium',
      startDate: newWoData.startDate || new Date().toISOString().slice(0, 10),
      deadline: newWoData.deadline || '2026-10-10',
      status: newWoData.status || 'In Progress',
      currentStageIndex: newWoData.currentStageIndex || 0,
      progressPercent: newWoData.progressPercent || 20,
      estimatedPrice: newWoData.estimatedPrice || 5000000,
      description: newWoData.description || '',
      createdAt: new Date().toISOString().slice(0, 10),
      workflow: newWoData.workflow || []
    };

    setWorkOrders(prev => [newWo, ...prev]);
    logActivity('Pembuatan Work Order', `${newWo.woNumber} - ${newWo.clientName}`);
    addNotification('Work Order Baru', `WO ${newWo.woNumber} ditugaskan kepada ${newWo.picStaffName}`, 'task');
  };

  const handleUpdateWorkOrderStatus = (woId: string, status: WorkOrderStatus) => {
    setWorkOrders(prev => prev.map(w => w.id === woId ? { ...w, status } : w));
    logActivity('Perubahan Status WO', `WO ID ${woId} diubah ke ${status}`);
  };

  const handleAdvanceWorkflowStage = (woId: string) => {
    setWorkOrders(prev => prev.map(w => {
      if (w.id !== woId) return w;
      const nextIdx = Math.min(w.currentStageIndex + 1, w.workflow.length - 1);
      const updatedWf = w.workflow.map((st, idx) => {
        if (idx === w.currentStageIndex) {
          return { ...st, status: 'Completed' as const, completedAt: '2026-09-19', completedBy: currentUser.name };
        }
        if (idx === nextIdx) {
          return { ...st, status: 'In Progress' as const };
        }
        return st;
      });
      const progressPercent = Math.round(((nextIdx + 1) / w.workflow.length) * 100);
      return {
        ...w,
        currentStageIndex: nextIdx,
        workflow: updatedWf,
        progressPercent,
        status: progressPercent === 100 ? 'Completed' : w.status
      };
    }));
    logActivity('Advance Workflow Stage', `Progres WO ${woId} ditingkatkan`);
  };

  const handleAddTask = (newTaskData: Partial<Task>) => {
    const newTask: Task = {
      id: `tsk-${Date.now().toString().slice(-3)}`,
      workOrderId: newTaskData.workOrderId || '',
      title: newTaskData.title || '',
      description: newTaskData.description || '',
      assigneeId: newTaskData.assigneeId || currentUser.id,
      assigneeName: newTaskData.assigneeName || currentUser.name,
      priority: newTaskData.priority || 'Medium',
      deadline: newTaskData.deadline || '2026-09-25',
      status: newTaskData.status || 'To Do',
      attachmentsCount: 0,
      notesCount: 0,
      createdAt: new Date().toISOString().slice(0, 10)
    };

    setTasks(prev => [newTask, ...prev]);
    logActivity('Tambah Task Baru', newTask.title);
  };

  const handleUpdateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    logActivity('Update Status Task', `Task ${taskId} diubah ke ${status}`);
  };

  const handleAddWorkNote = (workOrderId: string, content: string) => {
    const newNote: WorkNote = {
      id: `not-${Date.now()}`,
      workOrderId,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setWorkNotes(prev => [newNote, ...prev]);
    logActivity('Tambah Catatan Pekerjaan', `WO ${workOrderId}`);
  };

  const handleUploadDocument = (newDocData: Partial<LegalDocument>) => {
    const newDoc: LegalDocument = {
      id: `doc-${Date.now().toString().slice(-3)}`,
      docNumber: `DOC-2026-0${documents.length + 85}`,
      title: newDocData.title || '',
      category: newDocData.category || 'Company Document',
      workOrderId: newDocData.workOrderId,
      workOrderNumber: newDocData.workOrderNumber,
      clientId: newDocData.clientId || '',
      clientName: newDocData.clientName || '',
      currentVersion: 1,
      fileType: 'PDF',
      fileSize: '1.5 MB',
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      accessLevel: newDocData.accessLevel || 'Restricted',
      versions: newDocData.versions || []
    };

    setDocuments(prev => [newDoc, ...prev]);
    logActivity('Upload Dokumen Legal', `${newDoc.docNumber} - ${newDoc.title}`);
    addNotification('Dokumen Diunggah', `Dokumen ${newDoc.title} telah diunggah oleh ${currentUser.name}`, 'system');
  };

  const handleRequestApproval = (workOrderId: string, type: 'Stage Completion' | 'Document Signoff' | 'Final WO Completion') => {
    const wo = workOrders.find(w => w.id === workOrderId);
    const newApp: ApprovalRequest = {
      id: `app-${Date.now().toString().slice(-3)}`,
      requestNumber: `APR-2026-0${approvals.length + 42}`,
      workOrderId,
      workOrderNumber: wo?.woNumber || 'WO-2026',
      workOrderTitle: `${wo?.serviceName} (${wo?.clientName})`,
      requestedBy: currentUser.name,
      requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      targetApproverRole: 'Manager/Supervisor',
      type,
      status: 'Pending',
      notes: `Mohon persetujuan ${type} dari Manager.`
    };

    setApprovals(prev => [newApp, ...prev]);
    logActivity('Minta Approval Manager', newApp.requestNumber);
    addNotification('Permintaan Approval Baru', `${currentUser.name} meminta approval untuk ${newApp.workOrderTitle}`, 'approval');
  };

  const handleDecisionSubmit = (approvalId: string, status: ApprovalStatus, comments: string) => {
    setApprovals(prev => prev.map(a => a.id === approvalId ? {
      ...a,
      status,
      approverName: currentUser.name,
      decisionDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      decisionComments: comments
    } : a));

    logActivity('Keputusan Approval Supervisor', `Approval ${approvalId} set status ${status}`);
    addNotification('Status Approval Diperbarui', `Approval ${approvalId} telah di-${status} oleh ${currentUser.name}`, 'approval');
  };

  const handleAddEvent = (newEventData: Partial<CalendarEvent>) => {
    const newEv: CalendarEvent = {
      id: `cal-${Date.now().toString().slice(-2)}`,
      title: newEventData.title || '',
      date: newEventData.date || '2026-09-25',
      type: newEventData.type || 'Deadline',
      priority: newEventData.priority || 'High'
    };
    setCalendarEvents(prev => [newEv, ...prev]);
    logActivity('Tambah Event Kalender', newEv.title);
  };

  const handleAddInvoice = (newInvData: Partial<Invoice>) => {
    const newInv: Invoice = {
      id: `inv-${Date.now().toString().slice(-2)}`,
      invoiceNumber: `INV-2026-000${invoices.length + 91}`,
      clientId: newInvData.clientId || '',
      clientName: newInvData.clientName || '',
      workOrderId: newInvData.workOrderId || '',
      workOrderNumber: newInvData.workOrderNumber || '',
      serviceName: newInvData.serviceName || '',
      amount: newInvData.amount || 5000000,
      taxAmount: newInvData.taxAmount || 550000,
      totalAmount: newInvData.totalAmount || 5550000,
      paidAmount: 0,
      issueDate: newInvData.issueDate || '2026-09-19',
      dueDate: newInvData.dueDate || '2026-10-01',
      status: 'Unpaid'
    };
    setInvoices(prev => [newInv, ...prev]);
    logActivity('Terbitkan Invoice', newInv.invoiceNumber);
    addNotification('Invoice Diterbitkan', `Invoice ${newInv.invoiceNumber} sebesar Rp ${newInv.totalAmount.toLocaleString('id-ID')} diterbitkan`, 'system');
  };

  const handleRecordPayment = (invoiceId: string, amount: number, method: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      const newPaid = inv.paidAmount + amount;
      const newStatus = newPaid >= inv.totalAmount ? 'Paid' : 'Partial';
      return {
        ...inv,
        paidAmount: newPaid,
        status: newStatus as InvoiceStatus,
        paymentMethod: method,
        lastPaymentDate: '2026-09-19'
      };
    }));
    logActivity('Pencatatan Pembayaran Invoice', `Invoice ${invoiceId} sebesar Rp ${amount.toLocaleString('id-ID')}`);
  };

  const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending').length;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingApprovalsCount={pendingApprovalsCount}
        userRole={currentUser.role}
      />

      {/* Main Content Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Sticky Header */}
        <Header
          currentUser={currentUser}
          users={users}
          onRoleChange={handleRoleChange}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onOpenNewWO={() => setActiveTab('workorders')}
          onOpenNewClient={() => setActiveTab('clients')}
          searchQuery={globalSearch}
          setSearchQuery={setGlobalSearch}
          activeTab={activeTab}
        />

        {/* Dynamic Views Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              workOrders={workOrders}
              clients={clients}
              tasks={tasks}
              approvals={approvals}
              activityLogs={activityLogs}
              users={users}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onSelectWorkOrder={(wo) => {
                setSelectedWoFromDashboard(wo);
                setActiveTab('workorders');
              }}
            />
          )}

          {activeTab === 'workorders' && (
            <WorkOrdersView
              workOrders={workOrders}
              clients={clients}
              services={services}
              tasks={tasks}
              documents={documents}
              workNotes={workNotes}
              userRole={currentUser.role}
              currentUserId={currentUser.id}
              onAddWorkOrder={handleAddWorkOrder}
              onUpdateWorkOrderStatus={handleUpdateWorkOrderStatus}
              onAdvanceWorkflowStage={handleAdvanceWorkflowStage}
              onAddTask={handleAddTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onAddWorkNote={handleAddWorkNote}
              onRequestApproval={handleRequestApproval}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsView
              clients={clients}
              workOrders={workOrders}
              documents={documents}
              onAddClient={handleAddClient}
              onSelectWorkOrder={(wo) => {
                setSelectedWoFromDashboard(wo);
                setActiveTab('workorders');
              }}
            />
          )}

          {activeTab === 'services' && (
            <ServicesView
              services={services}
              clients={clients}
              onAddService={handleAddService}
              onRequestServiceSubmit={handleRequestServiceSubmit}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              documents={documents}
              clients={clients}
              workOrders={workOrders}
              onUploadDocument={handleUploadDocument}
            />
          )}

          {activeTab === 'approvals' && (
            <ApprovalsView
              approvals={approvals}
              userRole={currentUser.role}
              currentUserName={currentUser.name}
              onDecisionSubmit={handleDecisionSubmit}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              events={calendarEvents}
              onAddEvent={handleAddEvent}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceView
              invoices={invoices}
              clients={clients}
              workOrders={workOrders}
              onAddInvoice={handleAddInvoice}
              onRecordPayment={handleRecordPayment}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              workOrders={workOrders}
              services={services}
              clients={clients}
              users={users}
            />
          )}

          {activeTab === 'audit' && (
            <AuditLogView
              activityLogs={activityLogs}
              users={users}
            />
          )}
        </main>
      </div>
    </div>
  );
}

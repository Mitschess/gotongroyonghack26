'use client';

import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
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
import TodaysActionsView from '../components/TodaysActionsView';
import WhatsAppHubView from '../components/WhatsAppHubView';
import AIFeaturesView from '../components/AIFeaturesView';
import ClientMobilePortalView from '../components/ClientMobilePortalView';
import NotaryPortalView from '../components/NotaryPortalView';
import PublicFormView from '../components/PublicFormView';
import MobileNav from '../components/MobileNav';
import LoginPage from '../components/LoginPage';

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
  INITIAL_INVOICES,
  INITIAL_WHATSAPP_MESSAGES
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
  InvoiceStatus,
  WhatsAppMessage,
  KtpOcrResult
} from '../types/legal';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default Super Admin / Login User
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
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>(INITIAL_WHATSAPP_MESSAGES);

  const [activeTab, setActiveTab] = useState<string>('todays_actions');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Selected Work Order for deep view
  const [selectedWoFromDashboard, setSelectedWoFromDashboard] = useState<WorkOrder | null>(null);

  // WA Toast Notification State
  const [waToast, setWaToast] = useState<{
    show: boolean;
    message: string;
    waLink: string;
  } | null>(null);

  // Helper to trigger automated WhatsApp Notification to +6281515716564
  const triggerWaNotification = async (woNumber: string, clientName: string, updateDetail: string) => {
    const targetPhone = '0815-1571-6564';
    const rawNumber = '6281515716564';
    const msgText = `🔔 *[LexiFlow WO Update]*\n📋 Work Order: *${woNumber}*\n🏢 Klien: *${clientName}*\n📌 Status: ${updateDetail}\n\nDiproses oleh: ${currentUser.name} (${currentUser.role})\n⏰ Waktu: ${new Date().toLocaleTimeString('id-ID')} WIB`;

    // 1. Dispatch into WhatsApp Messages state
    const newWaMsg: WhatsAppMessage = {
      id: `wa-${Date.now()}`,
      workOrderId: woNumber,
      workOrderNumber: woNumber,
      senderRole: 'Platform',
      senderName: 'System Bot LexiFlow (WA Gateway API)',
      maskedPhone: targetPhone,
      recipientRole: 'Client',
      messageText: msgText,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      resolutionMethod: 'SINGLE_ACTIVE',
      status: 'SENT'
    };

    setWhatsappMessages(prev => [newWaMsg, ...prev]);
    addNotification('WhatsApp Sent', `Notifikasi WO ${woNumber} dikirim ke ${targetPhone}`, 'whatsapp');

    // 2. Automated background POST request to API Route Gateway (/api/whatsapp/send)
    try {
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPhone: rawNumber,
          messageText: msgText,
          woNumber
        })
      });
    } catch (err) {
      console.log('WA Gateway background trigger:', err);
    }

    // 3. Show floating WA toast banner with direct link (Instant backup)
    const waUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent(msgText)}`;
    setWaToast({
      show: true,
      message: `WO ${woNumber}: ${updateDetail}`,
      waLink: waUrl
    });

    // Auto hide toast after 6 seconds
    setTimeout(() => {
      setWaToast(null);
    }, 6000);
  };

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

    // Switch default active tab based on role
    if (selectedUser.role === 'client') {
      setActiveTab('dashboard');
    } else if (selectedUser.role === 'notary') {
      setActiveTab('notary_tasks');
    } else if (activeTab === 'client_portal' || activeTab === 'notary_tasks') {
      setActiveTab('todays_actions');
    }
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

  const handleApplyOcrData = (ocrData: Partial<KtpOcrResult>) => {
    if (!ocrData.nama) return;
    handleAddClient({
      name: ocrData.nama,
      companyName: `PT ${ocrData.nama} Tech`,
      address: ocrData.alamat,
      notes: `Registrasi otomatis via OCR KTP NIK ${ocrData.nik}`
    });
    setActiveTab('clients');
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
      notaryId: newWoData.notaryId || 'usr-8',
      notaryName: newWoData.notaryName || 'Notaris Soebagjo, S.H., M.Kn.',
      priority: newWoData.priority || 'Medium',
      startDate: newWoData.startDate || new Date().toISOString().slice(0, 10),
      deadline: newWoData.deadline || '2026-10-10',
      status: newWoData.status || 'In Progress',
      health: newWoData.health || 'ON_TRACK',
      blockedOn: newWoData.blockedOn || 'NONE',
      currentStageIndex: newWoData.currentStageIndex || 0,
      progressPercent: newWoData.progressPercent || 20,
      estimatedPrice: newWoData.estimatedPrice || 5000000,
      description: newWoData.description || '',
      createdAt: new Date().toISOString().slice(0, 10),
      actionRequired: newWoData.actionRequired || 'Menunggu pemrosesan tim legal',
      clientActionItem: newWoData.clientActionItem || 'Tidak ada aksi yang diperlukan saat ini',
      workflow: newWoData.workflow || []
    };

    setWorkOrders(prev => [newWo, ...prev]);
    logActivity('Pembuatan Work Order', `${newWo.woNumber} - ${newWo.clientName}`);
    addNotification('Work Order Baru', `WO ${newWo.woNumber} ditugaskan kepada ${newWo.picStaffName}`, 'task');
    triggerWaNotification(newWo.woNumber, newWo.clientName, 'Work Order Baru Dibuat & Ditugaskan');
  };

  const handleUpdateWorkOrderStatus = (woId: string, status: WorkOrderStatus) => {
    const targetWo = workOrders.find(w => w.id === woId);
    setWorkOrders(prev => prev.map(w => w.id === woId ? { ...w, status } : w));
    logActivity('Perubahan Status WO', `WO ID ${woId} diubah ke ${status}`);
    if (targetWo) {
      triggerWaNotification(targetWo.woNumber, targetWo.clientName, `Status Diubah ke [${status}]`);
    }
  };

  const handleAdvanceWorkflowStage = (woId: string) => {
    const targetWo = workOrders.find(w => w.id === woId);
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
    if (targetWo) {
      const nextStageName = targetWo.workflow[Math.min(targetWo.currentStageIndex + 1, targetWo.workflow.length - 1)]?.stageName || 'Tahap Selanjutnya';
      triggerWaNotification(targetWo.woNumber, targetWo.clientName, `Tahap Berhasil Di-Advance ke [${nextStageName}]`);
    }
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
      fileType: newDocData.fileType || 'PDF',
      fileSize: newDocData.fileSize || '1.5 MB',
      uploadedBy: newDocData.uploadedBy || currentUser.name,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      accessLevel: newDocData.accessLevel || 'Restricted',
      versions: newDocData.versions || []
    };

    setDocuments(prev => [newDoc, ...prev]);
    logActivity('Upload Dokumen Legal', `${newDoc.docNumber} - ${newDoc.title}`);
    addNotification('Dokumen Diunggah', `Dokumen ${newDoc.title} telah diunggah oleh ${currentUser.name}`, 'system');
  };

  const handleSendWhatsappMessage = (msg: Partial<WhatsAppMessage>) => {
    const newMsg: WhatsAppMessage = {
      id: `wa-${Date.now()}`,
      workOrderId: msg.workOrderId || 'wo-101',
      workOrderNumber: msg.workOrderNumber || 'WO-2026-00101',
      senderRole: msg.senderRole || 'Platform',
      senderName: msg.senderName || currentUser.name,
      maskedPhone: msg.maskedPhone || '0811-0000-PROXY',
      recipientRole: msg.recipientRole || 'Client',
      messageText: msg.messageText || '',
      timestamp: msg.timestamp || 'Baru saja',
      resolutionMethod: msg.resolutionMethod || 'REPLY_CONTEXT',
      templateCode: msg.templateCode,
      status: msg.status || 'DELIVERED'
    };

    setWhatsappMessages(prev => [...prev, newMsg]);
    logActivity('Kirim WhatsApp Proxy Relay', `WO ${newMsg.workOrderNumber} ke ${newMsg.recipientRole}`);
    addNotification('WhatsApp Relay Sent', `Pesan WA ke ${newMsg.recipientRole} berhasil dikirim via proxy.`, 'whatsapp');
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
      targetApproverRole: 'admin',
      type,
      status: 'Pending',
      notes: `Mohon persetujuan ${type} dari Manager.`
    };

    setApprovals(prev => [newApp, ...prev]);
    logActivity('Minta Approval Manager', newApp.requestNumber);
    addNotification('Permintaan Approval Baru', `${currentUser.name} meminta approval untuk ${newApp.workOrderTitle}`, 'approval');
  };

  const handleDecisionSubmit = (approvalId: string, status: ApprovalStatus, comments: string) => {
    const targetApp = approvals.find(a => a.id === approvalId);
    setApprovals(prev => prev.map(a => a.id === approvalId ? {
      ...a,
      status,
      approverName: currentUser.name,
      decisionDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      decisionComments: comments
    } : a));

    logActivity('Keputusan Approval Supervisor', `Approval ${approvalId} set status ${status}`);
    addNotification('Status Approval Diperbarui', `Approval ${approvalId} telah di-${status} oleh ${currentUser.name}`, 'approval');
    if (targetApp) {
      triggerWaNotification(targetApp.workOrderNumber, targetApp.workOrderTitle, `Persetujuan Supervisor: [${status}] - "${comments}"`);
    }
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

  if (!isAuthenticated) {
    return (
      <LoginPage 
        users={users} 
        onLogin={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
          if (user.role === 'client') {
            setActiveTab('dashboard');
          } else if (user.role === 'notary') {
            setActiveTab('notary_tasks');
          } else if (user.role === 'finance') {
            setActiveTab('finance');
          } else {
            setActiveTab('todays_actions');
          }
          logActivity('User Login', `Berhasil masuk sebagai ${user.name} (${user.role})`);
        }} 
      />
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased">
      {/* Sidebar Navigation (Desktop Wide Screens) */}
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
          onLogout={() => setIsAuthenticated(false)}
        />

        {/* Dynamic Views Viewport */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-6">
          {activeTab === 'todays_actions' && (
            <TodaysActionsView
              workOrders={workOrders}
              tasks={tasks}
              documents={documents}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onSendWhatsappReminder={(woId, recipient, role) => {
                const wo = workOrders.find(w => w.id === woId);
                handleSendWhatsappMessage({
                  workOrderId: woId,
                  workOrderNumber: wo?.woNumber,
                  senderRole: 'Platform',
                  recipientRole: role as any,
                  messageText: `[Reminder ${wo?.woNumber}] Halo ${recipient}, mohon kelengkapan dokumen perizinan diselesaikan.`,
                  templateCode: 'wa_task_reminder'
                });
              }}
              onOpenReview={(woId) => {
                const wo = workOrders.find(w => w.id === woId);
                if (wo) {
                  setSelectedWoFromDashboard(wo);
                  setActiveTab('workorders');
                } else {
                  setActiveTab('approvals');
                }
              }}
            />
          )}

          {activeTab === 'public_form' && (
            <PublicFormView />
          )}

          {activeTab === 'whatsapp' && (
            <WhatsAppHubView
              workOrders={workOrders}
              messages={whatsappMessages}
              onSendMessage={handleSendWhatsappMessage}
            />
          )}

          {activeTab === 'ai' && (
            <AIFeaturesView
              workOrders={workOrders}
              documents={documents}
              onApplyOcrData={handleApplyOcrData}
            />
          )}

          {activeTab === 'client_portal' && (
            <ClientMobilePortalView
              workOrders={workOrders}
              documents={documents}
              clientName={currentUser.name}
              onUploadDoc={handleUploadDocument}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'notary_tasks' && (
            <NotaryPortalView
              workOrders={workOrders}
              tasks={tasks}
              notaryName={currentUser.name}
              onUploadDocument={handleUploadDocument}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              workOrders={workOrders}
              clients={clients}
              tasks={tasks}
              approvals={approvals}
              activityLogs={activityLogs}
              users={users}
              currentUser={currentUser}
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
              selectedWorkOrder={selectedWoFromDashboard}
              onClearSelectedWorkOrder={() => setSelectedWoFromDashboard(null)}
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

      {/* Floating Automated WA Notification Toast targeting wa.me/6281515716564 */}
      {waToast && waToast.show && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-emerald-500/50 max-w-md flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-base shrink-0 shadow-md">
              WA
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <p className="font-extrabold text-emerald-400">Notifikasi WA Terkirim ke +6281515716564</p>
              <p className="text-slate-300 truncate mt-0.5 font-medium">{waToast.message}</p>
            </div>
            <a
              href={waToast.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 transition-all flex items-center gap-1 shadow-sm"
            >
              <span>Buka WA</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <button 
              onClick={() => setWaToast(null)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Touch-Optimized Mobile Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingApprovalsCount={pendingApprovalsCount}
        userRole={currentUser.role}
      />
    </div>
  );
}


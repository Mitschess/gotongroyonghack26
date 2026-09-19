import { User, UserRole, WorkOrder, LegalDocument, Invoice, Task, NotificationItem } from '../types/legal';

export interface MenuItemPermission {
  id: string;
  label: string;
  roles: UserRole[];
}

// Master IAM Access Matrix across all Waktunya Legal tabs
export const IAM_TAB_PERMISSIONS: Record<string, UserRole[]> = {
  todays_actions: ['super_admin', 'admin', 'technical'],
  public_form:    ['super_admin', 'admin'],
  whatsapp:       ['super_admin', 'admin', 'technical', 'finance', 'notary', 'client'],
  notary_tasks:   ['notary'],
  dashboard:      ['super_admin', 'admin', 'technical', 'finance', 'notary', 'client'],
  workorders:     ['super_admin', 'admin', 'technical', 'client', 'notary'],
  clients:        ['super_admin', 'admin', 'technical', 'finance'],
  services:       ['super_admin', 'admin', 'client'],
  approvals:      ['super_admin', 'admin', 'technical'],
  calendar:       ['super_admin', 'admin', 'technical'],
  finance:        ['super_admin', 'admin', 'finance'],
  reports:        ['super_admin', 'admin', 'finance'],
  audit:          ['super_admin', 'admin'],
  client_portal:  ['super_admin', 'admin', 'client'],
};

// Default landing page by IAM role
export const IAM_DEFAULT_LANDING: Record<UserRole, string> = {
  super_admin: 'todays_actions',
  admin: 'todays_actions',
  technical: 'todays_actions',
  finance: 'finance',
  notary: 'notary_tasks',
  client: 'dashboard',
};

// Role Metadata & Display Labels
export const ROLE_DETAILS: Record<UserRole, { title: string; desc: string; badgeBg: string; badgeText: string }> = {
  super_admin: {
    title: 'Super Admin System',
    desc: 'Akses penuh ke seluruh modul, audit trail, keuangan, dan pengaturan sistem.',
    badgeBg: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    badgeText: 'Super Admin'
  },
  admin: {
    title: 'Legal Operational Manager',
    desc: 'Mengelola Work Order, persetujuan hirarki, data klien, dan laporan kinerja.',
    badgeBg: 'bg-blue-100 text-blue-700 border-blue-200',
    badgeText: 'Legal Manager'
  },
  technical: {
    title: 'Legal Staff / Specialist',
    desc: 'Fokus pada penyelesaian task, dokumen, integrasi AI/OCR, dan WA Proxy Hub.',
    badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    badgeText: 'Legal Staff'
  },
  finance: {
    title: 'Finance & Billing Officer',
    desc: 'Pengelolaan invoice, pencatatan pembayaran DP/pelunasan, dan laporan keuangan.',
    badgeBg: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    badgeText: 'Finance Officer'
  },
  notary: {
    title: 'Mitra Notaris Terkait',
    desc: 'Tampilan penugasan akta, minutasi, unggah berkas notaris, dan sinkronisasi WA.',
    badgeBg: 'bg-purple-100 text-purple-700 border-purple-200',
    badgeText: 'Mitra Notaris'
  },
  client: {
    title: 'Portal Klien (Perusahaan)',
    desc: 'Pantau status pengerjaan proyek legalitas, unduh berkas resmi, dan ajukan order.',
    badgeBg: 'bg-pink-100 text-pink-700 border-pink-200',
    badgeText: 'Portal Klien'
  }
};

/**
 * Check if a role can access a specific tab
 */
export function canAccessTab(role: UserRole, tabId: string): boolean {
  const allowed = IAM_TAB_PERMISSIONS[tabId];
  if (!allowed) return true;
  return allowed.includes(role);
}

/**
 * Filter Work Orders strictly based on IAM role and user context
 */
export function scopeWorkOrders(workOrders: WorkOrder[], user?: User): WorkOrder[] {
  if (!user) return workOrders;
  if (user.role === 'client') {
    return workOrders.filter(w => 
      w.clientId === user.linkedClientId || 
      w.clientName.toLowerCase().includes(user.name.split('(')[0].trim().toLowerCase())
    );
  }
  if (user.role === 'notary') {
    return workOrders.filter(w => 
      w.notaryId === user.id || 
      (w.notaryName && w.notaryName.toLowerCase().includes(user.name.toLowerCase()))
    );
  }
  return workOrders;
}

/**
 * Filter Legal Documents strictly based on IAM role and confidentiality level
 */
export function scopeDocuments(documents: LegalDocument[], user?: User, workOrders: WorkOrder[] = []): LegalDocument[] {
  if (!user) return documents;
  if (user.role === 'client') {
    return documents.filter(d => 
      d.clientId === user.linkedClientId && d.accessLevel !== 'Confidential'
    );
  }
  if (user.role === 'notary') {
    const assignedWoIds = workOrders.filter(w => w.notaryId === user.id || (w.notaryName && w.notaryName.includes(user.name))).map(w => w.id);
    return documents.filter(d => 
      d.accessLevel !== 'Confidential' && (!d.workOrderId || assignedWoIds.includes(d.workOrderId))
    );
  }
  if (user.role === 'finance') {
    return documents.filter(d => d.accessLevel !== 'Confidential');
  }
  return documents;
}

/**
 * Filter Invoices based on IAM role
 */
export function scopeInvoices(invoices: Invoice[], user?: User): Invoice[] {
  if (!user) return invoices;
  if (user.role === 'client') {
    return invoices.filter(i => i.clientId === user.linkedClientId);
  }
  return invoices;
}

/**
 * Check action permissions
 */
export function canManageClients(role: UserRole): boolean {
  return ['super_admin', 'admin', 'technical', 'finance'].includes(role);
}

export function canCreateWorkOrder(role: UserRole): boolean {
  return ['super_admin', 'admin', 'technical'].includes(role);
}

export function canApproveRequests(role: UserRole): boolean {
  return ['super_admin', 'admin'].includes(role);
}

export function canManageFinance(role: UserRole): boolean {
  return ['super_admin', 'admin', 'finance'].includes(role);
}

export function canManageServices(role: UserRole): boolean {
  return ['super_admin', 'admin', 'technical'].includes(role);
}

/**
 * Role-Based Scoping for Notifications
 */
export function scopeNotifications(notifications: NotificationItem[], user: User): NotificationItem[] {
  if (!user) return [];
  return notifications.filter(notif => {
    if (notif.targetRoles && notif.targetRoles.length > 0) {
      if (!notif.targetRoles.includes(user.role)) return false;
    }
    if (user.role === 'client') {
      if (notif.targetClientId && notif.targetClientId !== user.linkedClientId) return false;
      if (!notif.targetRoles && (notif.type === 'approval' || notif.type === 'task')) return false;
    }
    if (user.role === 'notary') {
      if (notif.type === 'approval' && !notif.targetRoles?.includes('notary')) return false;
    }
    if (user.role === 'finance') {
      if (notif.type === 'task' || notif.type === 'approval') {
        if (!notif.targetRoles?.includes('finance')) return false;
      }
    }
    return true;
  });
}

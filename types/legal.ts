export type UserRole = 
  | 'super_admin' 
  | 'admin' 
  | 'technical' 
  | 'finance' 
  | 'notary' 
  | 'client';


export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  phone?: string;
  linkedClientId?: string; // For role=client: links to Client.id
  linkedNotaryId?: string; // For role=notary: matches WorkOrder.notaryId
}

export type ClientType = 'PT' | 'CV' | 'PMA' | 'Perorangan' | 'Yayasan' | 'Lainnya';

export interface Client {
  id: string;
  clientCode: string;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  address: string;
  type: ClientType;
  picName: string;
  picPhone: string;
  notes: string;
  createdAt: string;
  status: 'Active' | 'Inactive';
}

export interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface Service {
  id: string;
  serviceCode: string;
  name: string;
  description: string;
  estimatedDays: number;
  price: number;
  requiredDocuments: string[];
  workflowStages: WorkflowStage[];
  status: 'Active' | 'Archived';
}

export type WorkOrderStatus = 'Draft' | 'To Do' | 'In Progress' | 'Review' | 'Completed' | 'Blocked' | 'Cancelled';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type SlaHealth = 'ON_TRACK' | 'WARNING' | 'HIGH_RISK' | 'CRITICAL';
export type BlockedOn = 'CLIENT' | 'NOTARY' | 'ADMIN' | 'SYSTEM' | 'EXTERNAL' | 'NONE';

export interface Task {
  id: string;
  workOrderId: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  priority: Priority;
  deadline: string;
  status: 'To Do' | 'In Progress' | 'Review' | 'Completed' | 'Blocked' | 'Cancelled' | 'Rejected';
  attachmentsCount: number;
  notesCount: number;
  createdAt: string;
  targetRole?: 'Legal Staff' | 'Notary' | 'Client' | 'Admin';
  expectedDocType?: string;
}

export interface WorkOrderWorkflow {
  stageId: string;
  stageName: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  clientFriendlyLabel?: string;
}

export interface WorkOrder {
  id: string;
  woNumber: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  picStaffId: string;
  picStaffName: string;
  notaryId?: string;
  notaryName?: string;
  priority: Priority;
  startDate: string;
  deadline: string;
  status: WorkOrderStatus;
  health: SlaHealth;
  blockedOn: BlockedOn;
  currentStageIndex: number;
  workflow: WorkOrderWorkflow[];
  progressPercent: number;
  estimatedPrice: number;
  description: string;
  createdAt: string;
  actionRequired?: string;
  clientActionItem?: string;
}

export type DocumentCategory = 
  | 'Identity' 
  | 'Company Document' 
  | 'License' 
  | 'Contract' 
  | 'Government Document' 
  | 'Supporting Document' 
  | 'Other';

export interface DocumentVersion {
  version: number;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  notes?: string;
}

export interface LegalDocument {
  id: string;
  docNumber: string;
  title: string;
  category: DocumentCategory;
  workOrderId?: string;
  workOrderNumber?: string;
  clientId: string;
  clientName: string;
  currentVersion: number;
  fileType: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  versions: DocumentVersion[];
  accessLevel: 'Public' | 'Restricted' | 'Confidential';
  aiConfidence?: number;
  aiClassification?: string;
  verificationStatus?: 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED';
}

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Revision Required';

export interface ApprovalRequest {
  id: string;
  requestNumber: string;
  workOrderId: string;
  workOrderNumber: string;
  workOrderTitle: string;
  requestedBy: string;
  requestedAt: string;
  targetApproverRole: UserRole;
  approverName?: string;
  documentId?: string;
  documentTitle?: string;
  type: 'Document Signoff' | 'Stage Completion' | 'Final WO Completion' | 'Price Exception';
  status: ApprovalStatus;
  notes?: string;
  decisionDate?: string;
  decisionComments?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'Deadline' | 'Task' | 'Meeting' | 'Government Submission';
  priority: Priority;
  relatedWoId?: string;
  relatedWoNumber?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'task' | 'approval' | 'deadline' | 'system' | 'whatsapp';
  linkTarget?: string;
}

export interface WorkNote {
  id: string;
  workOrderId: string;
  authorName: string;
  authorRole: string;
  content: string;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  targetObject: string;
  timestamp: string;
  ipAddress?: string;
}

export type InvoiceStatus = 'Unpaid' | 'Partial' | 'Paid' | 'Overdue' | 'Cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  workOrderId: string;
  workOrderNumber: string;
  serviceName: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentMethod?: string;
  lastPaymentDate?: string;
}

export interface WhatsAppMessage {
  id: string;
  workOrderId: string;
  workOrderNumber: string;
  senderRole: 'Client' | 'Notary' | 'Platform' | 'System';
  senderName: string;
  maskedPhone: string;
  recipientRole: 'Client' | 'Notary' | 'Admin';
  messageText: string;
  timestamp: string;
  resolutionMethod: 'REPLY_CONTEXT' | 'EXPLICIT_CODE' | 'SINGLE_ACTIVE' | 'ASK_USER';
  templateCode?: string;
  status: 'DELIVERED' | 'SENT' | 'PENDING_RESOLUTION' | 'NEEDS_REVIEW';
}

export interface KtpOcrResult {
  nik: string;
  nama: string;
  alamat: string;
  tanggalLahir: string;
  confidence: number;
  status: 'SUCCESS' | 'NEEDS_VERIFICATION';
}


// TypeScript type definitions for CA Connect

export type UserRole = 'ADMIN' | 'CLIENT';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  clientProfile?: ClientProfile;
}

export interface ClientProfile {
  id: string;
  userId: string;
  clientCode: string;
  firmName?: string;
  address?: string;
  panNumber?: string;
  gstin?: string;
  gstState?: string;
  adminId: string;
  createdAt: string;
}

export type ServiceStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';

export interface Service {
  id: string;
  clientProfileId: string;
  name: string;
  description?: string;
  status: ServiceStatus;
  startDate: string;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  client?: User;
}

export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  clientProfileId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  taxRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  notes?: string;
  pdfUrl?: string;
  sentAt?: string;
  paidAt?: string;
  viewedAt?: string;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
  client?: User;
}

export type DocumentStatus =
  | 'REQUESTED'
  | 'UPLOADED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export interface Document {
  id: string;
  documentRequestId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface DocumentRequest {
  id: string;
  clientProfileId: string;
  name: string;
  description?: string;
  status: DocumentStatus;
  adminComment?: string;
  dueDate?: string;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
  client?: User;
}

export type AppointmentStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'RESCHEDULED';

export interface Appointment {
  id: string;
  clientProfileId: string;
  title: string;
  description?: string;
  requestedDate: string;
  confirmedDate?: string;
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  meetingLink?: string;
  cancelledReason?: string;
  createdAt: string;
  updatedAt: string;
  client?: User;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  readAt?: string;
  createdAt: string;
  sender?: User;
}

export interface Conversation {
  id: string;
  clientProfileId: string;
  lastMessageAt?: string;
  client: User;
  lastMessage?: Message;
  unreadCount?: number;
}

export type NotificationType =
  | 'DOCUMENT_UPLOADED'
  | 'APPOINTMENT_BOOKED'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_REJECTED'
  | 'APPOINTMENT_CANCELLED'
  | 'INVOICE_GENERATED'
  | 'INVOICE_PAID'
  | 'INVOICE_VIEWED'
  | 'MESSAGE_RECEIVED'
  | 'SERVICE_UPDATED'
  | 'DOCUMENT_APPROVED'
  | 'DOCUMENT_REJECTED'
  | 'PAYMENT_RECEIVED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: 'FILING_DEADLINE' | 'TAX_DEADLINE' | 'MEETING' | 'REMINDER';
  clientId?: string;
  isGlobal: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// Dashboard stats types
export interface AdminDashboardStats {
  totalClients: number;
  pendingDocuments: number;
  pendingInvoices: number;
  upcomingDeadlines: number;
  todayAppointments: number;
  recentActivities: ActivityItem[];
}

export interface ClientDashboardStats {
  activeServices: number;
  pendingDocuments: number;
  upcomingDeadlines: number;
  upcomingAppointments: number;
  unreadNotifications: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface AddClientForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  firmName?: string;
  panNumber?: string;
  gstin?: string;
  gstState?: string;
  address?: string;
  password: string;
}

export interface ServiceForm {
  name: string;
  description?: string;
  status: ServiceStatus;
  startDate: string;
  dueDate?: string;
  notes?: string;
}

export interface InvoiceForm {
  clientProfileId: string;
  dueDate: string;
  taxRate: number;
  notes?: string;
  items: Omit<InvoiceItem, 'id' | 'invoiceId'>[];
}

export interface AppointmentBookingForm {
  title: string;
  description?: string;
  requestedDate: string;
  duration?: number;
}

export interface DocumentRequestForm {
  name: string;
  description?: string;
  dueDate?: string;
}

export interface ProfileUpdateForm {
  firstName: string;
  lastName: string;
  phone?: string;
  firmName?: string;
  panNumber?: string;
  gstin?: string;
  address?: string;
}

export type LoginCredentials = LoginForm;
export type AuthResponse = ApiResponse<LoginResponse>;


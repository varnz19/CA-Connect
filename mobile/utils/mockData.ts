import {
  User,
  Service,
  Invoice,
  DocumentRequest,
  Appointment,
  Notification,
  Conversation,
  Message,
  AdminDashboardStats,
  ClientDashboardStats,
} from '../types';

// ─── Mock Users ────────────────────────────────────────────────────────────────

export const mockAdminUser: User = {
  id: 'admin-001',
  email: 'admin@caconnect.in',
  role: 'ADMIN',
  firstName: 'CA',
  lastName: 'Admin',
  phone: '+91-9876543210',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
};

export const mockClients: User[] = [
  {
    id: 'client-001',
    email: 'rajesh.kumar@example.com',
    role: 'CLIENT',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    phone: '+91-9876543210',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    clientProfile: {
      id: 'cp-001',
      userId: 'client-001',
      clientCode: 'CAC1001',
      firmName: 'Rajesh Kumar & Co.',
      panNumber: 'ABCDE1234F',
      gstin: '27ABCDE1234F1Z5',
      gstState: 'Maharashtra',
      address: '123 Business Rd, Nariman Point, Mumbai - 400021',
      adminId: 'admin-001',
      createdAt: '2024-01-15T00:00:00Z',
    },
  },
  {
    id: 'client-002',
    email: 'aluruvarnika@gmail.com',
    role: 'CLIENT',
    firstName: 'Varnika',
    lastName: 'User',
    phone: '+91-9876500002',
    isActive: true,
    createdAt: '2024-02-10T00:00:00Z',
    clientProfile: {
      id: 'cp-002',
      userId: 'client-002',
      clientCode: 'CAC002',
      firmName: 'Varnika & Co.',
      panNumber: 'FGHIJ5678K',
      gstin: '27FGHIJ5678K1Z2',
      gstState: 'Maharashtra',
      adminId: 'admin-001',
      createdAt: '2024-02-10T00:00:00Z',
    },
  },
];

// ─── Clean Data Arrays (No Sample Data) ─────────────────────────────────────────

export const mockServices: Service[] = [];

export const mockInvoices: Invoice[] = [];

export const mockDocumentRequests: DocumentRequest[] = [];

export const mockAppointments: Appointment[] = [];

export const mockMessages: Message[] = [];

export const mockConversations: Conversation[] = [];

export const mockAdminNotifications: Notification[] = [];

export const mockClientNotifications: Notification[] = [];

// ─── Mock Dashboard Initializers ───────────────────────────────────────────────

export const mockAdminDashboard: AdminDashboardStats = {
  totalClients: 1,
  pendingDocuments: 0,
  pendingInvoices: 0,
  upcomingDeadlines: 0,
  todayAppointments: 0,
  recentActivities: [],
};

export const mockClientDashboard: ClientDashboardStats = {
  activeServices: 0,
  pendingDocuments: 0,
  upcomingDeadlines: 0,
  upcomingAppointments: 0,
  unreadNotifications: 0,
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '../services/clientService';
import { serviceService } from '../services/serviceService';
import { invoiceService } from '../services/invoiceService';
import { documentService } from '../services/documentService';
import { appointmentService } from '../services/appointmentService';
import { messageService } from '../services/messageService';
import { notificationService } from '../services/notificationService';
import { calendarService } from '../services/calendarService';

// --- Client Hooks ---
export function useClients(search?: string) {
  return useQuery({
    queryKey: ['clients', search],
    queryFn: () => clientService.getClients(search),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => clientService.getClient(id),
    enabled: !!id,
  });
}

// --- Service Hooks ---
export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => serviceService.getServices(),
  });
}

// --- Invoice Hooks ---
export function useInvoices(status?: string) {
  return useQuery({
    queryKey: ['invoices', status],
    queryFn: () => invoiceService.getInvoices(status),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceService.getInvoice(id),
    enabled: !!id,
  });
}

// --- Document Hooks ---
export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.getDocumentRequests(),
  });
}

// --- Appointment Hooks ---
export function useAppointments() {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentService.getAppointments(),
  });
}

// --- Message Hooks ---
export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageService.getConversations(),
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => messageService.getMessages(conversationId),
    enabled: !!conversationId,
  });
}

// --- Notification Hooks ---
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
  });
}

// --- Calendar Hooks ---
export function useCalendarEvents() {
  return useQuery({
    queryKey: ['calendar-events'],
    queryFn: () => calendarService.getEvents(),
  });
}

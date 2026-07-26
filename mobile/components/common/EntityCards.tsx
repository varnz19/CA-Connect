import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppCard } from './AppCard';
import { StatusStamp } from './StatusStamp';
import { AppBadge } from './AppBadge';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface InvoiceCardProps {
  invoice: Invoice;
  onPress?: () => void;
  showClient?: boolean;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onPress, showClient = true }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <AppCard style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            {showClient && invoice.client && (
              <Text style={styles.clientName}>
                {invoice.client.firstName} {invoice.client.lastName}
                {invoice.client.clientProfile?.firmName
                  ? ` • ${invoice.client.clientProfile.firmName}`
                  : ''}
              </Text>
            )}
          </View>
          <StatusStamp status={invoice.status} />
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.metaLabel}>Issue Date</Text>
            <Text style={styles.metaValue}>{formatDate(invoice.issueDate)}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text style={[styles.metaValue, invoice.status === 'OVERDUE' && styles.overdueText]}>
              {formatDate(invoice.dueDate)}
            </Text>
          </View>
          <View style={[styles.col, { alignItems: 'flex-end' }]}>
            <Text style={styles.metaLabel}>Amount</Text>
            <Text style={styles.amount}>{formatCurrency(invoice.total)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <MaterialIcons name="receipt" size={14} color={Colors.textTertiary} />
            <Text style={styles.footerText}>{invoice.items.length} item(s)</Text>
          </View>
          {invoice.paidAt && (
            <View style={styles.footerRow}>
              <MaterialIcons name="check-circle" size={14} color={Colors.success} />
              <Text style={[styles.footerText, { color: Colors.success }]}>
                Paid on {formatDate(invoice.paidAt)}
              </Text>
            </View>
          )}
        </View>
      </AppCard>
    </TouchableOpacity>
  );
};

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    description?: string;
    status: string;
    dueDate?: string;
    client?: { firstName: string; lastName: string };
  };
  onPress?: () => void;
  showClient?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onPress, showClient = true }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <AppCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.serviceIcon}>
            <MaterialIcons name="work-outline" size={20} color={Colors.primary} />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{service.name}</Text>
            {showClient && service.client && (
              <Text style={styles.clientName}>
                {service.client.firstName} {service.client.lastName}
              </Text>
            )}
            {service.description && (
              <Text style={styles.serviceDesc} numberOfLines={2}>{service.description}</Text>
            )}
          </View>
          <StatusStamp status={service.status} />
        </View>
        {service.dueDate && (
          <View style={styles.dueDateRow}>
            <MaterialIcons name="schedule" size={12} color={Colors.textTertiary} />
            <Text style={styles.dueText}>Due: {formatDate(service.dueDate)}</Text>
          </View>
        )}
      </AppCard>
    </TouchableOpacity>
  );
};

interface DocumentCardProps {
  doc: {
    id: string;
    name: string;
    description?: string;
    status: string;
    dueDate?: string;
    adminComment?: string;
    client?: { firstName: string; lastName: string };
  };
  onPress?: () => void;
  showClient?: boolean;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onPress, showClient = true }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <AppCard style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.serviceIcon, styles.docIcon]}>
            <MaterialIcons name="folder-open" size={20} color={Colors.secondary} />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{doc.name}</Text>
            {showClient && doc.client && (
              <Text style={styles.clientName}>
                {doc.client.firstName} {doc.client.lastName}
              </Text>
            )}
            {doc.description && (
              <Text style={styles.serviceDesc} numberOfLines={1}>{doc.description}</Text>
            )}
          </View>
          <StatusStamp status={doc.status} />
        </View>
        {doc.adminComment && (
          <View style={styles.commentBox}>
            <MaterialIcons name="comment" size={12} color={Colors.textSecondary} />
            <Text style={styles.commentText} numberOfLines={2}>{doc.adminComment}</Text>
          </View>
        )}
        {doc.dueDate && (
          <View style={styles.dueDateRow}>
            <MaterialIcons name="schedule" size={12} color={Colors.textTertiary} />
            <Text style={styles.dueText}>Due: {formatDate(doc.dueDate)}</Text>
          </View>
        )}
      </AppCard>
    </TouchableOpacity>
  );
};

interface AppointmentCardProps {
  appointment: {
    id: string;
    title: string;
    description?: string;
    requestedDate: string;
    confirmedDate?: string;
    duration: number;
    status: string;
    client?: { firstName: string; lastName: string };
  };
  onPress?: () => void;
  showClient?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onPress,
  showClient = true,
}) => {
  const dateToShow = appointment.confirmedDate || appointment.requestedDate;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <AppCard style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.serviceIcon, styles.aptIcon]}>
            <MaterialIcons name="event" size={20} color={Colors.success} />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{appointment.title}</Text>
            {showClient && appointment.client && (
              <Text style={styles.clientName}>
                {appointment.client.firstName} {appointment.client.lastName}
              </Text>
            )}
            <View style={styles.aptMeta}>
              <MaterialIcons name="schedule" size={12} color={Colors.textTertiary} />
              <Text style={styles.dueText}>
                {formatDate(dateToShow, true)} • {appointment.duration} min
              </Text>
            </View>
          </View>
          <StatusStamp status={appointment.status} />
        </View>
      </AppCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  invoiceNumber: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.base,
    color: Colors.primary,
  },
  clientName: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
  },
  metaLabel: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  amount: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.lg,
    color: Colors.primary,
  },
  overdueText: {
    color: Colors.danger,
  },
  footer: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  serviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  docIcon: {
    backgroundColor: 'transparent',
  },
  aptIcon: {
    backgroundColor: 'transparent',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.primary,
  },
  serviceDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  dueText: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  commentBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    backgroundColor: Colors.background,
    borderLeftWidth: 2,
    borderLeftColor: Colors.warning,
    padding: Spacing.sm,
  },
  commentText: {
    flex: 1,
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  aptMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
});

export { formatCurrency, formatDate };

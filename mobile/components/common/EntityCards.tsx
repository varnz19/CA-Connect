import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppBadge } from './AppBadge';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

// ─── Dense hairline-row list items ──────────────────────────────────────────
// No card wrappers. Each row separated by hairline rule.
// Primary label left-aligned, status tag + mono meta right-aligned.

interface InvoiceCardProps {
  invoice: Invoice;
  onPress?: () => void;
  showClient?: boolean;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onPress, showClient = true }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.refNumber}>{invoice.invoiceNumber}</Text>
        {showClient && invoice.client && (
          <Text style={styles.secondaryText} numberOfLines={1}>
            {invoice.client.firstName} {invoice.client.lastName}
            {invoice.client.clientProfile?.firmName
              ? ` · ${invoice.client.clientProfile.firmName}`
              : ''}
          </Text>
        )}
        <Text style={styles.metaDate}>{formatDate(invoice.issueDate)}</Text>
      </View>

      <View style={styles.rowRight}>
        <Text style={styles.amount}>{formatCurrency(invoice.total)}</Text>
        <AppBadge status={invoice.status} />
      </View>
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
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.primaryText}>{service.name}</Text>
        {showClient && service.client && (
          <Text style={styles.secondaryText} numberOfLines={1}>
            {service.client.firstName} {service.client.lastName}
          </Text>
        )}
        {service.dueDate && (
          <Text style={styles.metaDate}>Due {formatDate(service.dueDate)}</Text>
        )}
      </View>

      <View style={styles.rowRight}>
        <AppBadge status={service.status} />
      </View>
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
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.primaryText}>{doc.name}</Text>
        {showClient && doc.client && (
          <Text style={styles.secondaryText} numberOfLines={1}>
            {doc.client.firstName} {doc.client.lastName}
          </Text>
        )}
        {doc.dueDate && (
          <Text style={styles.metaDate}>Due {formatDate(doc.dueDate)}</Text>
        )}
      </View>

      <View style={styles.rowRight}>
        <AppBadge status={doc.status} />
      </View>
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
    clientProfile?: {
      firmName?: string;
      user?: { firstName: string; lastName: string };
    };
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
  const clientUser = appointment.client || appointment.clientProfile?.user;
  const clientName = clientUser
    ? `${clientUser.firstName} ${clientUser.lastName}`
    : (appointment.clientProfile?.firmName || '');

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.primaryText}>{appointment.title}</Text>
        {showClient && !!clientName && (
          <Text style={styles.secondaryText} numberOfLines={1}>
            Client: {clientName}
          </Text>
        )}
        <Text style={styles.metaDate}>
          {formatDate(dateToShow, true)} · {appointment.duration} min
        </Text>
      </View>

      <View style={styles.rowRight}>
        <AppBadge status={appointment.status} />
        {appointment.status === 'REQUESTED' && (
          <Text style={styles.actionPrompt}>Review & Confirm</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Clean modern card item
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  rowLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },

  // Typography
  refNumber: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.base,
    color: Colors.primaryLight,
  },
  primaryText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  secondaryText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  metaDate: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginTop: 3,
  },
  amount: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
  },
  actionPrompt: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
    color: Colors.warningDark || '#D97706',
    marginTop: 2,
  },
});


export { formatCurrency, formatDate };

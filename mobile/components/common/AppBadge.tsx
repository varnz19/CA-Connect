import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

type BadgeVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

// Status to variant mappings
const STATUS_VARIANT_MAP: Record<string, BadgeVariant> = {
  // Invoice
  PAID: 'success',
  PENDING: 'warning',
  OVERDUE: 'danger',
  CANCELLED: 'neutral',

  // Service
  ACTIVE: 'primary',
  COMPLETED: 'success',
  PAUSED: 'warning',

  // Document
  APPROVED: 'success',
  REJECTED: 'danger',
  UPLOADED: 'info',
  UNDER_REVIEW: 'warning',
  REQUESTED: 'neutral',

  // Appointment
  CONFIRMED: 'success',
  RESCHEDULED: 'warning',
};

const STATUS_LABEL_MAP: Record<string, string> = {
  PAID: 'Paid',
  PENDING: 'Pending',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  PAUSED: 'Paused',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  UPLOADED: 'Uploaded',
  UNDER_REVIEW: 'Under Review',
  REQUESTED: 'Requested',
  CONFIRMED: 'Confirmed',
  RESCHEDULED: 'Rescheduled',
};

interface AppBadgeProps {
  status?: string;
  label?: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export const AppBadge: React.FC<AppBadgeProps> = ({ status, label, variant, style }) => {
  const resolvedVariant = variant || (status ? STATUS_VARIANT_MAP[status] : 'neutral') || 'neutral';
  const resolvedLabel = label || (status ? STATUS_LABEL_MAP[status] : '') || status || '';

  return (
    <View style={[styles.badge, styles[resolvedVariant], style]}>
      <Text style={[styles.text, styles[`text_${resolvedVariant}` as keyof typeof styles]]}>
        {resolvedLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs - 1,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    letterSpacing: Typography.letterSpacing.wide,
  },

  // Variants
  primary: { backgroundColor: Colors.statusActive },
  success: { backgroundColor: Colors.statusPaid },
  warning: { backgroundColor: Colors.statusPending },
  danger: { backgroundColor: Colors.statusOverdue },
  info: { backgroundColor: Colors.infoLight },
  neutral: { backgroundColor: Colors.backgroundInput },

  // Text colors
  text_primary: { color: Colors.statusActiveText },
  text_success: { color: Colors.statusPaidText },
  text_warning: { color: Colors.statusPendingText },
  text_danger: { color: Colors.statusOverdueText },
  text_info: { color: Colors.infoDark },
  text_neutral: { color: Colors.textSecondary },
});

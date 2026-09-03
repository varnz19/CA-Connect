import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';

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
  UNDER_REVIEW: 'Under review',
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

// Text-only / minimal pill status tag — no colored backgrounds, 
// just a thin border and mono-type text
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
    paddingVertical: 2,
    borderRadius: 4,             // Consistent 4px, not pill
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 10,
    letterSpacing: Typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },

  // Variants — thin border, transparent or very subtle background
  primary: {
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  success: {
    borderColor: Colors.success,
    backgroundColor: 'transparent',
  },
  warning: {
    borderColor: Colors.secondary,    // Brass for active/pending
    backgroundColor: 'transparent',
  },
  danger: {
    borderColor: Colors.danger,
    backgroundColor: 'transparent',
  },
  info: {
    borderColor: Colors.primaryLight,
    backgroundColor: 'transparent',
  },
  neutral: {
    borderColor: Colors.border,
    backgroundColor: 'transparent',
  },

  // Text colors — muted, not loud
  text_primary: { color: Colors.primary },
  text_success: { color: Colors.success },
  text_warning: { color: Colors.secondary },    // Brass text
  text_danger: { color: Colors.danger },
  text_info: { color: Colors.primaryLight },
  text_neutral: { color: Colors.textSecondary },
});

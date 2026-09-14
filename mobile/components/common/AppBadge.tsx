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

// Colorful, modern status pill badge
export const AppBadge: React.FC<AppBadgeProps> = ({ status, label, variant, style }) => {
  const resolvedVariant = variant || (status ? STATUS_VARIANT_MAP[status] : 'neutral') || 'neutral';
  const resolvedLabel = label || (status ? STATUS_LABEL_MAP[status] : '') || status || '';

  return (
    <View style={[styles.badge, styles[resolvedVariant] as ViewStyle, style]}>
      <View style={[styles.dot, styles[`dot_${resolvedVariant}` as keyof typeof styles] as ViewStyle]} />
      <Text style={[styles.text, styles[`text_${resolvedVariant}` as keyof typeof styles]]}>
        {resolvedLabel}
      </Text>
    </View>
  );
};


const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 11,
    letterSpacing: 0.3,
  },

  // Variants — Colorful background and subtle border
  primary: {
    borderColor: '#BFDBFE',
    backgroundColor: Colors.primarySoft,
  },
  success: {
    borderColor: Colors.successBorder,
    backgroundColor: Colors.successLight,
  },
  warning: {
    borderColor: Colors.warningBorder,
    backgroundColor: Colors.warningLight,
  },
  danger: {
    borderColor: Colors.dangerBorder,
    backgroundColor: Colors.dangerLight,
  },
  info: {
    borderColor: Colors.infoBorder,
    backgroundColor: Colors.infoLight,
  },
  neutral: {
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundSubtle,
  },

  // Dot colors
  dot_primary: { backgroundColor: Colors.primaryLight },
  dot_success: { backgroundColor: Colors.success },
  dot_warning: { backgroundColor: Colors.warning },
  dot_danger: { backgroundColor: Colors.danger },
  dot_info: { backgroundColor: Colors.info },
  dot_neutral: { backgroundColor: Colors.textTertiary },

  // Text colors — Vibrant & crisp
  text_primary: { color: Colors.primaryLight },
  text_success: { color: Colors.successDark },
  text_warning: { color: Colors.warningDark },
  text_danger: { color: Colors.dangerDark },
  text_info: { color: Colors.infoDark },
  text_neutral: { color: Colors.textSecondary },
});


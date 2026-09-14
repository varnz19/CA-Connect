import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';

export type StampStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

interface StatusStampProps {
  status: StampStatus | string;
  style?: any;
}

const getStatusColors = (status: string) => {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case 'PENDING':
      return { border: Colors.warningBorder, bg: Colors.warningLight, text: Colors.warningDark };
    case 'PAID':
    case 'COMPLETED':
    case 'ACTIVE':
    case 'CONFIRMED':
    case 'APPROVED':
      return { border: Colors.successBorder, bg: Colors.successLight, text: Colors.successDark };
    case 'OVERDUE':
    case 'CANCELLED':
    case 'REJECTED':
      return { border: Colors.dangerBorder, bg: Colors.dangerLight, text: Colors.dangerDark };
    case 'UPLOADED':
    case 'UNDER_REVIEW':
      return { border: Colors.infoBorder, bg: Colors.infoLight, text: Colors.infoDark };
    case 'REQUESTED':
    case 'RESCHEDULED':
      return { border: Colors.border, bg: Colors.backgroundSubtle, text: Colors.textSecondary };
    default:
      return { border: Colors.border, bg: Colors.backgroundSubtle, text: Colors.textSecondary };
  }
};

const STATUS_LABELS: Record<string, string> = {
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

// Colorful, rounded status tag
export const StatusStamp = ({ status, style }: StatusStampProps) => {
  const colors = getStatusColors(status);
  const label = STATUS_LABELS[status.toUpperCase()] || status;

  return (
    <View style={[styles.tag, { borderColor: colors.border, backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
});


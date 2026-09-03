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
      return { border: Colors.secondary, text: Colors.secondary };
    case 'PAID':
    case 'COMPLETED':
    case 'ACTIVE':
    case 'CONFIRMED':
    case 'APPROVED':
      return { border: Colors.success, text: Colors.success };
    case 'OVERDUE':
    case 'CANCELLED':
    case 'REJECTED':
      return { border: Colors.danger, text: Colors.danger };
    case 'UPLOADED':
    case 'UNDER_REVIEW':
    case 'REQUESTED':
    case 'RESCHEDULED':
      return { border: Colors.textSecondary, text: Colors.textSecondary };
    default:
      return { border: Colors.textSecondary, text: Colors.textSecondary };
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

// Plain text tag — no double-ring stamp, no rotation, no decoration
export const StatusStamp = ({ status, style }: StatusStampProps) => {
  const colors = getStatusColors(status);
  const label = STATUS_LABELS[status.toUpperCase()] || status;

  return (
    <View style={[styles.tag, { borderColor: colors.border }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 10,
    letterSpacing: Typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
});

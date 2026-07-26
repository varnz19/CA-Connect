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
      return { border: Colors.warning, text: Colors.warning };
    case 'PAID':
    case 'COMPLETED':
    case 'ACTIVE':
      return { border: Colors.success, text: Colors.success };
    case 'OVERDUE':
    case 'CANCELLED':
    case 'REJECTED':
      return { border: Colors.danger, text: Colors.danger };
    default:
      return { border: Colors.textSecondary, text: Colors.textSecondary };
  }
};

export const StatusStamp = ({ status, style }: StatusStampProps) => {
  const colors = getStatusColors(status);
  
  return (
    <View style={[styles.outerRing, { borderColor: colors.border }, style]}>
      <View style={[styles.innerRing, { borderColor: colors.border }]}>
        <Text style={[styles.text, { color: colors.text }]}>
          {status.toUpperCase()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerRing: {
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 2,
    alignSelf: 'flex-start',
    transform: [{ rotate: '-3deg' }], // Slight rotation for the stamp effect
  },
  innerRing: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: Typography.fontFamily.monoSemiBold,
    fontSize: Typography.size.xs,
    letterSpacing: Typography.letterSpacing.wider,
  },
});

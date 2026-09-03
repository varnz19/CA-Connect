import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AppButton } from './AppButton';
import { Colors, Typography, Spacing } from '../../constants/theme';

// ─── Empty state: plain text, no illustration, no icon ──────────────────────

interface AppEmptyProps {
  icon?: string; // kept for API compat but not rendered
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const AppEmpty: React.FC<AppEmptyProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <AppButton
          title={actionLabel}
          onPress={onAction}
          variant="outline"
          style={styles.button}
          size="sm"
        />
      )}
    </View>
  );
};

// ─── Error state ────────────────────────────────────────────────────────────

interface AppErrorProps {
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const AppError: React.FC<AppErrorProps> = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.description}>{message}</Text>
      {onRetry && (
        <AppButton
          title="Try again"
          onPress={onRetry}
          variant="outline"
          style={styles.button}
          size="sm"
        />
      )}
    </View>
  );
};

// ─── Loader (skeleton) ──────────────────────────────────────────────────────

interface AppLoaderProps {
  text?: string;
  style?: ViewStyle;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ text, style }) => {
  return (
    <View style={[styles.loaderContainer, style]}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonRow}>
          <View style={[styles.skeletonLine, { width: '60%' }]} />
          <View style={[styles.skeletonLine, { width: '30%', marginTop: 6 }]} />
        </View>
      ))}
      {text && <Text style={styles.loaderText}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  // Empty & Error — simple centered text, no icon/illustration
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing['3xl'],
  },
  title: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  description: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.base,
    marginBottom: Spacing.base,
  },
  button: {
    marginTop: Spacing.sm,
  },

  // Skeleton loader — flat rows, no cards, no avatars
  loaderContainer: {
    padding: Spacing.base,
    gap: Spacing.lg,
  },
  skeletonRow: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  skeletonLine: {
    height: 10,
    borderRadius: 4,
    backgroundColor: Colors.borderLight,
  },
  loaderText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});

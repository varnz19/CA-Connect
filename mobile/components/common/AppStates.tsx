import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppButton } from './AppButton';
import { Colors, Typography, Spacing } from '../../constants/theme';

interface AppEmptyProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const AppEmpty: React.FC<AppEmptyProps> = ({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrapper}>
        <MaterialIcons name={icon} size={48} color={Colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <AppButton
          title={actionLabel}
          onPress={onAction}
          style={styles.button}
          size="sm"
        />
      )}
    </View>
  );
};

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
      <View style={[styles.iconWrapper, styles.errorIconWrapper]}>
        <MaterialIcons name="error-outline" size={48} color={Colors.danger} />
      </View>
      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.description}>{message}</Text>
      {onRetry && (
        <AppButton
          title="Try Again"
          onPress={onRetry}
          variant="outline"
          style={styles.button}
          size="sm"
        />
      )}
    </View>
  );
};

interface AppLoaderProps {
  text?: string;
  style?: ViewStyle;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ text, style }) => {
  return (
    <View style={[styles.loaderContainer, style]}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.skeletonContent}>
            <View style={[styles.skeletonLine, { width: '70%' }]} />
            <View style={[styles.skeletonLine, { width: '50%', marginTop: 8 }]} />
          </View>
        </View>
      ))}
      {text && <Text style={styles.loaderText}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing['3xl'],
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.backgroundInput,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  errorIconWrapper: {
    backgroundColor: Colors.dangerLight,
  },
  title: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  description: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.md,
    marginBottom: Spacing.base,
  },
  button: {
    marginTop: Spacing.xs,
  },
  loaderContainer: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: Spacing.base,
    gap: Spacing.md,
  },
  skeletonAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundInput,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.backgroundInput,
  },
  loaderText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});

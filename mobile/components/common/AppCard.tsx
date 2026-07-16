import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing } from '../../constants/theme';

interface AppCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  noPadding?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  style,
  padding = Spacing.base,
  noPadding = false,
}) => {
  return (
    <View
      style={[
        styles.card,
        !noPadding && { padding },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
});

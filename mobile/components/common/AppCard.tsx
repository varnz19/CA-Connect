import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, Spacing } from '../../constants/theme';

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
    borderRadius: 4,       // Consistent 4px
    borderWidth: 1,
    borderColor: Colors.border,
    // No shadow — separation via border only
  },
});

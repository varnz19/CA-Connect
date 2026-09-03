import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, Typography } from '../../constants/theme';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 72,
};

const FONT_SIZE_MAP: Record<AvatarSize, number> = {
  xs: 11,
  sm: 13,
  md: 16,
  lg: 20,
  xl: 26,
};

interface AppAvatarProps {
  name: string;
  uri?: string;
  size?: AvatarSize;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
}

export const AppAvatar: React.FC<AppAvatarProps> = ({
  name,
  uri,
  size = 'md',
  style,
  backgroundColor,
}) => {
  const dimension = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];

  const getInitials = (fullName: string): string => {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  // Square-ish avatar with 4px radius and 1px Ink border
  const avatarStyle = {
    width: dimension,
    height: dimension,
    borderRadius: 4,
    backgroundColor: backgroundColor || Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
  };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[avatarStyle, style as any]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={[styles.container, avatarStyle, style]}>
      <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.textLight,
    fontFamily: Typography.fontFamily.semiBold,
  },
});

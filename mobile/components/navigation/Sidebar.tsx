import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

export interface SidebarItem {
  name: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: string;
}

interface SidebarProps {
  items: SidebarItem[];
  baseRoute: string; // e.g. '(admin)' or '(client)'
}

export const Sidebar: React.FC<SidebarProps> = ({ items, baseRoute }) => {
  const router = useRouter();
  const segments = useSegments();
  const { user } = useAuthStore();

  const currentSegment = segments[1] || 'index';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandBadge}>
          <Text style={styles.brandInitials}>CA</Text>
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.brandText}>CA CONNECT</Text>
          <Text style={styles.roleText}>{user?.role === 'ADMIN' ? 'FIRM WORKSPACE' : 'CLIENT PORTAL'}</Text>
        </View>
      </View>

      <View style={styles.hairlineRule} />

      <View style={styles.navContainer}>
        {items.map((item) => {
          const isActive = currentSegment === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => router.push(`/${baseRoute}/${item.name === 'index' ? '' : item.name}` as any)}
              activeOpacity={0.7}
            >
              <MaterialIcons 
                name={item.icon} 
                size={18} 
                color={isActive ? Colors.secondary : Colors.textTertiary} 
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>LEDGER SYSTEM · v1.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 240,
    backgroundColor: Colors.backgroundCard,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: Colors.hairline,
    paddingVertical: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  brandBadge: {
    width: 32,
    height: 32,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandInitials: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: 13,
    color: Colors.primary,
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  brandText: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: 15,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  roleText: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 9,
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginTop: 2,
  },
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.hairline,
    marginVertical: Spacing.lg,
  },
  navContainer: {
    flex: 1,
    gap: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 11,
    gap: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  // Left-border accent in Brass on the active nav item
  navItemActive: {
    borderLeftColor: Colors.secondary,
    backgroundColor: 'rgba(184, 134, 58, 0.08)',
  },
  navLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  navLabelActive: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.semiBold,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline,
  },
  footerText: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 9,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
});

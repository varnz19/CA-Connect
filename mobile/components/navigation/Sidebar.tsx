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

  // Find current active route
  // segments is usually ['(admin)', 'clients', ...]
  const currentSegment = segments[1] || 'index';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="security" size={32} color={Colors.secondary} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.brandText}>CA-Connect</Text>
          <Text style={styles.roleText}>{user?.role === 'ADMIN' ? 'Firm Workspace' : 'Client Portal'}</Text>
        </View>
      </View>

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
                size={20} 
                color={isActive ? Colors.primary : Colors.secondaryLight} 
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 240,
    backgroundColor: Colors.primary, // ink-900 book spine
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: Colors.primaryLight,
    paddingVertical: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl * 2,
    gap: Spacing.sm,
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  brandText: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: 18,
    color: Colors.textLight,
  },
  roleText: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.secondary,
    marginTop: 2,
  },
  navContainer: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    gap: Spacing.md,
  },
  navItemActive: {
    backgroundColor: Colors.secondaryLight, // Brass soft for active
  },
  navLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textLight,
  },
  navLabelActive: {
    color: Colors.primary, // ink-900 text when active
    fontFamily: Typography.fontFamily.semiBold,
  },
});

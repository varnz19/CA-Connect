import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { SignOutModal } from '../common/SignOutModal';
import { performAppSignOut } from '../../utils/authUtils';

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
  const [showSignOutModal, setShowSignOutModal] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const currentSegment = segments[1] || 'index';

  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await performAppSignOut();
    } finally {
      setIsSigningOut(false);
      setShowSignOutModal(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/ca-logo.png')}
          style={styles.brandLogo}
          resizeMode="contain"
        />
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
                size={20} 
                color={isActive ? Colors.primaryLight : Colors.textTertiary} 
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={() => setShowSignOutModal(true)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="logout" size={18} color={Colors.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>CA CONNECT PLATFORM · v1.0</Text>
      </View>

      <SignOutModal
        visible={showSignOutModal}
        onCancel={() => setShowSignOutModal(false)}
        onConfirm={handleConfirmSignOut}
        loading={isSigningOut}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 250,
    backgroundColor: Colors.backgroundCard,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingVertical: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  brandLogo: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  brandText: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: 16,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  roleText: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 10,
    color: Colors.primaryLight,
    letterSpacing: 1,
    marginTop: 2,
  },
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  navContainer: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  navItemActive: {
    backgroundColor: Colors.primarySoft,
  },
  navLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  navLabelActive: {
    color: Colors.primaryLight,
    fontFamily: Typography.fontFamily.semiBold,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  signOutText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.danger,
  },
  footerText: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
});


import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AppCard } from '../../components/common/AppCard';
import { AppAvatar } from '../../components/common/AppAvatar';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface SettingsItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  danger?: boolean;
  rightElement?: React.ReactNode;
}

const SettingsItem = ({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
  danger = false,
  rightElement,
}: SettingsItemProps) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.settingsIcon, danger && styles.settingsIconDanger]}>
      <MaterialIcons name={icon} size={18} color={danger ? Colors.danger : Colors.primary} />
    </View>
    <Text style={[styles.settingsLabel, danger && styles.dangerText]}>{label}</Text>
    <View style={styles.settingsRight}>
      {value && <Text style={styles.settingsValue}>{value}</Text>}
      {rightElement}
      {showArrow && !rightElement && (
        <MaterialIcons name="chevron-right" size={18} color={Colors.textTertiary} />
      )}
    </View>
  </TouchableOpacity>
);

export default function AdminSettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = React.useState(true);
  const [emailAlerts, setEmailAlerts] = React.useState(true);

  const handleLogout = () => {
    const performLogout = () => {
      if (Platform.OS === 'web') {
        localStorage.clear();
      }
      logout();
      setTimeout(() => {
        router.replace('/(auth)/landing');
      }, 50);
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        performLogout();
      }
    } else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: performLogout,
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Section */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(admin)/edit-profile' as any)}
        >
          <AppCard style={styles.profileCard}>
            <View style={styles.profileRow}>
              <AppAvatar
                name={`${user?.firstName} ${user?.lastName}`}
                size="lg"
                uri={user?.avatar}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                <View style={styles.roleBadge}>
                  <MaterialIcons name="verified" size={12} color={Colors.secondary} />
                  <Text style={styles.roleText}>Chartered Accountant · Admin</Text>
                </View>
              </View>
              <MaterialIcons name="edit" size={18} color={Colors.textTertiary} />
            </View>
          </AppCard>
        </TouchableOpacity>

        {/* Account Section */}
        <Text style={styles.sectionLabel}>Account</Text>
        <AppCard style={styles.section} noPadding>
          <SettingsItem
            icon="person-outline"
            label="Edit Profile"
            onPress={() => router.push('/(admin)/edit-profile' as any)}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="lock-outline"
            label="Change Password"
            onPress={() => router.push('/(admin)/change-password' as any)}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="business"
            label="Firm Information"
            onPress={() => router.push('/(admin)/firm-info' as any)}
          />
        </AppCard>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <AppCard style={styles.section} noPadding>
          <SettingsItem
            icon="notifications-none"
            label="Push Notifications"
            showArrow={false}
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.textLight}
              />
            }
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="email"
            label="Email Alerts"
            showArrow={false}
            rightElement={
              <Switch
                value={emailAlerts}
                onValueChange={setEmailAlerts}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.textLight}
              />
            }
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="language"
            label="Language"
            value="English"
            onPress={() => {}}
          />
        </AppCard>

        {/* Integrations */}
        <Text style={styles.sectionLabel}>Integrations</Text>
        <AppCard style={styles.section} noPadding>
          <SettingsItem
            icon="videocam"
            label="Google Meet"
            value="Not Connected"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="video-label"
            label="Microsoft Teams"
            value="Not Connected"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="cloud"
            label="Cloud Storage"
            value="AWS S3"
            onPress={() => {}}
          />
        </AppCard>

        {/* Support */}
        <Text style={styles.sectionLabel}>Support</Text>
        <AppCard style={styles.section} noPadding>
          <SettingsItem
            icon="help-outline"
            label="Help & FAQ"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="privacy-tip"
            label="Privacy Policy"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="info-outline"
            label="App Version"
            value="1.0.0"
            showArrow={false}
          />
        </AppCard>

        {/* Logout */}
        <AppCard style={styles.section} noPadding>
          <SettingsItem
            icon="logout"
            label="Logout"
            danger
            onPress={handleLogout}
            showArrow={false}
          />
        </AppCard>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    color: Colors.textPrimary,
  },
  profileCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  profileEmail: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  roleText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.secondary,
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    letterSpacing: Typography.letterSpacing.wide,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xs,
    marginTop: Spacing.base,
    textTransform: 'uppercase',
  },
  section: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.xs,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  settingsIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.statusActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIconDanger: {
    backgroundColor: Colors.dangerLight,
  },
  settingsLabel: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  dangerText: {
    color: Colors.danger,
  },
  settingsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  settingsValue: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: Spacing.base + 32 + Spacing.sm,
  },
  bottomPad: { height: Spacing['2xl'] },
});

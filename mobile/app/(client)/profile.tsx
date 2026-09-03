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
import { AppAvatar } from '../../components/common/AppAvatar';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing } from '../../constants/theme';

interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
}

const SettingsRow = ({
  label,
  value,
  onPress,
  showArrow = true,
  rightElement,
}: SettingsRowProps) => (
  <TouchableOpacity
    style={styles.settingsRow}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={styles.rowRight}>
      {value && <Text style={styles.rowValueMono}>{value}</Text>}
      {rightElement}
      {showArrow && onPress && (
        <MaterialIcons name="chevron-right" size={18} color={Colors.textTertiary} />
      )}
    </View>
  </TouchableOpacity>
);

export default function ClientProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = React.useState(true);

  const profile = user?.clientProfile;

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
      if (window.confirm('Are you sure you want to end your session?')) {
        performLogout();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to end your session?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: performLogout },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Client Profile</Text>
          <Text style={styles.subtitle}>Statutory profile, business info, and access credentials</Text>
        </View>

        <View style={styles.hairlineRule} />

        {/* Profile Card Header */}
        <TouchableOpacity
          style={styles.profileHeader}
          activeOpacity={0.7}
          onPress={() => router.push('/(client)/edit-profile' as any)}
        >
          <AppAvatar name={`${user?.firstName} ${user?.lastName}`} size="lg" uri={user?.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            {profile?.firmName && (
              <Text style={styles.firmName}>{profile.firmName}</Text>
            )}
            <Text style={styles.codeText}>CLIENT ID: {profile?.clientCode || 'CL-001'}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>

        <View style={styles.hairlineRule} />

        {/* Account Details */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>Statutory Registration</Text>
        </View>
        <View style={styles.sectionBody}>
          <SettingsRow
            label="GST State jurisdiction"
            value={profile?.gstState || 'Maharashtra'}
          />
          <SettingsRow
            label="GSTIN identification"
            value={profile?.gstin || '27AABCU9603R1ZM'}
          />
          <SettingsRow
            label="PAN registration"
            value={profile?.panNumber || 'AABCU9603R'}
          />
          <SettingsRow
            label="Primary phone"
            value={user?.phone || '+91-9876543210'}
          />
        </View>

        <View style={styles.hairlineRule} />

        {/* Security & Access */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>Security & Credentials</Text>
        </View>
        <View style={styles.sectionBody}>
          <SettingsRow
            label="Edit profile data"
            onPress={() => router.push('/(client)/edit-profile' as any)}
          />
          <SettingsRow
            label="Update account password"
            onPress={() => router.push('/(client)/change-password' as any)}
          />
          <SettingsRow
            label="Push notifications"
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
        </View>

        {/* Destructive Action: generous whitespace and outline border in Rust/red */}
        <View style={styles.destructiveArea}>
          <TouchableOpacity
            style={styles.outlineDangerBtn}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.outlineDangerText}>Sign Out of Client Portal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing['3xl'] },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: Typography.size.xl,
    color: Colors.primary,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.hairline,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.backgroundCard,
    gap: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.primary,
  },
  profileEmail: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  firmName: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  codeText: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: 9,
    color: Colors.secondaryDark,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.background,
  },
  sectionHeading: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionBody: {
    backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.hairline,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  rowLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rowValueMono: {
    fontFamily: Typography.fontFamily.monoRegular, // mono value
    fontSize: Typography.size.xs,
    color: Colors.primary,
  },
  destructiveArea: {
    marginTop: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  outlineDangerBtn: {
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: Spacing.xl,
    backgroundColor: 'transparent',
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  outlineDangerText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.danger,
  },
});

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
import { Colors, Typography, Spacing } from '../../constants/theme';

interface SettingsItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  danger?: boolean;
  rightElement?: React.ReactNode;
}

const SettingsItem = ({ icon, label, value, onPress, showArrow = true, danger = false, rightElement }: SettingsItemProps) => (
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

export default function ClientSettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = React.useState(true);

  const handleLogout = () => {
    const performLogout = () => {
      logout();
      router.replace('/(auth)/landing');
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        performLogout();
      }
    } else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: performLogout },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Profile */}
        <AppCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <AppAvatar name={`${user?.firstName} ${user?.lastName}`} size="lg" uri={user?.avatar} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              {user?.clientProfile?.firmName && (
                <Text style={styles.firmName}>{user.clientProfile.firmName}</Text>
              )}
              {user?.clientProfile?.clientCode && (
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{user.clientProfile.clientCode}</Text>
                </View>
              )}
            </View>
          </View>
        </AppCard>

        {/* Profile Details */}
        {user?.clientProfile?.panNumber && (
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>PAN</Text>
              <Text style={styles.detailValue}>{user.clientProfile.panNumber}</Text>
            </View>
            {user.clientProfile.gstin && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>GSTIN</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{user.clientProfile.gstin}</Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.sectionLabel}>Account</Text>
        <AppCard style={styles.section} noPadding>
          <SettingsItem icon="person-outline" label="Edit Profile" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingsItem icon="lock-outline" label="Change Password" onPress={() => {}} />
        </AppCard>

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
          <SettingsItem icon="privacy-tip" label="Privacy Settings" onPress={() => {}} />
        </AppCard>

        <Text style={styles.sectionLabel}>Support</Text>
        <AppCard style={styles.section} noPadding>
          <SettingsItem icon="help-outline" label="Help & FAQ" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingsItem icon="info-outline" label="App Version" value="1.0.0" showArrow={false} />
        </AppCard>

        <AppCard style={styles.section} noPadding>
          <SettingsItem icon="logout" label="Logout" danger onPress={handleLogout} showArrow={false} />
        </AppCard>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base, paddingBottom: Spacing.sm },
  title: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.size.xl, color: Colors.textPrimary },
  profileCard: { marginHorizontal: Spacing.base, marginBottom: Spacing.sm },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.size.base, color: Colors.textPrimary },
  profileEmail: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm, color: Colors.textSecondary, marginTop: 2 },
  firmName: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.sm, color: Colors.secondary, marginTop: 2 },
  codeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.backgroundInput,
    borderRadius: 4,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    marginTop: 4,
  },
  codeText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.xs, color: Colors.textSecondary },
  detailsRow: { flexDirection: 'row', paddingHorizontal: Spacing.base, gap: Spacing.sm, marginBottom: Spacing.sm },
  detailItem: { flex: 1, backgroundColor: Colors.backgroundCard, borderRadius: 10, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  detailLabel: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.xs, color: Colors.textTertiary },
  detailValue: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.size.base, color: Colors.textPrimary, marginTop: 2 },
  sectionLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xs,
    marginTop: Spacing.base,
    textTransform: 'uppercase',
  },
  section: { marginHorizontal: Spacing.base, marginBottom: Spacing.xs },
  settingsItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  settingsIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.statusActive, alignItems: 'center', justifyContent: 'center' },
  settingsIconDanger: { backgroundColor: Colors.dangerLight },
  settingsLabel: { flex: 1, fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.base, color: Colors.textPrimary },
  dangerText: { color: Colors.danger },
  settingsRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  settingsValue: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm, color: Colors.textTertiary },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: Spacing.base + 32 + Spacing.sm },
  bottomPad: { height: Spacing['2xl'] },
});

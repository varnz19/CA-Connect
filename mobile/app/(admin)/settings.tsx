import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { AppAvatar } from '../../components/common/AppAvatar';
import { SignOutModal } from '../../components/common/SignOutModal';
import { performAppSignOut } from '../../utils/authUtils';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';

interface InfoRowProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  label: string;
  value?: string;
  isMono?: boolean;
  onPress?: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({
  icon,
  iconColor = Colors.primaryLight,
  label,
  value,
  isMono = false,
  onPress,
  showChevron = false,
  rightElement,
}) => {
  const content = (
    <View style={styles.infoRowContainer}>
      <View style={[styles.infoRowIconBox, { backgroundColor: `${iconColor}15` }]}>
        <MaterialIcons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.infoRowContent}>
        <Text style={styles.infoRowLabel}>{label}</Text>
        {value ? (
          <Text style={[styles.infoRowValue, isMono && styles.monoText]}>
            {value}
          </Text>
        ) : null}
      </View>
      {rightElement}
      {showChevron && (
        <MaterialIcons name="chevron-right" size={20} color={Colors.textTertiary} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.infoRowTouchable}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.infoRowTouchable}>{content}</View>;
};

export default function AdminSettingsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const fullName = `${user?.firstName || 'CA'} ${user?.lastName || 'Partner'}`;

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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.wrapper}>
          {/* Header Banner */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Settings</Text>
              <Text style={styles.headerSubtitle}>
                Administrative command center, firm credentials, and practice security.
              </Text>
            </View>
            <View style={styles.partnerBadge}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.primaryLight} />
              <Text style={styles.partnerBadgeText}>ICAI REGISTERED</Text>
            </View>
          </View>

          {/* Hero Profile Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroAccentStrip} />
            <View style={styles.heroMain}>
              <View style={styles.avatarRow}>
                <View style={styles.avatarWrapper}>
                  <AppAvatar name={fullName} size="lg" uri={user?.avatar} />
                  <View style={styles.avatarOnlineDot} />
                </View>

                <View style={styles.heroIdentity}>
                  <View style={styles.nameBadgeRow}>
                    <Text style={styles.heroName}>{fullName}</Text>
                    <View style={styles.rolePill}>
                      <Text style={styles.rolePillText}>FIRM PARTNER</Text>
                    </View>
                  </View>

                  <View style={styles.firmRow}>
                    <Feather name="briefcase" size={13} color={Colors.primaryLight} />
                    <Text style={styles.heroFirmName}>CA Connect Chartered Accountants Practice</Text>
                  </View>

                  <Text style={styles.heroEmail}>{user?.email || 'admin@caconnect.in'}</Text>
                </View>

                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => router.push('/(admin)/edit-profile' as any)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="edit" size={16} color={Colors.primaryLight} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
              </View>

              {/* Micro Status Strip */}
              <View style={styles.microStatsRow}>
                <View style={styles.microStatItem}>
                  <Text style={styles.microStatLabel}>ROLE AUTHORITY</Text>
                  <View style={styles.microStatValueRow}>
                    <View style={styles.greenDot} />
                    <Text style={styles.microStatValue}>Principal CA</Text>
                  </View>
                </View>
                <View style={styles.microStatDivider} />
                <View style={styles.microStatItem}>
                  <Text style={styles.microStatLabel}>FRN REGISTRATION</Text>
                  <Text style={[styles.microStatValue, styles.monoText]}>104230W / ICAI</Text>
                </View>
                <View style={styles.microStatDivider} />
                <View style={styles.microStatItem}>
                  <Text style={styles.microStatLabel}>PHONE</Text>
                  <Text style={[styles.microStatValue, styles.monoText]}>
                    {user?.phone || '+91 98765 43210'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Section 1: Firm & Practice Information */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.cardHeaderIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <MaterialIcons name="business" size={18} color={Colors.primaryLight} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Firm & Practice Profile</Text>
                  <Text style={styles.cardSubtitle}>Practice establishment and statutory firm credentials</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <InfoRow
              icon="account-balance"
              iconColor="#2563EB"
              label="Firm Registration Details"
              value="CA Connect Chartered Accountants"
              showChevron
              onPress={() => router.push('/(admin)/firm-info' as any)}
            />
            <InfoRow
              icon="badge"
              iconColor="#059669"
              label="Principal Member Certificate"
              value="ICAI Fellow Member · FCA 048291"
            />
            <InfoRow
              icon="location-on"
              iconColor="#D97706"
              label="Head Office Jurisdiction"
              value="Maker Chambers V, Nariman Point, Mumbai 400021"
            />
          </View>

          {/* Section 2: Account & Security */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.cardHeaderIconBox, { backgroundColor: '#F5F3FF' }]}>
                  <MaterialIcons name="security" size={18} color="#8B5CF6" />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Credentials & Security</Text>
                  <Text style={styles.cardSubtitle}>Master credentials, passwords, and access control</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <InfoRow
              icon="person-outline"
              iconColor="#2563EB"
              label="Edit Personal Profile Details"
              value="Name, phone number & partner title"
              showChevron
              onPress={() => router.push('/(admin)/edit-profile' as any)}
            />

            <InfoRow
              icon="vpn-key"
              iconColor="#D97706"
              label="Change Master Password"
              value="Update your account sign-in password"
              showChevron
              onPress={() => router.push('/(admin)/change-password' as any)}
            />

            <InfoRow
              icon="verified-user"
              iconColor="#059669"
              label="Enterprise Two-Factor Authentication"
              value="Active · Enforced for all admin logins"
            />
          </View>

          {/* Section 3: Notification Preferences */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.cardHeaderIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <MaterialIcons name="notifications-active" size={18} color={Colors.success} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Alerts & Notifications</Text>
                  <Text style={styles.cardSubtitle}>Statutory alerts, filing deadlines & client uploads</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <InfoRow
              icon="notifications"
              iconColor="#2563EB"
              label="Practice Push Notifications"
              value="Client document uploads & consultation requests"
              rightElement={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                  thumbColor="#FFFFFF"
                />
              }
            />

            <InfoRow
              icon="email"
              iconColor="#059669"
              label="Statutory Email Reminders"
              value="Automated GST, TDS & advance tax deadline notices"
              rightElement={
                <Switch
                  value={emailAlerts}
                  onValueChange={setEmailAlerts}
                  trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                  thumbColor="#FFFFFF"
                />
              }
            />
          </View>

          {/* Section 4: Audit & Storage */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.cardHeaderIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <MaterialIcons name="cloud-done" size={18} color={Colors.primaryLight} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>System Audit & Cloud Storage</Text>
                  <Text style={styles.cardSubtitle}>Storage security, encryption and build metadata</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <InfoRow
              icon="cloud"
              iconColor="#2563EB"
              label="Document Storage Vault"
              value="AWS S3 Encrypted (ap-south-1 Mumbai)"
              isMono
            />
            <InfoRow
              icon="lock"
              iconColor="#059669"
              label="Encryption Standard"
              value="AES-256-GCM / TLS 1.3"
              isMono
            />
            <InfoRow
              icon="info"
              iconColor="#64748B"
              label="Platform Release Version"
              value="v2.4.0 · CA Connect Enterprise Ledger"
              isMono
            />
          </View>

          {/* Sign Out Card */}
          <View style={styles.signOutWrapper}>
            <TouchableOpacity
              style={styles.signOutCard}
              onPress={() => setShowSignOutModal(true)}
              activeOpacity={0.8}
            >
              <View style={styles.signOutIconBox}>
                <MaterialIcons name="logout" size={18} color={Colors.danger} />
              </View>
              <View style={styles.signOutTextWrapper}>
                <Text style={styles.signOutTitle}>Sign out of workspace</Text>
                <Text style={styles.signOutSubtitle}>Terminates active administrative session on this device</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={Colors.danger} />
            </TouchableOpacity>

            <Text style={styles.complianceFooter}>
              CA CONNECT PRACTICE SUITE · 256-BIT ENCRYPTION · ISO 27001 AUDITED
            </Text>
          </View>
        </View>
      </ScrollView>

      <SignOutModal
        visible={showSignOutModal}
        onCancel={() => setShowSignOutModal(false)}
        onConfirm={handleConfirmSignOut}
        loading={isSigningOut}
        title="Sign out of workspace"
        message="Are you sure you want to end your workspace session? You will be returned to the portal selection screen."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingBottom: Spacing['3xl'],
    paddingTop: Spacing.sm,
  },
  wrapper: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 20,
    maxWidth: 440,
  },
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  partnerBadgeText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    color: Colors.primaryLight,
    letterSpacing: 0.5,
  },

  // Hero Card
  heroCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.md,
  },
  heroAccentStrip: {
    height: 6,
    backgroundColor: Colors.primaryLight,
  },
  heroMain: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarOnlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  heroIdentity: {
    flex: 1,
    gap: 2,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  heroName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  rolePill: {
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: BorderRadius.xs,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  rolePillText: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: 10,
    color: Colors.primaryLight,
    letterSpacing: 0.5,
  },
  firmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  heroFirmName: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.primaryLight,
  },
  heroEmail: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    color: Colors.primaryLight,
  },
  microStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  microStatItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  microStatLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 9,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  microStatValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  microStatValue: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  microStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },

  // Generic Card
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cardHeaderIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },

  // Info Row
  infoRowTouchable: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoRowIconBox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRowContent: {
    flex: 1,
  },
  infoRowLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  infoRowValue: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  monoText: {
    fontFamily: Typography.fontFamily.monoRegular,
  },

  // Sign Out Area
  signOutWrapper: {
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  signOutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  signOutIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutTextWrapper: {
    flex: 1,
  },
  signOutTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.danger,
  },
  signOutSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: '#991B1B',
    marginTop: 1,
  },
  complianceFooter: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: Spacing.lg,
  },
});

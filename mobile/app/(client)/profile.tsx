import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
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

export default function ClientProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const profile = user?.clientProfile;
  const fullName = `${user?.firstName || 'Valued'} ${user?.lastName || 'Client'}`;
  const clientCode = profile?.clientCode || 'CAC-001';

  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await performAppSignOut();
    } finally {
      setIsSigningOut(false);
      setShowSignOutModal(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
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
              <Text style={styles.headerTitle}>Account & Profile</Text>
              <Text style={styles.headerSubtitle}>
                Manage your statutory tax profile, business identity, and security preferences.
              </Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.success} />
              <Text style={styles.verifiedBadgeText}>VERIFIED CLIENT</Text>
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
                    <View style={styles.codePill}>
                      <Text style={styles.codePillText}>{clientCode}</Text>
                    </View>
                  </View>

                  {profile?.firmName ? (
                    <View style={styles.firmRow}>
                      <Feather name="briefcase" size={13} color={Colors.primaryLight} />
                      <Text style={styles.heroFirmName}>{profile.firmName}</Text>
                    </View>
                  ) : null}

                  <Text style={styles.heroEmail}>{user?.email || 'client@caconnect.in'}</Text>
                </View>

                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => router.push('/(client)/edit-profile' as any)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="edit" size={16} color={Colors.primaryLight} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
              </View>

              {/* Micro Status Indicators */}
              <View style={styles.microStatsRow}>
                <View style={styles.microStatItem}>
                  <Text style={styles.microStatLabel}>STATUS</Text>
                  <View style={styles.microStatValueRow}>
                    <View style={styles.greenDot} />
                    <Text style={styles.microStatValue}>Active · Taxpayer</Text>
                  </View>
                </View>
                <View style={styles.microStatDivider} />
                <View style={styles.microStatItem}>
                  <Text style={styles.microStatLabel}>STATE JURISDICTION</Text>
                  <Text style={styles.microStatValue}>{profile?.gstState || 'Maharashtra'}</Text>
                </View>
                <View style={styles.microStatDivider} />
                <View style={styles.microStatItem}>
                  <Text style={styles.microStatLabel}>PRIMARY PHONE</Text>
                  <Text style={[styles.microStatValue, styles.monoText]}>
                    {user?.phone || '+91 98765 00001'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Section 1: Statutory & Tax Registration Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.cardHeaderIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <MaterialIcons name="verified" size={18} color={Colors.primaryLight} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Statutory & Tax Identity</Text>
                  <Text style={styles.cardSubtitle}>Official tax credentials registered with your CA firm</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardDivider} />

            {/* GSTIN Row with Copy Button */}
            <View style={styles.taxNumberBlock}>
              <View style={styles.taxNumberLeft}>
                <Text style={styles.taxNumberLabel}>GSTIN IDENTIFICATION</Text>
                <Text style={[styles.taxNumberValue, styles.monoText]}>
                  {profile?.gstin || 'Not provided'}
                </Text>
              </View>
              {profile?.gstin && (
                <TouchableOpacity
                  style={[
                    styles.copyPill,
                    copiedKey === 'gstin' && styles.copiedPillActive,
                  ]}
                  onPress={() => copyToClipboard(profile.gstin!, 'gstin')}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={copiedKey === 'gstin' ? 'check' : 'content-copy'}
                    size={14}
                    color={copiedKey === 'gstin' ? Colors.success : Colors.primaryLight}
                  />
                  <Text
                    style={[
                      styles.copyPillText,
                      copiedKey === 'gstin' && styles.copiedPillTextActive,
                    ]}
                  >
                    {copiedKey === 'gstin' ? 'Copied' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* PAN Row with Copy Button */}
            <View style={styles.taxNumberBlock}>
              <View style={styles.taxNumberLeft}>
                <Text style={styles.taxNumberLabel}>PERMANENT ACCOUNT NUMBER (PAN)</Text>
                <Text style={[styles.taxNumberValue, styles.monoText]}>
                  {profile?.panNumber || 'Not provided'}
                </Text>
              </View>
              {profile?.panNumber && (
                <TouchableOpacity
                  style={[
                    styles.copyPill,
                    copiedKey === 'pan' && styles.copiedPillActive,
                  ]}
                  onPress={() => copyToClipboard(profile.panNumber!, 'pan')}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={copiedKey === 'pan' ? 'check' : 'content-copy'}
                    size={14}
                    color={copiedKey === 'pan' ? Colors.success : Colors.primaryLight}
                  />
                  <Text
                    style={[
                      styles.copyPillText,
                      copiedKey === 'pan' && styles.copiedPillTextActive,
                    ]}
                  >
                    {copiedKey === 'pan' ? 'Copied' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <InfoRow
              icon="business"
              iconColor="#2563EB"
              label="Registered Business Trade Name"
              value={profile?.firmName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Not provided')}
            />
            <InfoRow
              icon="place"
              iconColor="#059669"
              label="Tax Jurisdiction State"
              value={profile?.gstState || 'Not provided'}
            />
            <InfoRow
              icon="home"
              iconColor="#D97706"
              label="Registered Business Address"
              value={profile?.address || 'Not provided'}
            />
          </View>

          {/* Section 2: Assigned CA Advisory Practice */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.cardHeaderIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="briefcase" size={18} color={Colors.success} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Assigned CA Practice</Text>
                  <Text style={styles.cardSubtitle}>Your dedicated Chartered Accountant & support team</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.firmPartnerRow}>
              <View style={styles.firmPartnerBadge}>
                <Text style={styles.firmPartnerBadgeText}>CA</Text>
              </View>
              <View style={styles.firmPartnerInfo}>
                <Text style={styles.firmPartnerTitle}>Chartered Accounting Practice</Text>
                <Text style={styles.firmPartnerSub}>Assigned Principal Partner · ICAI Registered</Text>
              </View>
            </View>

            <View style={styles.firmActionRow}>
              <TouchableOpacity
                style={styles.firmActionBtnPrimary}
                onPress={() => router.push('/(client)/messages' as any)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="chat" size={16} color="#FFFFFF" />
                <Text style={styles.firmActionBtnPrimaryText}>Message CA Firm</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.firmActionBtnSecondary}
                onPress={() => router.push('/(client)/book-appointment' as any)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="event" size={16} color={Colors.primaryLight} />
                <Text style={styles.firmActionBtnSecondaryText}>Book Consult</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section 3: Security & Preferences Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.cardHeaderIconBox, { backgroundColor: '#F5F3FF' }]}>
                  <MaterialIcons name="security" size={18} color="#8B5CF6" />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Security & Preferences</Text>
                  <Text style={styles.cardSubtitle}>Password, session management, and notifications</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <InfoRow
              icon="lock"
              iconColor="#2563EB"
              label="Change Account Password"
              value="Regularly update your credentials"
              showChevron
              onPress={() => router.push('/(client)/change-password' as any)}
            />

            <InfoRow
              icon="notifications-active"
              iconColor="#D97706"
              label="Push Notifications"
              value="Deadlines, document requests & updates"
              rightElement={
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                  thumbColor="#FFFFFF"
                />
              }
            />

            <InfoRow
              icon="mail"
              iconColor="#059669"
              label="Email Tax Alerts"
              value="Receive GSTR & ITR filing receipts via email"
              rightElement={
                <Switch
                  value={emailAlerts}
                  onValueChange={setEmailAlerts}
                  trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                  thumbColor="#FFFFFF"
                />
              }
            />

            <InfoRow
              icon="verified-user"
              iconColor="#8B5CF6"
              label="Two-Factor Protection"
              value="Active · Verified on login"
            />
          </View>

          {/* Sign Out Section */}
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
                <Text style={styles.signOutTitle}>Sign Out of Client Portal</Text>
                <Text style={styles.signOutSubtitle}>Ends current secure session on this device</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={Colors.danger} />
            </TouchableOpacity>

            <Text style={styles.complianceFooter}>
              CA CONNECT SECURE CLIENT PORTAL · 256-BIT ENCRYPTION · ISO 27001
            </Text>
          </View>
        </View>
      </ScrollView>

      <SignOutModal
        visible={showSignOutModal}
        onCancel={() => setShowSignOutModal(false)}
        onConfirm={handleConfirmSignOut}
        loading={isSigningOut}
        title="Sign Out of Client Portal"
        message="Are you sure you want to end your current session? You can sign back in anytime with your client credentials."
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
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    borderWidth: 1,
    borderColor: Colors.successBorder,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  verifiedBadgeText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    color: Colors.successDark,
    letterSpacing: 0.5,
  },

  // Hero Profile Card
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
  codePill: {
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: BorderRadius.xs,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  codePillText: {
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

  // Tax Number Block (GSTIN & PAN)
  taxNumberBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  taxNumberLeft: {
    flex: 1,
  },
  taxNumberLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  taxNumberValue: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginTop: 2,
    letterSpacing: 1,
  },
  copyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  copyPillText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 11,
    color: Colors.primaryLight,
  },
  copiedPillActive: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.successBorder,
  },
  copiedPillTextActive: {
    color: Colors.successDark,
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

  // CA Practice Block
  firmPartnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  firmPartnerBadge: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  firmPartnerBadgeText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  firmPartnerInfo: {
    flex: 1,
  },
  firmPartnerTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  firmPartnerSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  firmActionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  firmActionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    height: 42,
  },
  firmActionBtnPrimaryText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: '#FFFFFF',
  },
  firmActionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: BorderRadius.md,
    height: 42,
  },
  firmActionBtnSecondaryText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primaryLight,
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

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';

export default function PortalSelectScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'client' | 'admin'>('client');

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/landing')}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={18} color={Colors.primaryLight} />
          <Text style={styles.backText}>Overview</Text>
        </TouchableOpacity>
        <View style={styles.portalTag}>
          <Text style={styles.portalTagText}>ACCESS PORTALS</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerBlock}>
            <View style={styles.pillBadge}>
              <View style={styles.greenLiveDot} />
              <Text style={styles.pillBadgeText}>AUTHENTICATED GATEWAY</Text>
            </View>
            <Text style={styles.pageTitle}>Choose How You Enter</Text>
            <Text style={styles.pageSubtitle}>
              Select your account type to proceed to your dedicated portal.
            </Text>
          </View>

          {/* Role Gateways Stack */}
          <View style={styles.gatewaysContainer}>
            {/* Client Gateway Card */}
            <TouchableOpacity
              style={[
                styles.gatewayCard,
                selectedRole === 'client' && styles.gatewayCardActiveClient,
              ]}
              onPress={() => setSelectedRole('client')}
              activeOpacity={0.9}
            >
              <View style={styles.gatewayTop}>
                <View style={[styles.gatewayIconBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                  <Ionicons name="briefcase-outline" size={24} color="#059669" />
                </View>
                <View style={styles.gatewayBadgeClient}>
                  <Text style={styles.gatewayBadgeTextClient}>BUSINESS & TAXPAYER</Text>
                </View>
              </View>

              <Text style={styles.gatewayHeading}>Client Portal</Text>
              <Text style={styles.gatewayDescription}>
                Upload requested tax documents, download official GST invoices, track your filings, and message your CA firm.
              </Text>

              <View style={styles.pillFeatureRow}>
                <View style={styles.featurePill}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={styles.featurePillText}>Track Invoices</Text>
                </View>
                <View style={styles.featurePill}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={styles.featurePillText}>Upload Files</Text>
                </View>
                <View style={styles.featurePill}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={styles.featurePillText}>Book Consults</Text>
                </View>
              </View>

              <View style={styles.gatewayActionRow}>
                <TouchableOpacity
                  style={styles.clientActionBtn}
                  onPress={() => router.push('/(auth)/client-login')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.clientActionBtnText}>Sign In as Client</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.signupTextBtn}
                  onPress={() => router.push('/(auth)/signup')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.signupTextBtnContent}>
                    New client? <Text style={styles.signupUnderline}>Create Account →</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {/* Admin Gateway Card */}
            <TouchableOpacity
              style={[
                styles.gatewayCard,
                selectedRole === 'admin' && styles.gatewayCardActiveAdmin,
              ]}
              onPress={() => setSelectedRole('admin')}
              activeOpacity={0.9}
            >
              <View style={styles.gatewayTop}>
                <View style={[styles.gatewayIconBox, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                  <Ionicons name="shield-outline" size={24} color="#2563EB" />
                </View>
                <View style={styles.gatewayBadgeAdmin}>
                  <Text style={styles.gatewayBadgeTextAdmin}>FIRM PARTNER & STAFF</Text>
                </View>
              </View>

              <Text style={styles.gatewayHeading}>CA Admin Workspace</Text>
              <Text style={styles.gatewayDescription}>
                Complete practice command center for CA partners and managers. Audit client files, issue invoices, and manage tax calendars.
              </Text>

              <View style={styles.pillFeatureRow}>
                <View style={styles.featurePill}>
                  <Ionicons name="checkmark-circle" size={14} color="#2563EB" />
                  <Text style={styles.featurePillText}>GST Billing</Text>
                </View>
                <View style={styles.featurePill}>
                  <Ionicons name="checkmark-circle" size={14} color="#2563EB" />
                  <Text style={styles.featurePillText}>File Approval</Text>
                </View>
                <View style={styles.featurePill}>
                  <Ionicons name="checkmark-circle" size={14} color="#2563EB" />
                  <Text style={styles.featurePillText}>Tax Calendar</Text>
                </View>
              </View>

              <View style={styles.gatewayActionRow}>
                <TouchableOpacity
                  style={styles.adminActionBtn}
                  onPress={() => router.push('/(auth)/admin-login')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.adminActionBtnText}>Sign In to Admin Workspace</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>

          {/* Bottom Security Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerMeta}>
              256-BIT ENCRYPTION · SOC 2 VERIFIED WORKSPACE · ISO 27001
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primaryLight,
  },
  portalTag: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  portalTagText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    color: Colors.primaryLight,
    letterSpacing: 0.5,
  },
  scroll: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 580,
    gap: Spacing.lg,
  },
  headerBlock: {
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 6,
    marginBottom: Spacing.xs,
  },
  greenLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryLight,
  },
  pillBadgeText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    color: Colors.primaryLight,
    letterSpacing: 1,
  },
  pageTitle: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: 26,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 420,
  },
  gatewaysContainer: {
    gap: Spacing.md,
  },
  gatewayCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  gatewayCardActiveClient: {
    borderColor: '#059669',
    backgroundColor: '#FCFDFD',
  },
  gatewayCardActiveAdmin: {
    borderColor: '#2563EB',
    backgroundColor: '#FCFDFD',
  },
  gatewayTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  gatewayIconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gatewayBadgeClient: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  gatewayBadgeTextClient: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    color: '#059669',
    letterSpacing: 0.5,
  },
  gatewayBadgeAdmin: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  gatewayBadgeTextAdmin: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  gatewayHeading: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  gatewayDescription: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  pillFeatureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  featurePillText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  gatewayActionRow: {
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  clientActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: BorderRadius.md,
    height: 48,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  clientActionBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: '#FFFFFF',
  },
  signupTextBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  signupTextBtnContent: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  signupUnderline: {
    fontFamily: Typography.fontFamily.semiBold,
    color: '#059669',
  },
  adminActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: BorderRadius.md,
    height: 48,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  adminActionBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: '#FFFFFF',
  },
  footer: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  footerMeta: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../constants/theme';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Brand Header */}
          <View style={styles.brandSection}>
            <Text style={styles.brandEyebrow}>Chartered Accountant Portal</Text>
            <Text style={styles.brandTitle}>CA CONNECT</Text>
            <View style={styles.hairlineRule} />
            <Text style={styles.brandDesc}>
              Firm ledger, compliance filing, GST records, and client communications portal.
            </Text>
          </View>

          {/* Portal Selector Choices */}
          <View style={styles.selectorSection}>
            <Text style={styles.sectionLabel}>Select Access Level</Text>

            {/* Admin Portal Row */}
            <TouchableOpacity
              style={styles.portalRow}
              activeOpacity={0.7}
              onPress={() => router.push('/(auth)/admin-login')}
            >
              <View style={styles.brassAccentLine} />
              <View style={styles.portalTextCol}>
                <View style={styles.titleRow}>
                  <Text style={styles.portalTitle}>Admin Workspace</Text>
                  <Text style={styles.roleTag}>Firm Internal</Text>
                </View>
                <Text style={styles.portalDesc}>
                  Ledgers, invoice generation, compliance management, client records, and filings.
                </Text>
              </View>
              <MaterialIcons name="arrow-forward" size={18} color={Colors.primary} />
            </TouchableOpacity>

            {/* Client Portal Row */}
            <TouchableOpacity
              style={styles.portalRow}
              activeOpacity={0.7}
              onPress={() => router.push('/(auth)/client-login')}
            >
              <View style={[styles.brassAccentLine, { backgroundColor: Colors.secondary }]} />
              <View style={styles.portalTextCol}>
                <View style={styles.titleRow}>
                  <Text style={styles.portalTitle}>Client Portal</Text>
                  <Text style={[styles.roleTag, { borderColor: Colors.secondary, color: Colors.secondaryDark }]}>Client Access</Text>
                </View>
                <Text style={styles.portalDesc}>
                  View tax records, upload requested documents, track invoices, and book advisory sessions.
                </Text>
              </View>
              <MaterialIcons name="arrow-forward" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* New Client Registration */}
          <View style={styles.registerSection}>
            <View style={styles.registerInner}>
              <View style={styles.registerTextCol}>
                <Text style={styles.registerHeading}>New Client Registration</Text>
                <Text style={styles.registerDesc}>
                  Register your business or firm account to initiate CA advisory and filing services.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.createBtn}
                activeOpacity={0.8}
                onPress={() => router.push('/(auth)/signup')}
              >
                <Text style={styles.createBtnText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerMeta}>256-BIT ENCRYPTION · SOC 2 COMPLIANT</Text>
            <Text style={styles.footerCopy}>CA Connect System</Text>
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
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
  },
  container: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  brandSection: {
    marginBottom: Spacing['2xl'],
  },
  brandEyebrow: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 11,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  brandTitle: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: 32,
    color: Colors.primary,
    letterSpacing: 1,
  },
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.hairline,
    marginVertical: Spacing.md,
  },
  brandDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  selectorSection: {
    marginBottom: Spacing['2xl'],
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 11,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  portalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  brassAccentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  portalTextCol: {
    flex: 1,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  portalTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.primary,
  },
  roleTag: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  portalDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  registerSection: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
    padding: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  registerInner: {
    gap: Spacing.md,
  },
  registerTextCol: {},
  registerHeading: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.primary,
    marginBottom: 2,
  },
  registerDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  createBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: 4,
  },
  createBtnText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textLight,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.hairline,
    paddingTop: Spacing.lg,
    alignItems: 'center',
    gap: 4,
  },
  footerMeta: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
  footerCopy: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: Colors.textSecondary,
  },
});

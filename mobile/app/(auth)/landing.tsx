import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Top Brand Bar */}
          <View style={styles.brandRow}>
            <View style={styles.logoCluster}>
              <View style={styles.logoOrb}>
                <Ionicons name="sparkles" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.brandName}>CA CONNECT</Text>
            </View>

            <TouchableOpacity
              style={styles.topSignInBtn}
              onPress={() => router.push('/(auth)/portal-select')}
              activeOpacity={0.8}
            >
              <Text style={styles.topSignInBtnText}>Sign In</Text>
              <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Hero Editorial Typography */}
          <View style={styles.heroBlock}>
            <Text style={styles.heroPreTitle}>FINANCIAL & TAX PRACTICE</Text>
            <Text style={styles.heroTitle}>
              Chartered accounting,{'\n'}
              <Text style={styles.heroTitleGradient}>beautifully simplified.</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              The unified client portal and practice management system built for high-performing CA firms and modern businesses.
            </Text>
          </View>

          {/* Action Callout Card: Navigate to Choose How You Enter (Next Page) */}
          <View style={styles.heroCtaCard}>
            <View style={styles.heroCtaLeft}>
              <Text style={styles.heroCtaTitle}>Ready to enter your portal?</Text>
              <Text style={styles.heroCtaSubtitle}>
                Choose between Client Portal and CA Admin Workspace.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.heroCtaBtn}
              onPress={() => router.push('/(auth)/portal-select')}
              activeOpacity={0.85}
            >
              <Text style={styles.heroCtaBtnText}>Choose How You Enter</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Quick Capability Highlights Strip */}
          <View style={styles.quickHighlightsBlock}>
            <Text style={styles.highlightsHeader}>BUILT FOR EFFICIENCY & TRUST</Text>

            <View style={styles.highlightItemsStack}>
              <View style={styles.highlightRow}>
                <View style={[styles.iconBullet, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="receipt-outline" size={18} color="#2563EB" />
                </View>
                <View style={styles.highlightRowText}>
                  <Text style={styles.highlightRowTitle}>Compliant GST Invoicing</Text>
                  <Text style={styles.highlightRowDesc}>Calculates CGST, SGST & IGST with instant PDF generation.</Text>
                </View>
              </View>

              <View style={styles.highlightRow}>
                <View style={[styles.iconBullet, { backgroundColor: '#FFFBEB' }]}>
                  <Ionicons name="cloud-upload-outline" size={18} color="#D97706" />
                </View>
                <View style={styles.highlightRowText}>
                  <Text style={styles.highlightRowTitle}>Secure Document Exchange</Text>
                  <Text style={styles.highlightRowDesc}>Request, upload, review, and approve files with full audit history.</Text>
                </View>
              </View>

              <View style={styles.highlightRow}>
                <View style={[styles.iconBullet, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="calendar-outline" size={18} color="#059669" />
                </View>
                <View style={styles.highlightRowText}>
                  <Text style={styles.highlightRowTitle}>Statutory Tax Deadlines</Text>
                  <Text style={styles.highlightRowDesc}>Pre-loaded reminders for GSTR-1, 3B, Advance Tax and ITR.</Text>
                </View>
              </View>

              <View style={styles.highlightRow}>
                <View style={[styles.iconBullet, { backgroundColor: '#FAF5FF' }]}>
                  <Ionicons name="chatbubbles-outline" size={18} color="#7C3AED" />
                </View>
                <View style={styles.highlightRowText}>
                  <Text style={styles.highlightRowTitle}>Direct Advisory Messaging</Text>
                  <Text style={styles.highlightRowDesc}>Live messaging between client and CA without scattered email chains.</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Security Stamp & Footer */}
          <View style={styles.footerContainer}>
            <View style={styles.securitySeal}>
              <Ionicons name="lock-closed" size={14} color="#059669" />
              <Text style={styles.securitySealText}>256-BIT ENCRYPTED · SOC-2 READY · IT ACT 2000</Text>
            </View>
            <Text style={styles.footerNote}>CA Connect · Next-Gen CA Management Platform</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flexGrow: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 460,
  },

  // Brand Row
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  logoCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoOrb: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  brandName: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: 16,
    color: '#0F172A',
    letterSpacing: 1.2,
  },
  topPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  greenLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  topPillText: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: 10,
    color: '#475569',
    letterSpacing: 0.5,
  },

  // Hero Section
  heroBlock: {
    marginVertical: Spacing.md,
  },
  heroPreTitle: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: 11,
    color: '#2563EB',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heroTitle: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: 28,
    color: '#0F172A',
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  heroTitleGradient: {
    color: '#2563EB',
  },
  heroSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: '#475569',
    lineHeight: 22,
  },

  // Role Selection Header
  roleSelectionHeader: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingHorizontal: 2,
  },
  roleSelectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 17,
    color: '#0F172A',
  },
  roleSelectionSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: '#64748B',
    marginTop: 1,
  },

  // Gateway Cards
  gatewaysContainer: {
    gap: Spacing.md,
    marginVertical: Spacing.sm,
  },
  gatewayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  gatewayCardActiveClient: {
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  gatewayCardActiveAdmin: {
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOpacity: 0.12,
    shadowRadius: 12,
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
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  gatewayBadgeClient: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  gatewayBadgeTextClient: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: 10,
    color: '#059669',
    letterSpacing: 0.5,
  },
  gatewayBadgeAdmin: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  gatewayBadgeTextAdmin: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: 10,
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  gatewayHeading: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 19,
    color: '#0F172A',
    marginBottom: 4,
  },
  gatewayDescription: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs + 1,
    color: '#475569',
    lineHeight: 19,
    marginBottom: Spacing.md,
  },
  pillFeatureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.md,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  featurePillText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
    color: '#334155',
  },

  // Gateway Action Rows
  gatewayActionRow: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  clientActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  clientActionBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: '#FFFFFF',
  },
  adminActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  adminActionBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: '#FFFFFF',
  },
  signupTextBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  signupTextBtnContent: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs + 1,
    color: '#64748B',
  },
  signupUnderline: {
    fontFamily: Typography.fontFamily.bold,
    color: '#059669',
  },

  // Quick Highlights Block
  quickHighlightsBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: Spacing.lg,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  highlightsHeader: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 11,
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  highlightItemsStack: {
    gap: Spacing.md,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBullet: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  highlightRowText: {
    flex: 1,
  },
  highlightRowTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 2,
  },
  highlightRowDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },

  // Footer
  footerContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: 6,
  },
  securitySeal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  securitySealText: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: 9,
    color: '#059669',
    letterSpacing: 0.5,
  },
  footerNote: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  topSignInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    gap: 4,
    ...Shadows.sm,
  },
  topSignInBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  heroCtaCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    padding: Spacing.lg,
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: Spacing.md,
    ...Shadows.md,
  },
  heroCtaLeft: {
    gap: 4,
  },
  heroCtaTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  heroCtaSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  heroCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    height: 48,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  heroCtaBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: '#FFFFFF',
  },
});

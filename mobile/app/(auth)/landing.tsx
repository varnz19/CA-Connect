import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../constants/theme';

const { width } = Dimensions.get('window');

// Colors from prompt to guarantee exact match
const INK = '#14261E';
const DEEP_GREEN = '#1F3D2E';
const PAPER = '#F5F6F1';
const PAPER_CARD = '#FBFBF8';
const BRASS = '#B8863A';
const SOFT_BRASS = '#EFE3C8';
const HAIRLINE = '#DAD9CE';
const SEC_TEXT = '#5B6560';
const RUST = '#A34B34';

export default function LandingScreen() {
  const router = useRouter();
  
  // Hover states for web
  const [hoveredAdmin, setHoveredAdmin] = useState(false);
  const [hoveredClient, setHoveredClient] = useState(false);
  const [hoveredReg, setHoveredReg] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        
        {/* LEFT PANEL */}
        <View style={styles.leftPanel}>
          <View style={styles.leftContent}>
            <View style={styles.logoWrapper}>
              <MaterialIcons name="account-balance" size={48} color={PAPER} />
            </View>
            
            <Text style={styles.brandTitle}>CA CONNECT</Text>
            
            <View style={styles.brassDivider} />
            
            <Text style={styles.brandSubtitle}>Official Financial & Compliance Portal</Text>
            <Text style={styles.brandTagline}>
              Securely manage your records, audit logs, and accounting journals with uncompromising precision.
            </Text>
          </View>
        </View>

        {/* RIGHT PANEL */}
        <ScrollView 
          style={styles.rightScroll} 
          contentContainerStyle={styles.rightPanelContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.rightContent}>
            
            <View style={styles.headerArea}>
              <Text style={styles.monoHeading}>Select Portal</Text>
              <Text style={styles.largeHeading}>Welcome Back</Text>
              <Text style={styles.supportingCopy}>
                Please choose your designated portal to access secure records and services.
              </Text>
            </View>

            <View style={styles.cardsArea}>
              {/* Admin Card */}
              <TouchableOpacity
                style={[
                  styles.portalCard, 
                  styles.adminCard,
                  Platform.OS === 'web' && hoveredAdmin && styles.portalCardHover
                ]}
                activeOpacity={0.9}
                onPress={() => router.push('/(auth)/admin-login')}
                onMouseEnter={() => setHoveredAdmin(true)}
                onMouseLeave={() => setHoveredAdmin(false)}
              >
                <View style={styles.cardIconWrapper}>
                  <MaterialIcons name="security" size={32} color={INK} />
                </View>
                <View style={styles.cardTextWrapper}>
                  <Text style={styles.cardTitle}>Admin Portal</Text>
                  <Text style={styles.cardDesc}>
                    Manage ledgers, issue invoices, review client files, and oversee compliance tasks.
                  </Text>
                </View>
                <View style={styles.arrowWrapper}>
                  <MaterialIcons name="arrow-forward" size={24} color={BRASS} />
                </View>
              </TouchableOpacity>

              {/* Client Card */}
              <TouchableOpacity
                style={[
                  styles.portalCard, 
                  styles.clientCard,
                  Platform.OS === 'web' && hoveredClient && styles.portalCardHover
                ]}
                activeOpacity={0.9}
                onPress={() => router.push('/(auth)/client-login')}
                onMouseEnter={() => setHoveredClient(true)}
                onMouseLeave={() => setHoveredClient(false)}
              >
                <View style={styles.cardIconWrapper}>
                  <MaterialIcons name="person" size={32} color={BRASS} />
                </View>
                <View style={styles.cardTextWrapper}>
                  <Text style={styles.cardTitle}>Client Portal</Text>
                  <Text style={styles.cardDesc}>
                    Access financial records, upload secure documents, and book advisory sessions.
                  </Text>
                </View>
                <View style={styles.arrowWrapper}>
                  <MaterialIcons name="arrow-forward" size={24} color={BRASS} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Registration Panel */}
            <View style={styles.registrationPanel}>
              <View style={styles.regTextWrapper}>
                <Text style={styles.regHeading}>New Client?</Text>
                <Text style={styles.regCopy}>
                  Establish a secure connection with our firm to initiate services.
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.createBtn,
                  Platform.OS === 'web' && hoveredReg && styles.createBtnHover
                ]}
                activeOpacity={0.9}
                onPress={() => router.push('/(auth)/signup')}
                onMouseEnter={() => setHoveredReg(true)}
                onMouseLeave={() => setHoveredReg(false)}
              >
                <Text style={styles.createBtnText}>Create Account</Text>
                <MaterialIcons name="person-add" size={18} color={PAPER} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <MaterialIcons name="lock-outline" size={14} color={SEC_TEXT} style={{ marginRight: 6 }} />
              <Text style={styles.footerText}>Secure 256-bit SSL encrypted connection</Text>
            </View>

          </View>
        </ScrollView>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PAPER,
  },
  container: {
    flex: 1,
    flexDirection: width > 768 ? 'row' : 'column',
  },
  leftPanel: {
    width: width > 768 ? '35%' : '100%',
    backgroundColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['3xl'],
    borderRightWidth: width > 768 ? 1 : 0,
    borderBottomWidth: width > 768 ? 0 : 1,
    borderColor: BRASS, // Thin brass divider from prompt
  },
  leftContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logoWrapper: {
    marginBottom: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: 42,
    color: PAPER,
    letterSpacing: 1,
    textAlign: 'center',
  },
  brassDivider: {
    width: 60,
    height: 1,
    backgroundColor: BRASS,
    marginVertical: Spacing.xl,
  },
  brandSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.lg,
    color: PAPER,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  brandTagline: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 13,
    color: SOFT_BRASS,
    textAlign: 'center',
    lineHeight: 20,
  },
  rightScroll: {
    flex: 1,
    backgroundColor: PAPER,
  },
  rightPanelContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width > 768 ? Spacing['3xl'] : Spacing.xl,
  },
  rightContent: {
    width: '100%',
    maxWidth: 600, // Editorial grid max width
  },
  headerArea: {
    marginBottom: Spacing['2xl'],
  },
  monoHeading: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 12,
    color: SEC_TEXT,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  largeHeading: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 36,
    color: INK,
    marginBottom: Spacing.sm,
  },
  supportingCopy: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: SEC_TEXT,
    lineHeight: 24,
  },
  cardsArea: {
    gap: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
  portalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PAPER_CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: 0,
    padding: Spacing.xl,
    ...Platform.select({
      web: { transition: 'all 200ms ease' }
    }),
  },
  portalCardHover: {
    transform: [{ translateY: -2 }],
    borderColor: SEC_TEXT,
  },
  adminCard: {
    borderLeftWidth: 4,
    borderLeftColor: INK,
  },
  clientCard: {
    borderLeftWidth: 4,
    borderLeftColor: BRASS,
  },
  cardIconWrapper: {
    marginRight: Spacing.xl,
  },
  cardTextWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 18,
    color: INK,
    marginBottom: 4,
  },
  cardDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 14,
    color: SEC_TEXT,
    lineHeight: 20,
  },
  arrowWrapper: {
    marginLeft: Spacing.base,
  },
  registrationPanel: {
    flexDirection: width > 480 ? 'row' : 'column',
    alignItems: width > 480 ? 'center' : 'stretch',
    backgroundColor: PAPER_CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: 0,
    padding: Spacing.xl,
    gap: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
  regTextWrapper: {
    flex: 1,
  },
  regHeading: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 18,
    color: INK,
    marginBottom: 4,
  },
  regCopy: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 14,
    color: SEC_TEXT,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: INK,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: 0,
    ...Platform.select({
      web: { transition: 'background-color 200ms ease' }
    }),
  },
  createBtnHover: {
    backgroundColor: DEEP_GREEN,
  },
  createBtnText: {
    fontFamily: Typography.fontFamily.semiBold, // Inter
    fontSize: 14,
    color: PAPER,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
  },
  footerText: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 11,
    color: SEC_TEXT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Luxury Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.gradientDot1} />
          <View style={styles.gradientDot2} />
          <View style={styles.logoWrapper}>
            <MaterialIcons name="account-balance" size={42} color="#FFFFFF" />
          </View>
          <Text style={styles.brandTitle}>CA CONNECT</Text>
          <Text style={styles.brandSubtitle}>Secure Financial & Compliance Portal</Text>
          <Text style={styles.brandTagline}>Collaborate, upload documents, track active GST services, and process billing seamlessly.</Text>
        </View>

        {/* Action Panel */}
        <View style={styles.panel}>
          <Text style={styles.instructionText}>Select portal to sign in</Text>

          {/* Admin Card */}
          <TouchableOpacity
            style={[styles.portalCard, styles.adminCard]}
            activeOpacity={0.85}
            onPress={() => router.push('/(auth)/admin-login')}
          >
            <View style={[styles.iconBg, { backgroundColor: '#EEF2F6' }]}>
              <MaterialIcons name="security" size={26} color={Colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: Colors.primary }]}>Admin Portal</Text>
              <Text style={styles.cardDesc}>
                Manage client profiles, assign services, handle GST billing, invoice creation, and track consultation requests.
              </Text>
            </View>
            <MaterialIcons name="arrow-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>

          {/* Client Card */}
          <TouchableOpacity
            style={[styles.portalCard, styles.clientCard]}
            activeOpacity={0.85}
            onPress={() => router.push('/(auth)/client-login')}
          >
            <View style={[styles.iconBg, { backgroundColor: '#F0FDF4' }]}>
              <MaterialIcons name="person" size={26} color={Colors.success} />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: Colors.success }]}>Client Portal</Text>
              <Text style={styles.cardDesc}>
                View GST filings, upload tax docs, download invoices, chat with CA, and book consulting sessions.
              </Text>
            </View>
            <MaterialIcons name="arrow-forward" size={20} color={Colors.success} />
          </TouchableOpacity>
        </View>

        {/* Client Registration Signup Flow */}
        <View style={styles.signupSection}>
          <Text style={styles.signupLabel}>New Client? Register below to get started</Text>
          <TouchableOpacity
            style={styles.signupButton}
            activeOpacity={0.8}
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text style={styles.signupButtonText}>Create Client Account</Text>
            <MaterialIcons name="person-add" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Secure badge */}
        <View style={styles.footer}>
          <MaterialIcons name="lock-outline" size={12} color={Colors.textTertiary} />
          <Text style={styles.footerText}>Secure 256-bit SSL encrypted connection</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0B2545', // Premium luxury dark background
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate background below header
  },
  heroBanner: {
    backgroundColor: '#0B2545',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.md,
  },
  gradientDot1: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(56, 189, 248, 0.15)', // sky blue blur
  },
  gradientDot2: {
    position: 'absolute',
    bottom: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(99, 102, 241, 0.15)', // indigo blur
  },
  logoWrapper: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  brandTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 24,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: '#94A3B8',
    marginTop: 2,
  },
  brandTagline: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 12,
    color: '#CBD5E1',
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 18,
    paddingHorizontal: Spacing.sm,
  },
  panel: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  instructionText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  portalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  adminCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  clientCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
  },
  cardDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  signupSection: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.lg,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: Spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
    gap: Spacing.sm,
  },
  signupLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary, // Premium Primary solid fill
    borderRadius: 12,
    height: 44,
    width: '100%',
  },
  signupButtonText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.sm,
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 'auto',
    paddingVertical: Spacing.md,
  },
  footerText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: Colors.textTertiary,
  },
});

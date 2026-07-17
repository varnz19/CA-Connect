import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Branding & Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="account-balance" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.brandName}>CA Connect</Text>
          <Text style={styles.brandTagline}>Chartered Accountant Client Portal</Text>
        </View>

        {/* Portal Selection Cards */}
        <View style={styles.cardsContainer}>
          <Text style={styles.instructionText}>Select your portal to continue</Text>

          {/* Admin Card */}
          <TouchableOpacity
            style={styles.portalCard}
            activeOpacity={0.85}
            onPress={() => router.push('/(auth)/admin-login')}
          >
            <View style={[styles.iconBg, { backgroundColor: `${Colors.primary}0D` }]}>
              <MaterialIcons name="security" size={28} color={Colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Admin Portal</Text>
              <Text style={styles.cardDesc}>
                Access firm dashboard, manage clients, handle GST billing, documents, and scheduling.
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textTertiary} />
          </TouchableOpacity>

          {/* Client Card */}
          <TouchableOpacity
            style={styles.portalCard}
            activeOpacity={0.85}
            onPress={() => router.push('/(auth)/client-login')}
          >
            <View style={[styles.iconBg, { backgroundColor: `${Colors.secondary}15` }]}>
              <MaterialIcons name="person" size={28} color={Colors.secondaryDark} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Client Portal</Text>
              <Text style={styles.cardDesc}>
                Upload requested documents, view/download GST invoices, coordinate appointments, and chat.
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>Secure 256-bit SSL encrypted connection</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Background #F8FAFC from spec
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Border #E5E7EB from spec
  },
  brandName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 28,
    color: Colors.primary, // Primary #0B2545
  },
  brandTagline: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  cardsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  instructionText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  portalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard, // Surface #FFFFFF
    padding: Spacing.base,
    borderRadius: 16, // Rounded Corners 12-16px
    borderWidth: 1,
    borderColor: '#E5E7EB', // Border #E5E7EB from spec
    ...Shadows.sm,
  },
  iconBg: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.primary,
  },
  cardDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  footerText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});

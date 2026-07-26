import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { profileService } from '../../services/profileService';
import { api } from '../../services/api';

export default function CompleteGoogleProfileScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const params = useLocalSearchParams<{ userData: string; tokens: string }>();

  const userData = params.userData ? JSON.parse(params.userData) : {};
  const tokens = params.tokens ? JSON.parse(params.tokens) : {};

  const [phone, setPhone] = useState('');
  const [firmName, setFirmName] = useState('');
  const [gstState, setGstState] = useState('Maharashtra');
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    if (!phone.trim()) {
      Alert.alert('Required', 'Please enter your phone number.');
      return;
    }
    if (!firmName.trim()) {
      Alert.alert('Required', 'Please enter your firm name.');
      return;
    }

    setIsLoading(true);
    try {
      // Set the token so the API calls are authenticated
      api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;

      // Update the profile with additional details
      await profileService.updateProfile({
        phone: phone.trim(),
        firmName: firmName.trim(),
        gstState: gstState.trim() || 'Maharashtra',
      });

      // Now login (this triggers the redirect to dashboard in _layout.tsx)
      login(userData, tokens);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Login directly with defaults
    login(userData, tokens);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="person-add" size={32} color={Colors.secondary} />
            </View>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Welcome, {userData.firstName}! Please fill in a few more details to get started.
            </Text>
          </View>

          {/* Google Info Preview */}
          <View style={styles.googleInfoCard}>
            <View style={styles.googleInfoRow}>
              <MaterialIcons name="check-circle" size={18} color={Colors.success} />
              <Text style={styles.googleInfoText}>
                Signed in as <Text style={styles.googleEmailText}>{userData.email}</Text>
              </Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Business Details</Text>
            <Text style={styles.cardSubtitle}>These details help your CA serve you better</Text>

            <View style={styles.form}>
              <AppInput
                label="Phone Number *"
                placeholder="+91-9876543210"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <AppInput
                label="Firm / Business Name *"
                placeholder="e.g. Sunrise Enterprises"
                value={firmName}
                onChangeText={setFirmName}
              />

              <AppInput
                label="GST State"
                placeholder="Maharashtra"
                value={gstState}
                onChangeText={setGstState}
              />

              <AppButton
                title={isLoading ? 'Saving...' : 'Complete Registration'}
                onPress={handleComplete}
                loading={isLoading}
                style={styles.submitBtn}
              />

              <AppButton
                title="Skip for Now"
                variant="ghost"
                onPress={handleSkip}
                style={styles.skipBtn}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background }, // paper
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center', // Center for 480px width
  },
  header: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
    width: '100%',
    maxWidth: 480,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 0,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: 24,
    color: Colors.primary, // ink-900
    marginTop: Spacing.xs,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: Spacing.lg,
    lineHeight: 20,
  },
  googleInfoCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 0,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.success,
    width: '100%',
    maxWidth: 480,
  },
  googleInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  googleInfoText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  googleEmailText: {
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primaryLight,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 0, // structured
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
    maxWidth: 480, // restricted width
  },
  cardTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.lg,
    color: Colors.primary,
  },
  cardSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.base,
  },
  form: {
    gap: Spacing.base,
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
  skipBtn: {
    marginTop: -4,
  },
});

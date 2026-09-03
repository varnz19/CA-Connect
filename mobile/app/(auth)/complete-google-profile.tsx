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
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing } from '../../constants/theme';
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
      Alert.alert('Required', 'Please enter your contact phone number.');
      return;
    }
    if (!firmName.trim()) {
      Alert.alert('Required', 'Please enter your business or firm name.');
      return;
    }

    setIsLoading(true);
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;

      await profileService.updateProfile({
        phone: phone.trim(),
        firmName: firmName.trim(),
        gstState: gstState.trim() || 'Maharashtra',
      });

      login(userData, tokens);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
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
          <View style={styles.container}>
            {/* Header Block */}
            <View style={styles.headerBlock}>
              <Text style={styles.refCode}>AUTH-SSO-PROFILE</Text>
              <Text style={styles.pageTitle}>Complete Client Record</Text>
              <Text style={styles.pageSubtitle}>
                Welcome, {userData.firstName}. Complete your business record to associate your tax accounts.
              </Text>
            </View>

            {/* SSO Meta Info */}
            <View style={styles.ssoMetaRow}>
              <Text style={styles.ssoMetaLabel}>AUTHENTICATED IDENTITY</Text>
              <Text style={styles.ssoMetaEmail}>{userData.email}</Text>
            </View>

            <View style={styles.hairlineRule} />

            {/* Flat Form */}
            <View style={styles.form}>
              <AppInput
                label="Primary Phone Number *"
                placeholder="+91-9876543210"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <AppInput
                label="Registered Business / Firm Name *"
                placeholder="ABC Enterprises"
                value={firmName}
                onChangeText={setFirmName}
              />

              <AppInput
                label="GST Jurisdiction State"
                placeholder="Maharashtra"
                value={gstState}
                onChangeText={setGstState}
              />

              <AppButton
                title={isLoading ? 'Updating Record...' : 'Complete Registration'}
                onPress={handleComplete}
                loading={isLoading}
                size="md"
                style={styles.actionBtn}
              />

              <AppButton
                title="Skip For Now"
                onPress={handleSkip}
                variant="outline"
                size="md"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: {
    paddingVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 480,
  },
  headerBlock: {
    marginBottom: Spacing.lg,
  },
  refCode: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  pageTitle: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: 24,
    color: Colors.primary,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ssoMetaRow: {
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.hairline,
    marginBottom: Spacing.md,
  },
  ssoMetaLabel: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 9,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
  ssoMetaEmail: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: Typography.size.sm,
    color: Colors.primary,
    marginTop: 2,
  },
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.hairline,
    marginVertical: Spacing.md,
  },
  form: {
    gap: Spacing.lg,
  },
  actionBtn: {
    marginTop: Spacing.sm,
  },
});

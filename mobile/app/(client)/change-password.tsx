import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { profileService } from '../../services/profileService';

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function ClientChangePasswordScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(passwordSchema) as any,
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: PasswordForm) => {
    setIsLoading(true);
    try {
      const response = await profileService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (response.success) {
        Alert.alert('Success', 'Access credentials updated successfully.', [
          { text: 'OK', onPress: () => router.replace('/(client)/profile') }
        ]);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Verification failed. Please check current password.';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.replace('/(client)/profile')} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={18} color={Colors.primary} />
            <Text style={styles.backText}>Profile</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerBlock}>
              <Text style={styles.refCode}>SECURITY CREDENTIALS</Text>
              <Text style={styles.pageTitle}>Change Account Password</Text>
              <Text style={styles.pageSubtitle}>
                Update your client portal password to maintain secure access to your statutory records.
              </Text>
            </View>

            <View style={styles.hairlineRule} />

            {/* Flat Form */}
            <View style={styles.form}>
              <Controller
                control={control}
                name="currentPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Current Password *"
                    placeholder="Enter current password"
                    isPassword
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.currentPassword?.message as any}
                  />
                )}
              />

              <Controller
                control={control}
                name="newPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="New Secure Password *"
                    placeholder="Minimum 8 characters"
                    isPassword
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.newPassword?.message as any}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Re-enter New Password *"
                    placeholder="Confirm new password"
                    isPassword
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.confirmPassword?.message as any}
                  />
                )}
              />

              <AppButton
                title={isLoading ? 'Verifying...' : 'Update Password'}
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                size="md"
                style={styles.submitBtn}
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
  topBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  scroll: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 480,
  },
  headerBlock: {
    marginBottom: Spacing.md,
  },
  refCode: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  pageTitle: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: Typography.size.xl,
    color: Colors.primary,
  },
  pageSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.hairline,
    marginVertical: Spacing.lg,
  },
  form: {
    gap: Spacing.md,
  },
  submitBtn: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});

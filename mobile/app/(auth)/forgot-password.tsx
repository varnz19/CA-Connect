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
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors, Typography, Spacing } from '../../constants/theme';

import { authService } from '../../services/authService';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Forgot Password" showBack />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {!sent ? (
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="lock-reset" size={40} color={Colors.primary} />
              </View>
              <Text style={styles.title}>Reset your password</Text>
              <Text style={styles.description}>
                Enter the email address associated with your account and we'll send you a link to
                reset your password.
              </Text>

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Email Address"
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon="email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                  />
                )}
              />

              <AppButton
                title="Send Reset Link"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                fullWidth
                size="lg"
                style={styles.button}
              />

              <AppButton
                title="Back to Login"
                onPress={() => router.back()}
                variant="ghost"
                fullWidth
                size="lg"
              />
            </View>
          ) : (
            <View style={styles.content}>
              <View style={[styles.iconContainer, styles.successIcon]}>
                <MaterialIcons name="mark-email-read" size={40} color={Colors.success} />
              </View>
              <Text style={styles.title}>Check your email</Text>
              <Text style={styles.description}>
                We've sent a password reset link to{'\n'}
                <Text style={styles.emailHighlight}>{getValues('email')}</Text>
              </Text>
              <Text style={styles.noteText}>
                Didn't receive the email? Check your spam folder or try again.
              </Text>
              <AppButton
                title="Back to Login"
                onPress={() => router.replace('/(auth)/landing')}
                fullWidth
                size="lg"
                style={styles.button}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: Spacing.xl,
  },
  content: {
    paddingTop: Spacing.xl,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    alignSelf: 'flex-start',
  },
  successIcon: {
    borderColor: Colors.success,
  },
  title: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: 24,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  description: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.md,
    marginBottom: Spacing.xl,
  },
  emailHighlight: {
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primaryLight,
  },
  noteText: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: Spacing.xl,
    textTransform: 'uppercase',
  },
  button: {
    marginBottom: Spacing.sm,
  },
});

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
      <AppHeader title="Password Recovery" showBack />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {!sent ? (
              <View style={styles.content}>
                <Text style={styles.refCode}>AUTH-PW-RESET</Text>
                <Text style={styles.title}>Reset Account Password</Text>
                <Text style={styles.description}>
                  Specify your verified email address to receive an encrypted password recovery link.
                </Text>

                <View style={styles.hairlineRule} />

                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <AppInput
                      label="Registered Email Address"
                      placeholder="name@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.email?.message}
                    />
                  )}
                />

                <AppButton
                  title={isLoading ? 'Dispatching...' : 'Send Recovery Link'}
                  onPress={handleSubmit(onSubmit)}
                  loading={isLoading}
                  fullWidth
                  size="md"
                  style={styles.button}
                />

                <AppButton
                  title="Return to Sign In"
                  onPress={() => router.back()}
                  variant="outline"
                  fullWidth
                  size="md"
                />
              </View>
            ) : (
              <View style={styles.content}>
                <Text style={styles.refCode}>STATUS: DISPATCHED</Text>
                <Text style={styles.title}>Recovery Link Sent</Text>
                <Text style={styles.description}>
                  A password reset dispatch has been routed to{' '}
                  <Text style={styles.emailHighlight}>{getValues('email')}</Text>. Check your inbox or spam directory to proceed.
                </Text>
                <AppButton
                  title="Return to Portal Selection"
                  onPress={() => router.replace('/(auth)/landing')}
                  fullWidth
                  size="md"
                  style={styles.button}
                />
              </View>
            )}
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
    flexGrow: 1,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 480,
  },
  content: {
    paddingVertical: Spacing.xl,
  },
  refCode: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: 24,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  description: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.hairline,
    marginBottom: Spacing.xl,
  },
  emailHighlight: {
    fontFamily: Typography.fontFamily.monoBold,
    color: Colors.primary,
  },
  button: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
});

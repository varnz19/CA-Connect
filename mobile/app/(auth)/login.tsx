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
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { authService } from '../../services/authService';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });
      if (response.success && response.data) {
        login(response.data.user, response.data.tokens);
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid email or password. Please try again.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
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
          {/* Logo & Brand */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="account-balance" size={36} color={Colors.textLight} />
            </View>
            <Text style={styles.brandName}>CA Connect</Text>
            <Text style={styles.brandTagline}>Secure Client Management Platform</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSubtitle}>Sign in to your account to continue</Text>

            <View style={styles.form}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Email Address"
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    leftIcon="email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Password"
                    placeholder="Enter your password"
                    leftIcon="lock"
                    isPassword
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />
                )}
              />

              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
                style={styles.forgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <AppButton
                title="Sign In"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                fullWidth
                size="lg"
                style={styles.loginButton}
              />
            </View>

            {/* Demo credentials hint */}
            <View style={styles.demoBox}>
              <MaterialIcons name="info-outline" size={14} color={Colors.secondary} />
              <View style={styles.demoContent}>
                <Text style={styles.demoTitle}>Demo Credentials</Text>
                <Text style={styles.demoText}>Admin: admin@caconnect.in / Admin@123</Text>
                <Text style={styles.demoText}>Client: rajesh.kumar@example.com / Client@123</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <MaterialIcons name="security" size={14} color={Colors.textTertiary} />
            <Text style={styles.footerText}>Secured with 256-bit encryption</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.base,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  brandName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size['3xl'],
    color: Colors.textLight,
    letterSpacing: Typography.letterSpacing.tight,
  },
  brandTagline: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.65)',
    marginTop: Spacing.xs,
    letterSpacing: Typography.letterSpacing.wide,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 24,
    padding: Spacing.xl,
    marginBottom: Spacing.base,
  },
  cardTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size['2xl'],
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  form: {
    gap: 0,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.base,
    marginTop: -Spacing.xs,
  },
  forgotPasswordText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.secondary,
  },
  loginButton: {
    marginTop: Spacing.xs,
  },
  demoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    backgroundColor: Colors.infoLight,
    borderRadius: 10,
    padding: Spacing.sm + 2,
    marginTop: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(77,166,255,0.2)',
  },
  demoContent: {
    flex: 1,
  },
  demoTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    color: Colors.secondary,
    marginBottom: 2,
  },
  demoText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  footerText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.4)',
  },
});

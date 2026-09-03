import React, { useState, useEffect } from 'react';
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
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { authService } from '../../services/authService';

WebBrowser.maybeCompleteAuthSession();

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@caconnect.in', password: 'Admin@123' },
  });

  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '1234567890-android.apps.googleusercontent.com';
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '1234567890-ios.apps.googleusercontent.com';
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '1234567890-web.apps.googleusercontent.com';

  const redirectUri = makeRedirectUri();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId,
    iosClientId,
    webClientId,
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const auth = response.authentication || (response as any).params;
      const idToken = auth?.idToken || auth?.id_token;
      const accessToken = auth?.accessToken || auth?.access_token;
      if (idToken || accessToken) {
        setIsLoading(true);
        authService
          .googleLogin({ idToken, accessToken })
          .then((res) => {
            if (res.success && res.data) {
              if (res.data.user.role !== 'ADMIN') {
                Alert.alert('Access Denied', 'This portal is restricted to Admin accounts only.');
                return;
              }
              login(res.data.user, res.data.tokens);
            } else {
              Alert.alert('Google Login Failed', res.message || 'Verification failed.');
            }
          })
          .catch((err) => {
            const msg = err.response?.data?.message || 'Google Auth failed.';
            Alert.alert('Error', msg);
          })
          .finally(() => setIsLoading(false));
      }
    }
  }, [response]);

  const handleGoogleLogin = async () => {
    promptAsync();
  };

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });
      if (response.success && response.data) {
        if (response.data.user.role !== 'ADMIN') {
          Alert.alert('Access Denied', 'This portal is restricted to Admin accounts only.');
          return;
        }
        login(response.data.user, response.data.tokens);
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid credentials.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Something went wrong.';
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
        {/* Navigation Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.replace('/(auth)/landing')} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={18} color={Colors.primary} />
            <Text style={styles.backText}>Portal Selection</Text>
          </TouchableOpacity>
          <View style={styles.portalTag}>
            <Text style={styles.portalTagText}>INTERNAL · ADMIN</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Header Block */}
            <View style={styles.headerBlock}>
              <Text style={styles.refCode}>REF: SEC-ADM-01</Text>
              <Text style={styles.pageTitle}>Admin Sign In</Text>
              <Text style={styles.pageSubtitle}>
                Authenticate to access practice journals, audit logs, and client accounts.
              </Text>
            </View>

            <View style={styles.hairlineRule} />

            {/* Flat Form */}
            <View style={styles.form}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Firm Email Address"
                    placeholder="admin@caconnect.in"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
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
                    label="Master Password"
                    placeholder="Enter account password"
                    secureTextEntry
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />
                )}
              />

              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
                style={styles.forgotBtn}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <View style={styles.demoBox}>
                <Text style={styles.demoBoxTitle}>PRE-LOADED DEMO CREDENTIALS</Text>
                <Text style={styles.demoBoxText}>admin@caconnect.in  ·  Admin@123</Text>
              </View>

              <AppButton
                title={isLoading ? 'Verifying...' : 'Sign In to Workspace'}
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                style={styles.loginBtn}
                size="md"
              />

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerLabel}>AUTHENTICATION ALTERNATIVES</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleBtn}
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.googleBtnText}>Continue with Google SSO</Text>
              </TouchableOpacity>
            </View>

            {/* Quiet Footer Meta */}
            <View style={styles.footer}>
              <Text style={styles.footerMeta}>256-BIT ENCRYPTION · SOC 2 VERIFIED WORKSPACE</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },
  topBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  portalTag: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  portalTagText: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 9,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
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
    marginBottom: Spacing.base,
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
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.hairline,
    marginVertical: Spacing.xl,
  },
  form: {
    gap: Spacing.lg,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
  },
  forgotText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.secondaryDark,
  },
  loginBtn: {
    marginTop: Spacing.sm,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.hairline,
  },
  dividerLabel: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 9,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
  googleBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 4,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  googleBtnText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  footer: {
    marginTop: Spacing['3xl'],
    alignItems: 'center',
  },
  footerMeta: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 9,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
  demoBox: {
    padding: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
    marginBottom: Spacing.sm,
  },
  demoBoxTitle: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 9,
    color: Colors.secondaryDark,
    letterSpacing: 1,
    marginBottom: 2,
  },
  demoBoxText: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 11,
    color: Colors.primary,
  },
});

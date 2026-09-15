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
  Image,
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
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { authService } from '../../services/authService';

WebBrowser.maybeCompleteAuthSession();

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function ClientLoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
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
        setErrorMessage(null);
        authService
          .googleLogin({ idToken, accessToken })
          .then((res) => {
            if (res.success && res.data) {
              if ((res.data as any).isNewUser) {
                router.push({
                  pathname: '/(auth)/complete-google-profile',
                  params: {
                    userData: JSON.stringify(res.data.user),
                    tokens: JSON.stringify(res.data.tokens),
                  },
                } as any);
              } else {
                login(res.data.user, res.data.tokens);
                router.replace('/(client)');
              }
            } else {
              setErrorMessage(res.message || 'Google verification failed.');
            }
          })
          .catch((err) => {
            const msg = err.response?.data?.message || 'Google Auth failed. Please try again.';
            setErrorMessage(msg);
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
    setErrorMessage(null);
    try {
      const response = await authService.login({
        email: data.email.trim(),
        password: data.password,
      });
      if (response.success && response.data) {
        if (response.data.user.role !== 'CLIENT') {
          setErrorMessage('Access Denied: This portal is restricted to Client accounts only. Please use the Admin portal.');
          return;
        }
        login(response.data.user, response.data.tokens);
        router.replace('/(client)');
      } else {
        setErrorMessage(response.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please verify your credentials.';
      setErrorMessage(msg);
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
          <TouchableOpacity onPress={() => router.replace('/(auth)/portal-select')} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={18} color={Colors.primary} />
            <Text style={styles.backText}>Portal Selection</Text>
          </TouchableOpacity>
          <View style={styles.portalTag}>
            <Text style={styles.portalTagText}>CLIENT ACCESS</Text>
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
              <Image
                source={require('../../assets/ca-logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.refCode}>REF: CL-AUTH-01</Text>
              <Text style={styles.pageTitle}>Client Sign In</Text>
              <Text style={styles.pageSubtitle}>
                Access your tax returns, invoices, document requests, and advisory calendar.
              </Text>
            </View>

            {/* Visible Error Banner */}
            {errorMessage && (
              <View style={styles.errorAlert}>
                <MaterialIcons name="error-outline" size={18} color={Colors.danger} />
                <Text style={styles.errorAlertText}>{errorMessage}</Text>
              </View>
            )}

            <View style={styles.hairlineRule} />

            {/* Flat Form */}
            <View style={styles.form}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Email Address"
                    placeholder="e.g. yourname@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={value}
                    onChangeText={(text) => {
                      onChange(text);
                      if (errorMessage) setErrorMessage(null);
                    }}
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
                    label="Account Password"
                    placeholder="Enter account password"
                    isPassword
                    autoCapitalize="none"
                    value={value}
                    onChangeText={(text) => {
                      onChange(text);
                      if (errorMessage) setErrorMessage(null);
                    }}
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

              <AppButton
                title={isLoading ? 'Authenticating...' : 'Sign In as Client'}
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                style={styles.loginBtn}
                size="md"
              />

              <View style={styles.linkRow}>
                <Text style={styles.linkText}>New client? </Text>
                <TouchableOpacity onPress={() => router.replace('/(auth)/signup')}>
                  <Text style={styles.linkHighlight}>Register account</Text>
                </TouchableOpacity>
              </View>

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
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </TouchableOpacity>
            </View>

            {/* Quiet Footer Meta */}
            <View style={styles.footer}>
              <Text style={styles.footerMeta}>256-BIT ENCRYPTED · SECURE CLIENT PORTAL</Text>
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
    borderBottomColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.successDark,
  },
  portalTag: {
    borderWidth: 1,
    borderColor: Colors.successBorder,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  portalTagText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    color: Colors.successDark,
    letterSpacing: 0.5,
  },
  scroll: {
    paddingVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: Colors.backgroundCard,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  headerBlock: {
    marginBottom: Spacing.base,
  },
  logoImage: {
    width: 48,
    height: 48,
    marginBottom: Spacing.sm,
  },
  refCode: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 10,
    color: Colors.successDark,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  pageTitle: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: 26,
    color: Colors.textPrimary,
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
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  form: {
    gap: Spacing.md,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.xs,
  },
  forgotText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    color: Colors.primaryLight,
  },
  loginBtn: {
    marginTop: Spacing.sm,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  linkText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  linkHighlight: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primaryLight,
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
    backgroundColor: Colors.border,
  },
  dividerLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  googleBtn: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundCard,
    ...Shadows.sm,
  },
  googleBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  footer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  footerMeta: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  testAccountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  testBadgeIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testBadgeContent: {
    flex: 1,
  },
  testBadgeTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#059669',
  },
  testBadgeSub: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  errorAlertText: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: Colors.danger,
  },
});



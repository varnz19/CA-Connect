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

export default function ClientLoginScreen() {
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
    defaultValues: { email: 'rajesh.kumar@example.com', password: 'Client@123' },
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
              }
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
        if (response.data.user.role !== 'CLIENT') {
          Alert.alert('Access Denied', 'This portal is restricted to Client accounts only. Please use the Admin portal.');
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
              <Text style={styles.refCode}>REF: CL-AUTH-01</Text>
              <Text style={styles.pageTitle}>Client Sign In</Text>
              <Text style={styles.pageSubtitle}>
                Access your tax returns, invoices, document requests, and advisory calendar.
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
                    label="Email Address"
                    placeholder="rajesh.kumar@example.com"
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
                    label="Account Password"
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
                <Text style={styles.demoBoxText}>rajesh.kumar@example.com  ·  Client@123</Text>
              </View>

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
    borderColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  portalTagText: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 9,
    color: Colors.secondaryDark,
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
    color: Colors.primary,
    textDecorationLine: 'underline',
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

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
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { authService } from '../../services/authService';
import { base64Encode } from '../../utils/base64';

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
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '1234567890-android.apps.googleusercontent.com';
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '1234567890-ios.apps.googleusercontent.com';
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '1234567890-web.apps.googleusercontent.com';

  const redirectUri = makeRedirectUri();
  console.log('EXPO GENERATED REDIRECT URI (Add this to Google Cloud Console):', redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId,
    iosClientId,
    webClientId,
    redirectUri,
  });

  // Handle Google Auth response on all platforms
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
                Alert.alert('Access Denied', 'This portal is restricted to Admin accounts only. Please use the Client portal.');
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
          Alert.alert('Access Denied', 'This portal is restricted to Admin accounts only. Please use the Client portal.');
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
        {/* Header navigation back to selection */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.replace('/(auth)/landing')}>
            <View style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={20} color={Colors.textPrimary} />
              <Text style={styles.backText}>Select Portal</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Brand */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="security" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.brandName}>Admin Login</Text>
            <Text style={styles.brandTagline}>CA Connect Firm Workspace</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>Enter your admin credentials to manage the firm</Text>

            <View style={styles.form}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Email Address"
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
                    label="Password"
                    placeholder="Enter your password"
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

              <AppButton
                title={isLoading ? 'Logging in...' : 'Login as Admin'}
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                style={styles.loginBtn}
              />

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleBtn}
                onPress={handleGoogleLogin}
                activeOpacity={0.85}
              >
                <View style={styles.googleIconContainer}>
                  <MaterialIcons name="g-mobiledata" size={32} color="#EA4335" />
                </View>
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </TouchableOpacity>
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
  topBar: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center', // Center content for 480px width limit
  },
  header: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
    width: '100%',
    maxWidth: 480,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 0,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border, // hairline
  },
  brandName: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: 24,
    color: Colors.primary, // ink-900
  },
  brandTagline: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 0, // Structured
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
    maxWidth: 480, // Restricted width
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
  forgotBtn: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.primaryLight, // ink-700
  },
  loginBtn: {
    marginTop: Spacing.xs,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 12,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 0,
    height: 48,
    gap: 8,
  },
  googleIconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primaryLight,
  },
});

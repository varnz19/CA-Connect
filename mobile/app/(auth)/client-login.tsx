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

export default function ClientLoginScreen() {
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

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.idToken) {
      const { idToken } = response.authentication;
      setIsLoading(true);
      authService
        .googleLogin({ idToken })
        .then((res) => {
          if (res.success && res.data) {
            login(res.data.user, res.data.tokens);
          } else {
            Alert.alert('Google Login Failed', res.message || 'Verification failed.');
          }
        })
        .catch((err) => {
          const msg = err.response?.data?.message || 'Google Auth is currently unavailable.';
          Alert.alert('Error', msg);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [response]);

  const handleGoogleLogin = async () => {
    if (androidClientId.startsWith('1234567890')) {
      // Developer Bypass: execute immediately without Alert.alert to support web testing
      setIsLoading(true);
      try {
        // Generate a mock JWT token base64 format
        const header = base64Encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = base64Encode(JSON.stringify({
          sub: 'g-user-123',
          email: 'google.client@caconnect.in',
          given_name: 'Google',
          family_name: 'Client',
          picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'
        }));
        const mockIdToken = `${header}.${payload}.signature`;

        const res = await authService.googleLogin({ idToken: mockIdToken });
        if (res.success && res.data) {
          login(res.data.user, res.data.tokens);
        } else {
          Alert.alert('Login Failed', res.message);
        }
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Verification failed.');
      } finally {
        setIsLoading(false);
      }
      return;
    }
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
              <MaterialIcons name="person" size={32} color={Colors.secondaryDark} />
            </View>
            <Text style={styles.brandName}>Client Login</Text>
            <Text style={styles.brandTagline}>CA Connect Client Portal</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>Enter your client login credentials to proceed</Text>

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
                title={isLoading ? 'Logging in...' : 'Login as Client'}
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                style={styles.loginBtn}
              />

              <TouchableOpacity
                onPress={() => router.replace('/(auth)/signup')}
                style={styles.signupLink}
              >
                <Text style={styles.signupLinkText}>
                  Don't have an account? <Text style={styles.signupHighlight}>Sign Up</Text>
                </Text>
              </TouchableOpacity>

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
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
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
    color: Colors.textPrimary,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.sm,
  },
  brandName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 24,
    color: Colors.primary,
  },
  brandTagline: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.sm,
  },
  cardTitle: {
    fontFamily: Typography.fontFamily.bold,
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
    color: Colors.secondaryDark,
  },
  loginBtn: {
    marginTop: Spacing.xs,
  },
  signupLink: {
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  signupLinkText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  signupHighlight: {
    fontFamily: Typography.fontFamily.bold,
    color: Colors.secondaryDark,
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
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: Colors.textTertiary,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 48,
    gap: 8,
    ...Shadows.sm,
  },
  googleIconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
});

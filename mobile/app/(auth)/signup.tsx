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
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { authService } from '../../services/authService';

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  firmName: z.string().optional(),
  gstState: z.string().optional(),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function ClientSignupScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(signupSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      firmName: '',
      gstState: 'Maharashtra',
    },
  });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      const response = await authService.signup(data);
      if (response.success) {
        setIsSuccess(true);
      } else {
        Alert.alert('Registration Failed', response.message || 'An error occurred.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <MaterialIcons name="mark-email-read" size={48} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>Verify your email</Text>
          <Text style={styles.successDesc}>
            A verification link has been sent to your email address. Please click on the link in the email to activate your account.
          </Text>
          <AppButton
            title="Go to Login"
            onPress={() => router.replace('/(auth)/client-login')}
            fullWidth
            style={styles.successBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
          {/* Logo & Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="person-add" size={32} color={Colors.secondaryDark} />
            </View>
            <Text style={styles.brandName}>Client Sign Up</Text>
            <Text style={styles.brandTagline}>Register a new CA Connect Client Account</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create Account</Text>
            <Text style={styles.cardSubtitle}>Submit details below to self-register</Text>

            <View style={styles.form}>
              <View style={styles.row}>
                <View style={styles.half}>
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="First Name"
                        placeholder="John"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.firstName?.message as any}
                      />
                    )}
                  />
                </View>
                <View style={styles.half}>
                  <Controller
                    control={control}
                    name="lastName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="Last Name"
                        placeholder="Doe"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.lastName?.message as any}
                      />
                    )}
                  />
                </View>
              </View>

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Email Address"
                    placeholder="john.doe@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message as any}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Password"
                    placeholder="Min 6 characters"
                    secureTextEntry
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message as any}
                  />
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Phone Number"
                    placeholder="+91-9876543210"
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.phone?.message as any}
                  />
                )}
              />

              <Controller
                control={control}
                name="firmName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Firm Name (Optional)"
                    placeholder="John Doe Enterprises"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.firmName?.message as any}
                  />
                )}
              />

              <Controller
                control={control}
                name="gstState"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="GST State"
                    placeholder="Maharashtra"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.gstState?.message as any}
                  />
                )}
              />

              <AppButton
                title={isLoading ? 'Registering...' : 'Register client'}
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                style={styles.signupBtn}
              />

              <TouchableOpacity
                onPress={() => router.replace('/(auth)/client-login')}
                style={styles.loginLink}
              >
                <Text style={styles.loginText}>
                  Already have an account? <Text style={styles.loginHighlight}>Sign In</Text>
                </Text>
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
    marginVertical: Spacing.md,
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
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  half: {
    flex: 1,
  },
  signupBtn: {
    marginTop: Spacing.sm,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  loginText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  loginHighlight: {
    fontFamily: Typography.fontFamily.bold,
    color: Colors.secondaryDark,
  },
  successContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconContainer: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Colors.success}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  successTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 24,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  successDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing['3xl'],
  },
  successBtn: {
    marginTop: Spacing.md,
  },
});

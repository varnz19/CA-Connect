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
import { clientService } from '../../services/clientService';

const addClientSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  firmName: z.string().optional(),
  panNumber: z.string().optional(),
  gstin: z.string().optional(),
  gstState: z.string().optional(),
  address: z.string().optional(),
});

type AddClientForm = z.infer<typeof addClientSchema>;

export default function AddClientScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(addClientSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      firmName: '',
      panNumber: '',
      gstin: '',
      gstState: 'Maharashtra',
      address: '',
    },
  });

  const onSubmit = async (data: AddClientForm) => {
    setIsLoading(true);
    try {
      const response = await clientService.createClient(data);
      if (response.data) {
        Alert.alert('Success', 'Client account created successfully.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Failed', 'Failed to create client.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Something went wrong. Please check your input.';
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
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={20} color={Colors.textPrimary} />
            <Text style={styles.backText}>Back to Clients</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.brandName}>Add New Client</Text>
            <Text style={styles.brandTagline}>Create a new client profile and secure login credentials</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Client Information</Text>
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
                    placeholder="client@firm.com"
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
                    label="Login Password"
                    placeholder="Min 8 characters"
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
                    label="Phone Number (Optional)"
                    placeholder="+91-9876543210"
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.phone?.message as any}
                  />
                )}
              />

              <Text style={[styles.cardTitle, { marginTop: Spacing.sm }]}>Business & GST Details</Text>

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

              <View style={styles.row}>
                <View style={styles.half}>
                  <Controller
                    control={control}
                    name="panNumber"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="PAN Card"
                        placeholder="ABCDE1234F"
                        autoCapitalize="characters"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.panNumber?.message as any}
                      />
                    )}
                  />
                </View>
                <View style={styles.half}>
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
                </View>
              </View>

              <Controller
                control={control}
                name="gstin"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="GSTIN Number"
                    placeholder="27ABCDE1234F1Z5"
                    autoCapitalize="characters"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.gstin?.message as any}
                  />
                )}
              />

              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Address"
                    placeholder="Office Suite, Business Complex, City"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.address?.message as any}
                  />
                )}
              />

              <AppButton
                title={isLoading ? 'Creating Client...' : 'Create Client Profile'}
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
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
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.base,
  },
  brandName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 22,
    color: Colors.primary,
  },
  brandTagline: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.sm,
  },
  cardTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  form: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  half: {
    flex: 1,
  },
  submitBtn: {
    marginTop: Spacing.base,
  },
});

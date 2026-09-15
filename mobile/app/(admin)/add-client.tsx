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
import { Colors, Typography, Spacing } from '../../constants/theme';
import { clientService } from '../../services/clientService';

const addClientSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Valid contact number required'),
  firmName: z.string().min(2, 'Firm or business name required'),
  panNumber: z.string().min(10, 'Valid 10-character PAN required'),
  gstin: z.string().min(15, 'Valid 15-character GSTIN required'),
  gstState: z.string().min(2, 'Jurisdiction state required'),
  address: z.string().min(5, 'Billing address required'),
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
        Alert.alert('Success', 'Client account registered in firm directory.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Failed', 'Failed to create client.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Something went wrong. Please check your inputs.';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={18} color={Colors.primary} />
            <Text style={styles.backText}>Client Directory</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerBlock}>
              <Text style={styles.refCode}>DIRECTORY ONBOARDING</Text>
              <Text style={styles.pageTitle}>Add Client Account</Text>
              <Text style={styles.pageSubtitle}>
                Register a new client profile, business credentials, and statutory tax details.
              </Text>
            </View>

            <View style={styles.hairlineRule} />

            {/* Flat Form: Single column with generous spacing */}
            <View style={styles.form}>
              <Text style={styles.sectionHeading}>Contact Information</Text>

              <View style={styles.row}>
                <View style={styles.half}>
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="First Name *"
                        placeholder="e.g. Rahul"
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
                        label="Last Name *"
                        placeholder="e.g. Sharma"
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
                    label="Official Email Address *"
                    placeholder="e.g. client@firm.com"
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
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Contact Phone Number *"
                    placeholder="+91-9876543210"
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.phone?.message as any}
                  />
                )}
              />

              <View style={styles.hairlineRule} />
              <Text style={styles.sectionHeading}>Business & Statutory Details</Text>

              <Controller
                control={control}
                name="firmName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Firm / Trade Name *"
                    placeholder="e.g. Enterprise Pvt Ltd"
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
                        label="PAN Card Number *"
                        placeholder="AAAAA0000A"
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
                        label="GST State Jurisdiction *"
                        placeholder="e.g. Maharashtra"
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
                    label="GSTIN Identification Number *"
                    placeholder="27AAAAA0000A1Z5"
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
                    label="Registered Billing Address *"
                    placeholder="401 Commercial Chamber, Nariman Point, Mumbai"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.address?.message as any}
                  />
                )}
              />

              <AppButton
                title={isLoading ? 'Creating Record...' : 'Register Client Account'}
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                size="md"
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
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  topBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
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
  scroll: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 520,
  },
  headerBlock: {
    marginBottom: Spacing.md,
  },
  refCode: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  pageTitle: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: Typography.size.xl,
    color: Colors.primary,
  },
  pageSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.hairline,
    marginVertical: Spacing.lg,
  },
  form: {
    gap: Spacing.md,
  },
  sectionHeading: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  half: {
    flex: 1,
  },
  submitBtn: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
});

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
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { profileService } from '../../services/profileService';

const firmSchema = z.object({
  firmName: z.string().min(2, 'Firm name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type FirmForm = z.infer<typeof firmSchema>;

export default function AdminFirmInfoScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(firmSchema) as any,
    defaultValues: {
      firmName: user?.clientProfile?.firmName || 'CA Connect Advisory & Partners',
      phone: user?.phone || '',
      address: user?.clientProfile?.address || '101 Commercial Chamber, Nariman Point, Mumbai',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firmName: user.clientProfile?.firmName || 'CA Connect Advisory & Partners',
        phone: user.phone || '',
        address: user.clientProfile?.address || '101 Commercial Chamber, Nariman Point, Mumbai',
      });
    }
  }, [user]);

  const onSubmit = async (data: FirmForm) => {
    setIsLoading(true);
    try {
      const response = await profileService.updateProfile({
        firstName: user?.firstName || 'Admin',
        lastName: user?.lastName || 'User',
        phone: data.phone,
        firmName: data.firmName,
        address: data.address,
      });
      if (response.data) {
        updateUser(response.data);
        Alert.alert('Success', 'Firm details updated in statutory registry.', [
          { text: 'OK', onPress: () => router.replace('/(admin)/settings') }
        ]);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update firm details.';
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
          <TouchableOpacity onPress={() => router.replace('/(admin)/settings')} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={18} color={Colors.primary} />
            <Text style={styles.backText}>Settings</Text>
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
              <Text style={styles.refCode}>PRACTICE REGISTRATION</Text>
              <Text style={styles.pageTitle}>Chartered Firm Details</Text>
              <Text style={styles.pageSubtitle}>
                Official firm identification printed on invoices, declarations, and audit reports.
              </Text>
            </View>

            <View style={styles.hairlineRule} />

            {/* Flat Form */}
            <View style={styles.form}>
              <Controller
                control={control}
                name="firmName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Official CA Firm Name *"
                    placeholder="Sharma & Co. Chartered Accountants"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.firmName?.message as any}
                  />
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Practice Landline / Contact Number"
                    placeholder="+91-22-22001122"
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />

              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Principal Registered Office Address"
                    placeholder="Suite 502, Nariman Point, Mumbai 400021"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={3}
                  />
                )}
              />

              <AppButton
                title={isLoading ? 'Updating...' : 'Save Firm Information'}
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
    maxWidth: 500,
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
  submitBtn: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});

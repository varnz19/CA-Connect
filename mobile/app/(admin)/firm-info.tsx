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
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
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
      address: user?.clientProfile?.address || '101, FinTech Hub, BKC, Mumbai',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firmName: user.clientProfile?.firmName || 'CA Connect Advisory & Partners',
        phone: user.phone || '',
        address: user.clientProfile?.address || '101, FinTech Hub, BKC, Mumbai',
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
        Alert.alert('Success', 'Firm information updated successfully.', [
          { text: 'OK', onPress: () => router.back() }
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
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={20} color={Colors.textPrimary} />
            <Text style={styles.backText}>Back to Settings</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Firm Information</Text>
            <Text style={styles.subtitle}>Update CA Firm registration name, contact, and address</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.form}>
              <Controller
                control={control}
                name="firmName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Firm Name"
                    placeholder="Advisory Name"
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
                    label="Contact Number"
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
                name="address"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Firm Location/Address"
                    placeholder="Address details"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.address?.message as any}
                  />
                )}
              />

              <AppButton
                title={isLoading ? 'Saving...' : 'Save Firm Details'}
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
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 22,
    color: Colors.primary,
  },
  subtitle: {
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
  form: {
    gap: Spacing.sm,
  },
  submitBtn: {
    marginTop: Spacing.base,
  },
});

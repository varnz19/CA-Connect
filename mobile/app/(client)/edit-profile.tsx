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

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  firmName: z.string().optional(),
  panNumber: z.string().optional(),
  gstin: z.string().optional(),
  gstState: z.string().optional(),
  address: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ClientEditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
      firmName: user?.clientProfile?.firmName || '',
      panNumber: user?.clientProfile?.panNumber || '',
      gstin: user?.clientProfile?.gstin || '',
      gstState: user?.clientProfile?.gstState || '',
      address: user?.clientProfile?.address || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        avatar: user.avatar || '',
        firmName: user.clientProfile?.firmName || '',
        panNumber: user.clientProfile?.panNumber || '',
        gstin: user.clientProfile?.gstin || '',
        gstState: user.clientProfile?.gstState || '',
        address: user.clientProfile?.address || '',
      });
    }
  }, [user]);

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    try {
      const response = await profileService.updateProfile(data);
      if (response.data) {
        updateUser(response.data);
        Alert.alert('Success', 'Profile updated successfully.', [
          { text: 'OK', onPress: () => router.replace('/(client)/profile') }
        ]);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
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
          <TouchableOpacity onPress={() => router.replace('/(client)/profile')} style={styles.backBtn}>
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
            <Text style={styles.title}>Edit Profile</Text>
            <Text style={styles.subtitle}>Update your client account and business info</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.form}>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="First Name"
                    placeholder="First Name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.firstName?.message as any}
                  />
                )}
              />

              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Last Name"
                    placeholder="Last Name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.lastName?.message as any}
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
                name="avatar"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Avatar Image URL"
                    placeholder="https://example.com/avatar.jpg"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.avatar?.message as any}
                  />
                )}
              />

              <Text style={styles.sectionTitle}>Business Info</Text>

              <Controller
                control={control}
                name="firmName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Firm Name"
                    placeholder="Firm Name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.firmName?.message as any}
                  />
                )}
              />

              <Controller
                control={control}
                name="panNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="PAN Number"
                    placeholder="ABCDE1234F"
                    autoCapitalize="characters"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.panNumber?.message as any}
                  />
                )}
              />

              <Controller
                control={control}
                name="gstin"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="GSTIN"
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
                title={isLoading ? 'Saving...' : 'Save Profile'}
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
  sectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.primary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  submitBtn: {
    marginTop: Spacing.base,
  },
});

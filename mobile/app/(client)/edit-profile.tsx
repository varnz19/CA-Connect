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

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
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
        Alert.alert('Success', 'Client details updated in firm records.', [
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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.replace('/(client)/profile')} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={18} color={Colors.primary} />
            <Text style={styles.backText}>Profile</Text>
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
              <Text style={styles.refCode}>CLIENT RECORD</Text>
              <Text style={styles.pageTitle}>Edit Profile & Tax Details</Text>
              <Text style={styles.pageSubtitle}>
                Update registered entity name, contact phone, PAN, and GST identification.
              </Text>
            </View>

            <View style={styles.hairlineRule} />

            {/* Flat Form */}
            <View style={styles.form}>
              <Text style={styles.sectionHeading}>Personal & Contact</Text>

              <View style={styles.row}>
                <View style={styles.half}>
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="First Name *"
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
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.lastName?.message as any}
                      />
                    )}
                  />
                </View>
              </View>

              <AppInput
                label="Registered Email Address"
                value={user?.email || ''}
                editable={false}
                hint="Contact CA firm admin to change verified email."
              />

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Primary Phone Number"
                    placeholder="+91-9876543210"
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />

              <View style={styles.hairlineRule} />
              <Text style={styles.sectionHeading}>Business & Statutory Identification</Text>

              <Controller
                control={control}
                name="firmName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Business / Trade Name"
                    placeholder="Enter entity name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
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
                        label="PAN Card Number"
                        placeholder="ABCDE1234F"
                        autoCapitalize="characters"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
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
                        label="GST Jurisdiction State"
                        placeholder="Maharashtra"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
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
                  />
                )}
              />

              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Registered Office Address"
                    placeholder="Principal address for tax communications"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={2}
                  />
                )}
              />

              <AppButton
                title={isLoading ? 'Updating...' : 'Save Profile Record'}
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
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});

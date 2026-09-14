import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await profileService.updateProfile(data);
      if (response.data) {
        updateUser(response.data);
        setSuccessMessage('Profile and tax details updated successfully.');
        setTimeout(() => {
          router.replace('/(client)/profile');
        }, 1200);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile. Please try again.';
      setErrorMessage(msg);
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
        {/* Navigation Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.replace('/(client)/profile')}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={18} color={Colors.primaryLight} />
            <Text style={styles.backText}>Back to Profile</Text>
          </TouchableOpacity>
          <View style={styles.portalTag}>
            <Text style={styles.portalTagText}>CLIENT RECORD</Text>
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
              <Text style={styles.refCode}>REF: CL-EDIT-01</Text>
              <Text style={styles.pageTitle}>Edit Profile & Tax Details</Text>
              <Text style={styles.pageSubtitle}>
                Update your registered trade entity name, contact phone, PAN, and GST information.
              </Text>
            </View>

            {/* Success Alert */}
            {successMessage && (
              <View style={styles.successAlert}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.successDark} />
                <Text style={styles.successAlertText}>{successMessage}</Text>
              </View>
            )}

            {/* Error Alert */}
            {errorMessage && (
              <View style={styles.errorAlert}>
                <MaterialIcons name="error-outline" size={18} color={Colors.danger} />
                <Text style={styles.errorAlertText}>{errorMessage}</Text>
              </View>
            )}

            <View style={styles.hairlineRule} />

            {/* Form Fields */}
            <View style={styles.form}>
              <Text style={styles.sectionHeading}>Personal & Contact Information</Text>

              <View style={styles.row}>
                <View style={styles.half}>
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label="First Name *"
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          if (errorMessage) setErrorMessage(null);
                        }}
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
                        onChangeText={(text) => {
                          onChange(text);
                          if (errorMessage) setErrorMessage(null);
                        }}
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
                hint="Registered account email (contact CA partner to modify)."
              />

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Primary Contact Phone"
                    placeholder="+91-9876543210"
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={(text) => {
                      onChange(text);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    onBlur={onBlur}
                  />
                )}
              />

              <View style={styles.hairlineRule} />
              <Text style={styles.sectionHeading}>Business & Statutory Tax Details</Text>

              <Controller
                control={control}
                name="firmName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label="Business / Trade Name"
                    placeholder="e.g. Rajesh Kumar & Co."
                    value={value}
                    onChangeText={(text) => {
                      onChange(text);
                      if (errorMessage) setErrorMessage(null);
                    }}
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
                        onChangeText={(text) => {
                          onChange(text.toUpperCase());
                          if (errorMessage) setErrorMessage(null);
                        }}
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
                        onChangeText={(text) => {
                          onChange(text);
                          if (errorMessage) setErrorMessage(null);
                        }}
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
                    label="GSTIN Identification Number"
                    placeholder="27ABCDE1234F1Z5"
                    autoCapitalize="characters"
                    value={value}
                    onChangeText={(text) => {
                      onChange(text.toUpperCase());
                      if (errorMessage) setErrorMessage(null);
                    }}
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
                    placeholder="Principal address for statutory filings & tax notices"
                    value={value}
                    onChangeText={(text) => {
                      onChange(text);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={2}
                  />
                )}
              />

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => router.replace('/(client)/profile')}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <AppButton
                  title={isLoading ? 'Saving...' : 'Save Profile Details'}
                  onPress={handleSubmit(onSubmit)}
                  loading={isLoading}
                  size="md"
                  style={styles.submitBtn}
                />
              </View>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primaryLight,
  },
  portalTag: {
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  portalTagText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    color: Colors.primaryLight,
    letterSpacing: 0.5,
  },
  scroll: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 580,
    backgroundColor: Colors.backgroundCard,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  headerBlock: {
    marginBottom: Spacing.sm,
  },
  refCode: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 10,
    color: Colors.primaryLight,
    letterSpacing: 1,
    marginBottom: 4,
  },
  pageTitle: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  pageSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    borderWidth: 1,
    borderColor: Colors.successBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  successAlertText: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: Colors.successDark,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  errorAlertText: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: Colors.dangerDark,
  },
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  form: {
    gap: Spacing.sm,
  },
  sectionHeading: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  half: {
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundCard,
  },
  cancelBtnText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  submitBtn: {
    flex: 2,
    marginVertical: 0,
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MaterialIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { format, addDays } from 'date-fns';
import { appointmentService } from '../../services/appointmentService';

const schema = z.object({
  title: z.string().min(3, 'Please enter a consultation topic'),
  description: z.string().optional(),
  requestedDate: z.string().min(1, 'Please select a preferred date'),
  requestedTime: z.string().min(1, 'Please select a preferred time slot'),
});

type FormData = z.infer<typeof schema>;

const TIME_SLOTS = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM',
  '03:30 PM', '04:00 PM', '04:30 PM',
];

const PURPOSE_TEMPLATES = [
  'ITR Filing & Tax Computation',
  'GST Monthly Reconciliation',
  'Statutory Audit Discussion',
  'Corporate Advisory & Compliance',
];

export default function BookAppointmentScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', requestedDate: '', requestedTime: '' },
  });

  const availableDates = Array.from({ length: 10 }, (_, i) => {
    const d = addDays(new Date(), i + 1);
    const day = d.getDay();
    if (day === 0 || day === 6) return null;
    return d;
  }).filter(Boolean) as Date[];

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const dateStr = data.requestedDate;
      const timeStr = data.requestedTime;
      const dateObj = new Date(dateStr);
      const isPM = timeStr.includes('PM');
      let hours = parseInt(timeStr.split(':')[0]);
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
      dateObj.setHours(hours, parseInt(timeStr.split(':')[1].substring(0, 2)), 0);

      await appointmentService.createAppointment({
        title: data.title,
        description: data.description,
        requestedDate: dateObj.toISOString(),
      });

      // Invalidate queries so admin & client views update immediately
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });

      setSubmitted(true);
    } catch (err: any) {
      console.error('Failed to create appointment:', err);
      const message = err.response?.data?.message || err.message || 'Failed to schedule consultation. Please try again.';
      Alert.alert('Booking Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <Text style={styles.refCode}>STATUS: DISPATCHED</Text>
          <Text style={styles.successTitle}>Consultation Requested</Text>
          <Text style={styles.successDesc}>
            Your advisory request has been dispatched to your CA firm. You will receive notification upon schedule confirmation.
          </Text>
          <AppButton
            title="Return to Client Dashboard"
            onPress={() => router.replace('/(client)')}
            size="md"
            style={{ width: '100%' }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={18} color={Colors.primary} />
          <Text style={styles.backText}>Dashboard</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerBlock}>
            <Text style={styles.refCode}>ADVISORY DISPATCH</Text>
            <Text style={styles.pageTitle}>Book CA Consultation</Text>
            <Text style={styles.pageSubtitle}>
              Request a virtual or in-person advisory session with your Chartered Accountant.
            </Text>
          </View>

          <View style={styles.hairlineRule} />

          {/* Quick Purpose Chips */}
          <Text style={styles.sectionHeading}>Consultation Topic</Text>
          <View style={styles.purposeChipsRow}>
            {PURPOSE_TEMPLATES.map((p) => (
              <TouchableOpacity
                key={p}
                style={styles.purposeChip}
                onPress={() => setValue('title', p)}
                activeOpacity={0.7}
              >
                <Text style={styles.purposeChipText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Session Subject *"
                  placeholder="e.g. FY 2025-26 Tax Planning & Depreciation"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.title?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Specific Questions / Agenda (Optional)"
                  placeholder="Need review on advance tax installment due dates..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={2}
                />
              )}
            />

            <View style={styles.hairlineRule} />

            {/* Date Selection */}
            <Text style={styles.sectionHeading}>Preferred Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              <View style={styles.dateRow}>
                {availableDates.map((date) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const isSelected = selectedDate === dateStr;
                  return (
                    <TouchableOpacity
                      key={dateStr}
                      style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                      onPress={() => {
                        setSelectedDate(dateStr);
                        setValue('requestedDate', dateStr);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.dateDayName, isSelected && styles.dateSelectedText]}>
                        {format(date, 'EEE')}
                      </Text>
                      <Text style={[styles.dateDayNum, isSelected && styles.dateSelectedText]}>
                        {format(date, 'd')}
                      </Text>
                      <Text style={[styles.dateMonth, isSelected && styles.dateSelectedText]}>
                        {format(date, 'MMM')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            {errors.requestedDate && (
              <Text style={styles.errorText}>{errors.requestedDate.message}</Text>
            )}

            <View style={styles.hairlineRule} />

            {/* Time Selection */}
            <Text style={styles.sectionHeading}>Preferred Time Slot</Text>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <TouchableOpacity
                    key={time}
                    style={[styles.timeChip, isSelected && styles.timeChipSelected]}
                    onPress={() => {
                      setSelectedTime(time);
                      setValue('requestedTime', time);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.timeText, isSelected && styles.timeTextSelected]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.requestedTime && (
              <Text style={styles.errorText}>{errors.requestedTime.message}</Text>
            )}

            <AppButton
              title={isLoading ? 'Submitting...' : 'Request Consultation'}
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              size="md"
              style={styles.submitBtn}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
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
  sectionHeading: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  purposeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  purposeChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: Colors.backgroundCard,
  },
  purposeChipText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: Colors.primary,
  },
  form: {
    gap: Spacing.md,
  },
  dateScroll: {
    marginVertical: Spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dateChip: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
    minWidth: 56,
  },
  dateChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  dateDayName: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  dateDayNum: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.md,
    color: Colors.primary,
    marginVertical: 2,
  },
  dateMonth: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 9,
    color: Colors.textTertiary,
  },
  dateSelectedText: {
    color: Colors.textLight,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  timeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  timeChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  timeText: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: Typography.size.xs,
    color: Colors.primary,
  },
  timeTextSelected: {
    color: Colors.textLight,
  },
  errorText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  submitBtn: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  successContainer: {
    flex: 1,
    padding: Spacing['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 480,
    alignSelf: 'center',
  },
  successTitle: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: Typography.size.xl,
    color: Colors.primary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  successDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
});

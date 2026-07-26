import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MaterialIcons } from '@expo/vector-icons';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { format, addDays } from 'date-fns';

const schema = z.object({
  title: z.string().min(3, 'Please enter a meeting title'),
  description: z.string().optional(),
  requestedDate: z.string().min(1, 'Please select a date'),
  requestedTime: z.string().min(1, 'Please select a time'),
});

type FormData = z.infer<typeof schema>;

const TIME_SLOTS = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM',
  '03:30 PM', '04:00 PM', '04:30 PM',
];

const APPOINTMENT_TYPES = [
  { label: 'ITR Discussion', icon: 'description' },
  { label: 'GST Consultation', icon: 'receipt' },
  { label: 'Audit Meeting', icon: 'find-in-page' },
  { label: 'General Query', icon: 'help-outline' },
];

export default function BookAppointmentScreen() {
  const router = useRouter();
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

  // Generate next 7 available dates
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i + 1);
    const day = d.getDay();
    if (day === 0 || day === 6) return null; // Skip weekends
    return d;
  }).filter(Boolean) as Date[];

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title="Book Appointment" showBack />
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <MaterialIcons name="event-available" size={48} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>Request Submitted!</Text>
          <Text style={styles.successDesc}>
            Your appointment request has been sent to your CA. You will receive a confirmation once it's approved.
          </Text>
          <AppButton
            title="Back to Home"
            onPress={() => router.replace('/(client)')}
            fullWidth
            size="lg"
            style={styles.successBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Book Appointment" showBack />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Appointment Type */}
          <Text style={styles.sectionTitle}>What's the purpose?</Text>
          <View style={styles.typeGrid}>
            {APPOINTMENT_TYPES.map((type) => (
              <AppCard
                key={type.label}
                style={styles.typeCard}
                padding={Spacing.sm}
              >
                <View style={styles.typeInner}
                  // @ts-ignore
                  onTouchEnd={() => setValue('title', type.label)}
                >
                  <MaterialIcons name={type.icon as any} size={22} color={Colors.primary} />
                  <Text style={styles.typeLabel}>{type.label}</Text>
                </View>
              </AppCard>
            ))}
          </View>

          {/* Custom Title */}
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label="Meeting Title"
                placeholder="e.g., ITR Filing Discussion"
                leftIcon="title"
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
                label="Notes (Optional)"
                placeholder="Any specific topics or queries you'd like to discuss"
                leftIcon="notes"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
                style={styles.textArea}
              />
            )}
          />

          {/* Date Selection */}
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            <View style={styles.dateRow}>
              {availableDates.map((date) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const isSelected = selectedDate === dateStr;
                return (
                  <AppCard
                    key={dateStr}
                    style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                    padding={Spacing.xs}
                    noPadding
                  >
                    <View
                      style={[styles.dateInner, isSelected && styles.dateInnerSelected]}
                      // @ts-ignore
                      onTouchEnd={() => {
                        setSelectedDate(dateStr);
                        setValue('requestedDate', dateStr);
                      }}
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
                    </View>
                  </AppCard>
                );
              })}
            </View>
          </ScrollView>
          {errors.requestedDate && (
            <Text style={styles.errorText}>{errors.requestedDate.message}</Text>
          )}

          {/* Time Selection */}
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <AppCard
                  key={time}
                  style={[styles.timeChip, isSelected && styles.timeChipSelected]}
                  padding={0}
                  noPadding
                >
                  <View
                    style={styles.timeChipInner}
                    // @ts-ignore
                    onTouchEnd={() => {
                      setSelectedTime(time);
                      setValue('requestedTime', time);
                    }}
                  >
                    <Text style={[styles.timeText, isSelected && styles.timeTextSelected]}>
                      {time}
                    </Text>
                  </View>
                </AppCard>
              );
            })}
          </View>
          {errors.requestedTime && (
            <Text style={styles.errorText}>{errors.requestedTime.message}</Text>
          )}

          <AppButton
            title="Submit Request"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            size="lg"
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl },
  sectionTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  typeCard: { width: '48%', borderRadius: 0 }, // Structural
  typeInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, padding: Spacing.sm },
  typeLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  dateScroll: { marginBottom: Spacing.md },
  dateRow: { flexDirection: 'row', gap: Spacing.sm, paddingBottom: Spacing.xs },
  dateCard: { width: 64, borderRadius: 0 },
  dateCardSelected: { borderColor: Colors.primary, borderWidth: 1.5, backgroundColor: Colors.primaryLight },
  dateInner: {
    alignItems: 'center',
    padding: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  dateInnerSelected: { backgroundColor: 'transparent' },
  dateDayName: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  dateDayNum: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.xl,
    color: Colors.primary,
  },
  dateMonth: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },
  dateSelectedText: { color: Colors.background },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.base },
  timeChip: { width: 'auto', borderWidth: 1, borderColor: Colors.border, borderRadius: 0 },
  timeChipSelected: { borderColor: Colors.primary, borderWidth: 1.5, backgroundColor: Colors.primaryLight },
  timeChipInner: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs + 2 },
  timeText: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  timeTextSelected: { color: Colors.background },
  errorText: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.danger,
    marginTop: -Spacing.xs,
    marginBottom: Spacing.sm,
  },
  submitBtn: { marginTop: Spacing.base, marginBottom: Spacing['2xl'] },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  successTitle: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: Typography.size['2xl'],
    color: Colors.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  successDesc: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  successBtn: { marginTop: Spacing.sm },
});

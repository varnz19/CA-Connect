import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MaterialIcons } from '@expo/vector-icons';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { format, addDays } from 'date-fns';
import { useClients } from '../../hooks/useQueries';
import { Picker } from '@react-native-picker/picker';
import { appointmentService } from '../../services/appointmentService';

const schema = z.object({
  clientProfileId: z.string().min(1, 'Please select a client'),
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

export default function AdminAddAppointmentScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const { data: clientsRes } = useClients();
  const clients = clientsRes?.data || [];

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { clientProfileId: '', title: '', description: '', requestedDate: '', requestedTime: '' },
  });

  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i);
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

      const payload = {
        clientProfileId: data.clientProfileId,
        title: data.title,
        description: data.description,
        requestedDate: dateObj.toISOString(),
      };

      await appointmentService.createAppointment(payload);
      Alert.alert('Success', 'Advisory consultation scheduled.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create appointment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={18} color={Colors.primary} />
          <Text style={styles.backText}>All Appointments</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerBlock}>
            <Text style={styles.refCode}>SCHEDULE DISPATCH</Text>
            <Text style={styles.pageTitle}>Schedule Consultation</Text>
            <Text style={styles.pageSubtitle}>
              Create a confirmed or proposed advisory meeting slot with a client.
            </Text>
          </View>

          <View style={styles.hairlineRule} />

          {/* Form */}
          <View style={styles.form}>
            {/* Client Picker */}
            <View style={styles.pickerField}>
              <Text style={styles.label}>Select Client *</Text>
              <Controller
                control={control}
                name="clientProfileId"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={value}
                      onValueChange={(itemValue) => onChange(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select client account..." value="" />
                      {clients.map((c) => (
                        <Picker.Item 
                          key={c.id} 
                          label={`${c.firstName} ${c.lastName} ${c.clientProfile?.firmName ? `(${c.clientProfile.firmName})` : ''}`} 
                          value={c.clientProfile?.id || ''} 
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              />
              {errors.clientProfileId && (
                <Text style={styles.errorText}>{errors.clientProfileId.message}</Text>
              )}
            </View>

            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Session Subject / Purpose *"
                  placeholder="e.g. Annual Audit & GST Filing Review"
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
                  label="Preparation Agenda & Scope (Optional)"
                  placeholder="Review Form 26AS, AIS, and reconciliation statements..."
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
            <Text style={styles.sectionHeading}>Target Date</Text>
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

            {/* Time Slots */}
            <Text style={styles.sectionHeading}>Time Slot</Text>
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
              title={isLoading ? 'Booking...' : 'Confirm Consultation Session'}
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
  form: {
    gap: Spacing.md,
  },
  pickerField: {
    marginBottom: Spacing.sm,
  },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  pickerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  picker: {
    height: 44,
  },
  sectionHeading: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
    marginBottom: Spacing.xs,
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
});

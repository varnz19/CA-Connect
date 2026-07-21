import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
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
      // Combine date and time
      const dateStr = data.requestedDate;
      const timeStr = data.requestedTime;
      // Convert time string to proper Date
      const dateObj = new Date(dateStr);
      const isPM = timeStr.includes('PM');
      let hours = parseInt(timeStr.split(':')[0]);
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
      dateObj.setHours(hours, parseInt(timeStr.split(':')[1].substring(0,2)), 0);

      const payload = {
        clientProfileId: data.clientProfileId,
        title: data.title,
        description: data.description,
        requestedDate: dateObj.toISOString(),
      };

      await appointmentService.createAppointment(payload);
      Alert.alert('Success', 'Appointment created successfully.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create appointment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Create Appointment" showBack />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          <Text style={styles.sectionTitle}>Select Client</Text>
          <Controller
            control={control}
            name="clientProfileId"
            render={({ field: { onChange, value } }) => (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={value}
                  onValueChange={(itemValue) => {
                    onChange(itemValue);
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a client..." value="" />
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
                containerStyle={{ marginTop: Spacing.md }}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label="Notes (Optional)"
                placeholder="Any specific topics or queries"
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
            title="Create Appointment"
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
  content: { padding: Spacing.base },
  sectionTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.backgroundCard,
  },
  picker: {
    height: 50,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
    marginTop: 4,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  dateScroll: { marginBottom: Spacing.sm },
  dateRow: { flexDirection: 'row', gap: Spacing.xs, paddingBottom: Spacing.xs },
  dateCard: { width: 60 },
  dateCardSelected: { borderColor: Colors.primary, borderWidth: 1.5 },
  dateInner: {
    alignItems: 'center',
    padding: Spacing.xs,
    borderRadius: 10,
    paddingVertical: Spacing.sm,
  },
  dateInnerSelected: { backgroundColor: Colors.primary },
  dateDayName: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  dateDayNum: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    color: Colors.textPrimary,
  },
  dateMonth: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  dateSelectedText: { color: Colors.textLight },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.base },
  timeChip: { width: 'auto', borderWidth: 1, borderColor: Colors.border },
  timeChipSelected: { borderColor: Colors.primary, borderWidth: 1.5 },
  timeChipInner: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs + 2 },
  timeText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  timeTextSelected: { color: Colors.primary },
  submitBtn: { marginTop: Spacing.xl, marginBottom: Spacing['2xl'] },
});

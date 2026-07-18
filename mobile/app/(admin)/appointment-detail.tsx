import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { appointmentService } from '../../services/appointmentService';
import { Appointment } from '../../types';
import { format, parseISO } from 'date-fns';

export default function AdminAppointmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Actions forms
  const [confirmedDate, setConfirmedDate] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isConfirmMode, setIsConfirmMode] = useState(false);
  const [isRejectMode, setIsRejectMode] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await appointmentService.getAppointment(id);
      if (res.data) {
        setAppointment(res.data);
        // Default confirm date/time to request date
        if (res.data.requestedDate) {
          try {
            setConfirmedDate(format(parseISO(res.data.requestedDate), "yyyy-MM-dd'T'HH:mm"));
          } catch {
            setConfirmedDate(res.data.requestedDate.slice(0, 16));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load details:', err);
      Alert.alert('Error', 'Failed to retrieve appointment details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleConfirm = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await appointmentService.confirmAppointment(
        id,
        confirmedDate ? new Date(confirmedDate).toISOString() : undefined
      );
      if (res.data) {
        Alert.alert('Success', 'Appointment confirmed successfully.');
        setIsConfirmMode(false);
        fetchDetail();
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to confirm appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    if (!rejectReason.trim()) {
      Alert.alert('Validation Error', 'Please enter a cancellation reason.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await appointmentService.rejectAppointment(id, rejectReason);
      if (res.data) {
        Alert.alert('Success', 'Appointment rejected successfully.');
        setIsRejectMode(false);
        fetchDetail();
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to reject appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await appointmentService.completeAppointment(id);
      if (res.data) {
        Alert.alert('Success', 'Appointment marked as completed.');
        fetchDetail();
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to complete appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading appointment details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Appointment not found.</Text>
          <AppButton title="Go Back" onPress={() => router.back()} style={styles.backBtn} />
        </View>
      </SafeAreaView>
    );
  }

  const clientName = appointment.clientProfile?.user
    ? `${appointment.clientProfile.user.firstName} ${appointment.clientProfile.user.lastName}`
    : 'Client Name';

  const dateFormatted = appointment.requestedDate
    ? format(parseISO(appointment.requestedDate), 'dd MMM yyyy, hh:mm a')
    : 'Not Specified';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={20} color={Colors.textPrimary} />
          <Text style={styles.backText}>Back to Appointments</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Review Appointment</Text>
          <Text style={styles.subtitle}>Approve, reject, or mark compliance consultations completed</Text>
        </View>

        <AppCard style={styles.card}>
          <View style={styles.row}>
            <MaterialIcons name="person" size={22} color={Colors.primary} />
            <View style={styles.info}>
              <Text style={styles.label}>Client Name</Text>
              <Text style={styles.value}>{clientName}</Text>
            </View>
          </View>

          {appointment.clientProfile?.firmName && (
            <View style={[styles.row, { marginTop: Spacing.sm }]}>
              <MaterialIcons name="business" size={22} color={Colors.primary} />
              <View style={styles.info}>
                <Text style={styles.label}>Firm Name</Text>
                <Text style={styles.value}>{appointment.clientProfile.firmName}</Text>
              </View>
            </View>
          )}

          <View style={[styles.row, { marginTop: Spacing.sm }]}>
            <MaterialIcons name="event" size={22} color={Colors.primary} />
            <View style={styles.info}>
              <Text style={styles.label}>Requested Time</Text>
              <Text style={styles.value}>{dateFormatted}</Text>
            </View>
          </View>

          <View style={[styles.row, { marginTop: Spacing.sm }]}>
            <MaterialIcons name="category" size={22} color={Colors.primary} />
            <View style={styles.info}>
              <Text style={styles.label}>Consultation Type</Text>
              <Text style={styles.value}>{appointment.title}</Text>
            </View>
          </View>

          {appointment.description && (
            <View style={[styles.row, { marginTop: Spacing.sm }]}>
              <MaterialIcons name="description" size={22} color={Colors.primary} />
              <View style={styles.info}>
                <Text style={styles.label}>Client Notes</Text>
                <Text style={styles.value}>{appointment.description}</Text>
              </View>
            </View>
          )}

          <View style={styles.statusSection}>
            <Text style={styles.label}>Current Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: appointment.status === 'CONFIRMED' ? Colors.successLight : (appointment.status === 'REQUESTED' ? Colors.primaryLight : Colors.dangerLight) }]}>
              <Text style={[styles.statusText, { color: appointment.status === 'CONFIRMED' ? Colors.success : (appointment.status === 'REQUESTED' ? Colors.primary : Colors.danger) }]}>
                {appointment.status}
              </Text>
            </View>
          </View>

          {/* Action modes form rendering */}
          {isConfirmMode && (
            <View style={styles.actionForm}>
              <AppInput
                label="Confirm Date & Time (ISO/Local String)"
                placeholder="2025-07-20T10:00"
                value={confirmedDate}
                onChangeText={setConfirmedDate}
              />
              <View style={styles.btnRow}>
                <AppButton
                  title="Cancel"
                  variant="outline"
                  size="sm"
                  onPress={() => setIsConfirmMode(false)}
                />
                <AppButton
                  title="Approve Now"
                  size="sm"
                  loading={actionLoading}
                  onPress={handleConfirm}
                />
              </View>
            </View>
          )}

          {isRejectMode && (
            <View style={styles.actionForm}>
              <AppInput
                label="Rejection Reason"
                placeholder="Requested time slot unavailable."
                value={rejectReason}
                onChangeText={setRejectReason}
              />
              <View style={styles.btnRow}>
                <AppButton
                  title="Cancel"
                  variant="outline"
                  size="sm"
                  onPress={() => setIsRejectMode(false)}
                />
                <AppButton
                  title="Reject Now"
                  size="sm"
                  variant="danger"
                  loading={actionLoading}
                  onPress={handleReject}
                />
              </View>
            </View>
          )}

          {/* Standard Actions */}
          {!isConfirmMode && !isRejectMode && (
            <View style={styles.actions}>
              {appointment.status === 'REQUESTED' && (
                <>
                  <AppButton
                    title="Confirm Appointment"
                    onPress={() => setIsConfirmMode(true)}
                  />
                  <AppButton
                    title="Reject Request"
                    variant="danger"
                    onPress={() => setIsRejectMode(true)}
                  />
                </>
              )}

              {appointment.status === 'CONFIRMED' && (
                <AppButton
                  title="Mark Completed"
                  onPress={handleComplete}
                  loading={actionLoading}
                />
              )}
            </View>
          )}
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.base },
  loadingText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.base, color: Colors.textSecondary, marginBottom: Spacing.sm },
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
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  info: {
    flex: 1,
  },
  label: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  value: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  statusSection: {
    marginTop: Spacing.sm,
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginTop: 4,
  },
  statusText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
  },
  actions: {
    marginTop: Spacing.base,
    gap: Spacing.sm,
  },
  actionForm: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginTop: Spacing.base,
    gap: Spacing.sm,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppBadge } from '../../components/common/AppBadge';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { appointmentService } from '../../services/appointmentService';
import { Appointment } from '../../types';
import { format, parseISO } from 'date-fns';

export default function AdminAppointmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [confirmedDate, setConfirmedDate] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isConfirmMode, setIsConfirmMode] = useState(false);
  const [isRejectMode, setIsRejectMode] = useState(false);

  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState('');

  const generateGoogleMeetLink = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const randPart = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setMeetingLink(`https://meet.google.com/${randPart(3)}-${randPart(4)}-${randPart(3)}`);
  };

  const fetchDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await appointmentService.getAppointment(id);
      if (res.data) {
        setAppointment(res.data);
        setMeetingLink(res.data.meetingLink || '');
        setNotes(res.data.notes || '');
        if (res.data.requestedDate) {
          try {
            setConfirmedDate(format(parseISO(res.data.requestedDate), "yyyy-MM-dd'T'HH:mm"));
          } catch {
            setConfirmedDate(res.data.requestedDate.slice(0, 16));
          }
        }
      }
    } catch (err) {
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
      const res = await appointmentService.confirmAppointment(id, {
        confirmedDate: confirmedDate ? new Date(confirmedDate).toISOString() : undefined,
        meetingLink,
        notes,
      });
      if (res.data) {
        Alert.alert(
          'Success',
          'Advisory consultation confirmed! The client has been notified via in-app alert and email with the Google Meet link.'
        );
        setIsConfirmMode(false);
        fetchDetail();
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to confirm appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleNotifyClient = async () => {
    if (!appointment) return;
    const clientName = appointment.clientProfile?.user
      ? `${appointment.clientProfile.user.firstName} ${appointment.clientProfile.user.lastName}`
      : 'Client';
    const dateFormatted = appointment.confirmedDate
      ? format(parseISO(appointment.confirmedDate), 'dd MMM yyyy, hh:mm a')
      : format(parseISO(appointment.requestedDate), 'dd MMM yyyy');
    const link = appointment.meetingLink || 'Link to follow';

    const msg = `Dear ${clientName},\n\nYour advisory consultation has been scheduled:\nTopic: ${appointment.title}\nTime: ${dateFormatted}\nVideo Meeting: ${link}\n\nNotes: ${appointment.notes || 'Please join on time with financial documents.'}\n\nCA Connect & Associates`;

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && (navigator as any).clipboard) {
      await (navigator as any).clipboard.writeText(msg);
      Alert.alert(
        'Meeting Copied',
        `Meeting invitation copied to clipboard! You can paste and send via WhatsApp, email, or message:\n\n${msg}`
      );
    } else {
      await Share.share({
        title: `Meeting: ${appointment.title}`,
        message: msg,
      });
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
        Alert.alert('Success', 'Appointment cancelled.');
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
        Alert.alert('Success', 'Session marked as completed.');
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
          <Text style={styles.loadingText}>Loading consultation record...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Appointment not found.</Text>
          <AppButton title="Return to Schedule" onPress={() => router.back()} size="sm" />
        </View>
      </SafeAreaView>
    );
  }

  const clientName = appointment.clientProfile?.user
    ? `${appointment.clientProfile.user.firstName} ${appointment.clientProfile.user.lastName}`
    : 'Client Name';

  const dateFormatted = appointment.requestedDate
    ? format(parseISO(appointment.requestedDate), 'dd MMM yyyy, hh:mm a')
    : '—';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={18} color={Colors.primary} />
          <Text style={styles.backText}>All Appointments</Text>
        </TouchableOpacity>
        <AppBadge status={appointment.status} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header Block: title in Ink, key facts grid */}
        <View style={styles.headerBlock}>
          <Text style={styles.refCode}>SESSION ID: {appointment.id.slice(0, 8).toUpperCase()}</Text>
          <Text style={styles.sessionTitle}>{appointment.title}</Text>
          <Text style={styles.sessionDesc}>{appointment.description || 'General CA Advisory Consultation'}</Text>

          {/* Key Facts Grid */}
          <View style={styles.keyFactsGrid}>
            <View style={styles.keyFactCol}>
              <Text style={styles.factLabel}>CLIENT</Text>
              <Text style={styles.factValueText}>{clientName}</Text>
            </View>
            <View style={styles.keyFactCol}>
              <Text style={styles.factLabel}>DURATION</Text>
              <Text style={styles.factValueMono}>{appointment.duration} min</Text>
            </View>
            <View style={styles.keyFactCol}>
              <Text style={styles.factLabel}>SCHEDULED DATE</Text>
              <Text style={styles.factValueMono}>{dateFormatted}</Text>
            </View>
          </View>

          {/* Primary Action Buttons */}
          <View style={styles.actionRow}>
            {appointment.status === 'REQUESTED' && (
              <>
                <AppButton
                  title="Confirm Session"
                  size="sm"
                  onPress={() => setIsConfirmMode(true)}
                />
                <AppButton
                  title="Decline Request"
                  variant="outline"
                  size="sm"
                  onPress={() => setIsRejectMode(true)}
                />
              </>
            )}
            {appointment.status === 'CONFIRMED' && (
              <>
                <AppButton
                  title="Mark Completed"
                  size="sm"
                  loading={actionLoading}
                  onPress={handleComplete}
                />
                {appointment.meetingLink && (
                  <>
                    <AppButton
                      title="Open Video"
                      variant="outline"
                      size="sm"
                      onPress={() => Linking.openURL(appointment.meetingLink!)}
                    />
                    <AppButton
                      title="Notify Client"
                      size="sm"
                      onPress={handleNotifyClient}
                      style={{ backgroundColor: Colors.primaryLight }}
                    />
                  </>
                )}
              </>
            )}
          </View>
        </View>

        <View style={styles.hairlineRule} />

        {/* Confirmation Form (if active) */}
        {isConfirmMode && (
          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>Confirm Advisory Consultation</Text>
            <AppInput
              label="Meeting Link (e.g. Google Meet or MS Teams)"
              placeholder="https://meet.google.com/..."
              value={meetingLink}
              onChangeText={setMeetingLink}
            />
            <TouchableOpacity onPress={generateGoogleMeetLink} style={styles.linkGenerator}>
              <Text style={styles.linkGeneratorText}>Generate Google Meet Link</Text>
            </TouchableOpacity>
            <AppInput
              label="Preparation Notes for Client (Optional)"
              placeholder="Please keep last year's ITR-V handy..."
              value={notes}
              onChangeText={setNotes}
            />
            <View style={styles.formActionRow}>
              <AppButton
                title="Save & Confirm"
                size="sm"
                loading={actionLoading}
                onPress={handleConfirm}
              />
              <AppButton
                title="Cancel"
                variant="ghost"
                size="sm"
                onPress={() => setIsConfirmMode(false)}
              />
            </View>
          </View>
        )}

        {/* Rejection Form (if active) */}
        {isRejectMode && (
          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>Decline Consultation</Text>
            <AppInput
              label="Reason for Declining (Dispatched to Client)"
              placeholder="Filing deadline clash; please pick a date after the 15th..."
              value={rejectReason}
              onChangeText={setRejectReason}
            />
            <View style={styles.formActionRow}>
              <AppButton
                title="Confirm Cancellation"
                variant="danger"
                size="sm"
                loading={actionLoading}
                onPress={handleReject}
              />
              <AppButton
                title="Cancel"
                variant="ghost"
                size="sm"
                onPress={() => setIsRejectMode(false)}
              />
            </View>
          </View>
        )}

        {/* Key-Value Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionHeading}>Session Details</Text>

          <View style={styles.kvRow}>
            <Text style={styles.kvKey}>Client account</Text>
            <Text style={styles.kvValText}>{clientName}</Text>
          </View>

          {appointment.clientProfile?.firmName && (
            <View style={styles.kvRow}>
              <Text style={styles.kvKey}>Firm / Business</Text>
              <Text style={styles.kvValText}>{appointment.clientProfile.firmName}</Text>
            </View>
          )}

          <View style={styles.kvRow}>
            <Text style={styles.kvKey}>Duration</Text>
            <Text style={styles.kvValMono}>{appointment.duration} minutes</Text>
          </View>

          <View style={styles.kvRow}>
            <Text style={styles.kvKey}>Requested slot</Text>
            <Text style={styles.kvValMono}>{dateFormatted}</Text>
          </View>

          {appointment.confirmedDate && (
            <View style={styles.kvRow}>
              <Text style={styles.kvKey}>Confirmed slot</Text>
              <Text style={styles.kvValMono}>{format(parseISO(appointment.confirmedDate), 'dd MMM yyyy, hh:mm a')}</Text>
            </View>
          )}

          {appointment.meetingLink && (
            <View style={styles.kvRow}>
              <Text style={styles.kvKey}>Video meeting link</Text>
              <TouchableOpacity onPress={() => Linking.openURL(appointment.meetingLink!)}>
                <Text style={styles.linkText} numberOfLines={1}>{appointment.meetingLink}</Text>
              </TouchableOpacity>
            </View>
          )}

          {appointment.notes && (
            <View style={styles.kvRow}>
              <Text style={styles.kvKey}>Admin notes</Text>
              <Text style={styles.kvValText}>{appointment.notes}</Text>
            </View>
          )}

          {appointment.cancelledReason && (
            <View style={styles.kvRow}>
              <Text style={styles.kvKey}>Cancellation reason</Text>
              <Text style={[styles.kvValText, { color: Colors.danger }]}>{appointment.cancelledReason}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  loadingText: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    paddingBottom: Spacing['3xl'],
  },
  headerBlock: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.backgroundCard,
  },
  refCode: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  sessionTitle: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: Typography.size['2xl'],
    color: Colors.primary,
  },
  sessionDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 20,
  },
  keyFactsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.hairline,
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  keyFactCol: {
    flex: 1,
  },
  factLabel: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 9,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
  factValueText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.primary,
    marginTop: 2,
  },
  factValueMono: {
    fontFamily: Typography.fontFamily.monoBold, // mono values
    fontSize: Typography.size.xs,
    color: Colors.primary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.hairline,
  },
  formSection: {
    padding: Spacing.xl,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
    gap: Spacing.md,
  },
  sectionHeading: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  linkGenerator: {
    alignSelf: 'flex-start',
    marginTop: -Spacing.xs,
    marginBottom: Spacing.sm,
  },
  linkGeneratorText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.secondaryDark,
    textDecorationLine: 'underline',
  },
  formActionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  detailsSection: {
    padding: Spacing.xl,
    backgroundColor: Colors.backgroundCard,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  kvKey: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  kvValMono: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.primary,
  },
  kvValText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.primary,
  },
  linkText: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.secondaryDark,
    textDecorationLine: 'underline',
  },
});

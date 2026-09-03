import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { format, parseISO } from 'date-fns';
import { useCalendarEvents } from '../../hooks/useQueries';
import { calendarService } from '../../services/calendarService';

export default function AdminCalendarScreen() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selected, setSelected] = useState(today);
  const { data: calendarRes, refetch } = useCalendarEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'FILING' | 'MEETING' | 'TAX' | 'REMINDER'>('FILING');
  const [description, setDescription] = useState('');

  const backendEvents = (calendarRes?.data || []).map((e: any) => {
    let eventDate = today;
    try {
      eventDate = format(parseISO(e.date), 'yyyy-MM-dd');
    } catch {
      eventDate = e.date ? e.date.split('T')[0] : today;
    }

    const mappedType = e.type === 'FILING_DEADLINE' ? 'FILING' : e.type;

    return {
      id: e.id,
      date: eventDate,
      title: e.title,
      type: mappedType,
      description: e.description || '',
    };
  });

  const markedDates = backendEvents.reduce(
    (acc: any, event: any) => {
      const isSelected = event.date === selected;
      const existing = acc[event.date];
      return {
        ...acc,
        [event.date]: {
          marked: true,
          dotColor: Colors.secondary,
          selected: isSelected,
          selectedColor: Colors.primary,
          ...(existing || {}),
        },
      };
    },
    { [selected]: { selected: true, selectedColor: Colors.primary } } as Record<string, object>
  );

  const selectedEvents = backendEvents.filter((e: any) => e.date === selected);
  const upcomingEvents = backendEvents
    .filter((e: any) => e.date >= today)
    .sort((a: any, b: any) => a.date.localeCompare(b.date));

  const handleCreateEvent = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title.');
      return;
    }
    setIsSubmitting(true);
    try {
      await calendarService.createEvent({
        title: title.trim(),
        description: description.trim(),
        type: type === 'FILING' ? 'FILING_DEADLINE' : type,
        date: selected,
      });
      Alert.alert('Success', 'Event added to filing schedule.');
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      refetch();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Statutory Filing Calendar</Text>
            <Text style={styles.subtitle}>Statutory deadlines, GST cycles, and client consultations</Text>
          </View>
          <AppButton
            title="Add Deadline"
            size="sm"
            onPress={() => setIsModalOpen(true)}
          />
        </View>

        <View style={styles.hairlineRule} />

        {/* Minimal Calendar Component */}
        <View style={styles.calendarWrapper}>
          <Calendar
            current={selected}
            onDayPress={(day) => setSelected(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: Colors.backgroundCard,
              calendarBackground: Colors.backgroundCard,
              textSectionTitleColor: Colors.textTertiary,
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: Colors.textLight,
              todayTextColor: Colors.secondaryDark,
              dayTextColor: Colors.primary,
              textDisabledColor: Colors.border,
              dotColor: Colors.secondary,
              selectedDotColor: Colors.textLight,
              arrowColor: Colors.primary,
              monthTextColor: Colors.primary,
              textDayFontFamily: Typography.fontFamily.monoRegular,
              textMonthFontFamily: Typography.fontFamily.semiBold,
              textDayHeaderFontFamily: Typography.fontFamily.monoRegular,
              textDayFontSize: 13,
              textMonthFontSize: 14,
              textDayHeaderFontSize: 10,
            }}
          />
        </View>

        <View style={styles.hairlineRule} />

        {/* Selected Date Filing Schedule */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Schedule for {format(parseISO(selected), 'dd MMM yyyy').toUpperCase()}</Text>
          <Text style={styles.refMeta}>SELECTED</Text>
        </View>

        <View style={styles.filingList}>
          {selectedEvents.map((evt: any) => (
            <View key={evt.id} style={styles.filingRow}>
              <View style={styles.dateCol}>
                <Text style={styles.dateMono}>{format(parseISO(evt.date), 'dd MMM')}</Text>
              </View>
              <View style={styles.detailsCol}>
                <Text style={styles.deadlineTitle}>{evt.title}</Text>
                {evt.description ? <Text style={styles.deadlineDesc}>{evt.description}</Text> : null}
              </View>
              <Text style={styles.typeMono}>{evt.type}</Text>
            </View>
          ))}
          {selectedEvents.length === 0 && (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No deadlines scheduled on this date.</Text>
            </View>
          )}
        </View>

        <View style={styles.hairlineRule} />

        {/* Upcoming Filing Calendar (reads like a formal tax calendar) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Upcoming Statutory Deadlines</Text>
          <Text style={styles.refMeta}>CHRONOLOGICAL</Text>
        </View>

        <View style={styles.filingList}>
          {upcomingEvents.map((evt: any, index: number) => {
            const isNext = index === 0;
            return (
              <View key={evt.id} style={[styles.filingRow, isNext && styles.filingRowActive]}>
                {/* Brass accent mark ONLY on the current/upcoming item */}
                {isNext && <View style={styles.brassAccentLine} />}

                <View style={styles.dateCol}>
                  <Text style={[styles.dateMono, isNext && styles.dateMonoActive]}>
                    {format(parseISO(evt.date), 'dd MMM yyyy')}
                  </Text>
                </View>

                <View style={styles.detailsCol}>
                  <Text style={styles.deadlineTitle}>{evt.title}</Text>
                  {evt.description ? <Text style={styles.deadlineDesc}>{evt.description}</Text> : null}
                </View>

                <Text style={[styles.typeMono, isNext && styles.typeMonoActive]}>
                  {evt.type}
                </Text>
              </View>
            );
          })}
          {upcomingEvents.length === 0 && (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No statutory deadlines upcoming.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Deadline Modal */}
      <Modal
        visible={isModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Statutory Deadline</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <MaterialIcons name="close" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.hairlineRule} />

            <View style={styles.modalForm}>
              <Text style={styles.dateNotice}>
                Target Date: <Text style={styles.dateNoticeMono}>{selected}</Text>
              </Text>

              <AppInput
                label="Statutory Requirement / Title *"
                placeholder="GSTR-3B Monthly Filing"
                value={title}
                onChangeText={setTitle}
              />

              <AppInput
                label="Compliance Guidance / Notes"
                placeholder="Applicable to taxpayers with turnover > 5 Cr..."
                value={description}
                onChangeText={setDescription}
              />

              <AppButton
                title={isSubmitting ? 'Recording...' : 'Save to Practice Calendar'}
                onPress={handleCreateEvent}
                loading={isSubmitting}
                size="md"
                style={{ marginTop: Spacing.md }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing['3xl'] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: Typography.size.xl,
    color: Colors.primary,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.hairline,
  },
  calendarWrapper: {
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  sectionHeading: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  refMeta: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
  filingList: {
    backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.hairline,
  },
  filingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
    position: 'relative',
  },
  filingRowActive: {
    backgroundColor: 'rgba(184, 134, 58, 0.05)',
  },
  // Brass accent mark only on current/upcoming item
  brassAccentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: Colors.secondary,
  },
  dateCol: {
    width: 90,
  },
  dateMono: {
    fontFamily: Typography.fontFamily.monoRegular, // mono date
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  dateMonoActive: {
    fontFamily: Typography.fontFamily.monoBold,
    color: Colors.secondaryDark,
  },
  detailsCol: {
    flex: 1,
    marginRight: Spacing.md,
  },
  deadlineTitle: {
    fontFamily: Typography.fontFamily.medium, // Montserrat
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  deadlineDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  typeMono: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },
  typeMonoActive: {
    color: Colors.secondaryDark,
    fontFamily: Typography.fontFamily.monoMedium,
  },
  emptyRow: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 38, 30, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: Typography.size.base,
    color: Colors.primary,
  },
  modalForm: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  dateNotice: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  dateNoticeMono: {
    fontFamily: Typography.fontFamily.monoBold,
    color: Colors.primary,
  },
});

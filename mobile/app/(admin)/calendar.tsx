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
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { format, parseISO } from 'date-fns';
import { useCalendarEvents } from '../../hooks/useQueries';
import { calendarService } from '../../services/calendarService';

const EVENT_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  FILING: 'assignment',
  MEETING: 'people',
  TAX: 'account-balance',
  REMINDER: 'alarm',
};

const EVENT_COLORS: Record<string, string> = {
  FILING: Colors.danger,
  MEETING: Colors.success,
  TAX: Colors.warning,
  REMINDER: Colors.primary,
};

export default function AdminCalendarScreen() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selected, setSelected] = useState(today);
  const { data: calendarRes, refetch } = useCalendarEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Event Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'FILING' | 'MEETING' | 'TAX' | 'REMINDER'>('MEETING');
  const [description, setDescription] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  // Map backend events into structured calendar items
  const backendEvents = (calendarRes?.data || []).map((e: any) => {
    // Format date consistently
    let eventDate = today;
    try {
      eventDate = format(parseISO(e.date), 'yyyy-MM-dd');
    } catch {
      eventDate = e.date ? e.date.split('T')[0] : today;
    }

    // Determine type mapping
    const mappedType = e.type === 'FILING_DEADLINE' ? 'FILING' : e.type;

    return {
      id: e.id,
      date: eventDate,
      title: e.title,
      type: mappedType,
      color: EVENT_COLORS[mappedType] || Colors.primary,
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
          dotColor: event.color,
          selected: isSelected,
          selectedColor: Colors.primary,
          ...(existing || {}),
        },
      };
    },
    { [selected]: { selected: true, selectedColor: Colors.primary } } as Record<string, object>
  );

  const selectedEvents = backendEvents.filter((e: any) => e.date === selected);
  const upcomingEvents = backendEvents.filter((e: any) => e.date >= today)
    .sort((a: any, b: any) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const handleCreateEvent = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        date: new Date(selected).toISOString(),
        type: type === 'FILING' ? 'FILING_DEADLINE' : type,
        description,
      };

      const res = await calendarService.createEvent(payload);
      if (res.data) {
        Alert.alert('Success', 'Calendar event scheduled successfully.');
        setTitle('');
        setDescription('');
        setIsModalOpen(false);
        refetch();
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to schedule event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Calendar</Text>
            <Text style={styles.subtitle}>Filing deadlines & appointments</Text>
          </View>
          <AppButton
            title="Add Event"
            size="sm"
            onPress={() => setIsModalOpen(true)}
            style={styles.addBtn}
          />
        </View>

        {/* Calendar */}
        <AppCard style={styles.calendarCard} noPadding>
          <Calendar
            current={today}
            onDayPress={(day: { dateString: string }) => setSelected(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              todayTextColor: Colors.secondary,
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: Colors.textLight,
              dotColor: Colors.danger,
              arrowColor: Colors.primary,
              monthTextColor: Colors.textPrimary,
              textDayFontFamily: Typography.fontFamily.regular,
              textMonthFontFamily: Typography.fontFamily.semiBold,
              textDayHeaderFontFamily: Typography.fontFamily.medium,
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12,
              dayTextColor: Colors.textPrimary,
              textDisabledColor: Colors.textMuted,
            }}
          />
        </AppCard>

        {/* Events on Selected Date */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selected === today ? "Today's Events" : `Events on ${format(parseISO(selected), 'dd MMM yyyy')}`}
          </Text>
        </View>

        {selectedEvents.length === 0 ? (
          <AppCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>No events on this date</Text>
          </AppCard>
        ) : (
          selectedEvents.map((event: any, i: number) => (
            <AppCard key={event.id || i} style={styles.eventCard}>
              <View style={styles.eventRow}>
                <View style={[styles.eventIcon, { backgroundColor: `${event.color}18` }]}>
                  <MaterialIcons name={EVENT_ICONS[event.type] || 'event'} size={18} color={event.color} />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {event.description && <Text style={styles.eventDescText}>{event.description}</Text>}
                  <Text style={[styles.eventType, { color: event.color }]}>{event.type}</Text>
                </View>
                <View style={[styles.colorDot, { backgroundColor: event.color }]} />
              </View>
            </AppCard>
          ))
        )}

        {/* Upcoming Deadlines */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
        </View>
        <AppCard style={styles.upcomingCard} noPadding>
          {upcomingEvents.map((event: any, i: number) => (
            <View
              key={event.id || i}
              style={[styles.upcomingItem, i < upcomingEvents.length - 1 && styles.upcomingBorder]}
            >
              <View style={[styles.upcomingDate, { borderColor: event.color }]}>
                <Text style={[styles.upcomingDateText, { color: event.color }]}>
                  {format(parseISO(event.date), 'dd')}
                </Text>
                <Text style={[styles.upcomingMonth, { color: event.color }]}>
                  {format(parseISO(event.date), 'MMM')}
                </Text>
              </View>
              <View style={styles.upcomingInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={[styles.eventType, { color: event.color }]}>{event.type}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={Colors.textTertiary} />
            </View>
          ))}
          {upcomingEvents.length === 0 && (
            <View style={styles.noUpcoming}>
              <Text style={styles.emptyText}>No upcoming deadlines scheduled</Text>
            </View>
          )}
        </AppCard>

        {/* Legend */}
        <View style={styles.legend}>
          {[
            { color: Colors.danger, label: 'Filing Deadline' },
            { color: Colors.warning, label: 'Tax Payment' },
            { color: Colors.success, label: 'Meeting' },
            { color: Colors.primary, label: 'Reminder' },
          ].map((l) => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color }]} />
              <Text style={styles.legendText}>{l.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Schedule Event Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Event</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm}>
              <Text style={styles.modalDateText}>
                Date: <Text style={{ color: Colors.secondaryDark, fontWeight: 'bold' }}>{selected}</Text>
              </Text>

              <AppInput
                label="Event Title"
                placeholder="GST Compliance Consultation"
                value={title}
                onChangeText={setTitle}
              />

              {/* Type Select */}
              <View style={styles.pickerField}>
                <Text style={styles.fieldLabel}>Event Type</Text>
                <View style={{ zIndex: 1000, position: 'relative' }}>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => setShowPicker(!showPicker)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.selectButtonText}>
                      {type === 'MEETING' ? 'Meeting' :
                       type === 'FILING' ? 'Filing Deadline' :
                       type === 'TAX' ? 'Tax Payment' :
                       type === 'REMINDER' ? 'General Reminder' : 'Choose type...'}
                    </Text>
                    <MaterialIcons
                      name={showPicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {showPicker && (
                    <View style={styles.dropdownContainer}>
                      <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                        {[
                          { value: 'MEETING', label: 'Meeting' },
                          { value: 'FILING', label: 'Filing Deadline' },
                          { value: 'TAX', label: 'Tax Payment' },
                          { value: 'REMINDER', label: 'General Reminder' },
                        ].map((t) => (
                          <TouchableOpacity
                            key={t.value}
                            style={[
                              styles.dropdownItem,
                              type === t.value && styles.dropdownItemSelected
                            ]}
                            onPress={() => {
                              setType(t.value as any);
                              setShowPicker(false);
                            }}
                          >
                            <Text style={[
                              styles.dropdownItemText,
                              type === t.value && styles.dropdownItemTextSelected
                            ]}>
                              {t.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              <AppInput
                label="Description / Location"
                placeholder="Virtual Consultation via Google Meet"
                value={description}
                onChangeText={setDescription}
              />

              <AppButton
                title={isSubmitting ? 'Scheduling...' : 'Save Calendar Event'}
                onPress={handleCreateEvent}
                loading={isSubmitting}
                style={styles.modalSubmitBtn}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  addBtn: {},
  calendarCard: {
    marginHorizontal: Spacing.base,
    overflow: 'hidden',
  },
  sectionHeader: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  emptyCard: {
    marginHorizontal: Spacing.base,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
  },
  eventCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  eventIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
    gap: 2,
  },
  eventTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  eventDescText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  eventType: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  upcomingCard: {
    marginHorizontal: Spacing.base,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  upcomingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  upcomingDate: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcomingDateText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
  },
  upcomingMonth: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 9,
    textTransform: 'uppercase',
    marginTop: -2,
  },
  upcomingInfo: {
    flex: 1,
    gap: 2,
  },
  noUpcoming: {
    padding: Spacing.base,
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.base,
    gap: Spacing.base,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  bottomPad: { height: Spacing['3xl'] },
  
  // Modal layout
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  modalContent: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    overflow: 'hidden',
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.primary,
  },
  modalForm: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  modalDateText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  pickerField: {
    marginBottom: Spacing.xs,
  },
  fieldLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  pickerWrapper: {
    backgroundColor: Colors.backgroundInput,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    height: 48,
    paddingHorizontal: Spacing.sm,
  },
  selectButtonText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  dropdownContainer: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    marginTop: 4,
    maxHeight: 180,
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    zIndex: 2000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  dropdownScroll: {
    paddingVertical: 4,
  },
  dropdownItem: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.statusActive,
  },
  dropdownItemText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  dropdownItemTextSelected: {
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
  modalSubmitBtn: {
    marginTop: Spacing.base,
  },
});

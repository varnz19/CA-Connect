import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import { AppCard } from '../../components/common/AppCard';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { format } from 'date-fns';
import { useCalendarEvents } from '../../hooks/useQueries';

interface CalendarEventItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: 'FILING_DEADLINE' | 'TAX_DEADLINE' | 'MEETING' | 'REMINDER';
  isGlobal: boolean;
}

const EVENT_COLORS: Record<string, string> = {
  FILING_DEADLINE: Colors.danger,
  TAX_DEADLINE: Colors.warning,
  MEETING: Colors.success,
  REMINDER: Colors.primary,
};

const EVENT_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  FILING_DEADLINE: 'assignment',
  TAX_DEADLINE: 'account-balance',
  MEETING: 'people',
  REMINDER: 'alarm',
};

export default function ClientCalendarScreen() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selected, setSelected] = useState(today);
  
  const { data: eventsData, isLoading, refetch } = useCalendarEvents();

  // Fallback default events
  const defaultEvents: CalendarEventItem[] = [
    { id: '1', title: 'GST Return Filing (GSTR-1)', date: today, type: 'FILING_DEADLINE', isGlobal: true },
    { id: '2', title: 'ITR Deadline', date: '2026-07-31', type: 'FILING_DEADLINE', isGlobal: true },
    { id: '3', title: 'TDS Payment Due', date: '2026-07-07', type: 'TAX_DEADLINE', isGlobal: true },
    { id: '4', title: 'CA Consultation Meeting', date: today, type: 'MEETING', isGlobal: false },
  ];

  const eventsList = (eventsData?.data || defaultEvents) as CalendarEventItem[];

  const markedDates = eventsList.reduce(
    (acc, event) => {
      const isSelected = event.date === selected;
      const eventColor = EVENT_COLORS[event.type] || Colors.primary;
      const existing = acc[event.date];
      return {
        ...acc,
        [event.date]: {
          marked: true,
          dotColor: eventColor,
          selected: isSelected,
          selectedColor: Colors.primary,
          ...(existing || {}),
        },
      };
    },
    { [selected]: { selected: true, selectedColor: Colors.primary } } as Record<string, any>
  );

  const selectedEvents = eventsList.filter((e) => e.date === selected);
  const upcomingEvents = eventsList
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>My Calendar</Text>
          <Text style={styles.subtitle}>Filing deadlines & meetings</Text>
        </View>

        {/* Calendar Card */}
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
              textDayFontSize: 13,
              textMonthFontSize: 15,
              textDayHeaderFontSize: 11,
              dayTextColor: Colors.textPrimary,
              textDisabledColor: Colors.textMuted,
            }}
          />
        </AppCard>

        {/* Selected Day Events */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Events on {format(new Date(selected), 'MMMM dd, yyyy')}
          </Text>
        </View>

        <View style={styles.eventsContainer}>
          {selectedEvents.length === 0 ? (
            <View style={styles.emptyEvents}>
              <MaterialIcons name="event-note" size={24} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>No events scheduled for this day</Text>
            </View>
          ) : (
            selectedEvents.map((event) => {
              const icon = EVENT_ICONS[event.type] || 'event';
              const color = EVENT_COLORS[event.type] || Colors.primary;
              return (
                <AppCard key={event.id} style={styles.eventCard}>
                  <View style={styles.eventRow}>
                    <View style={[styles.iconWrapper, { backgroundColor: `${color}15` }]}>
                      <MaterialIcons name={icon} size={18} color={color} />
                    </View>
                    <View style={styles.eventDetails}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      {event.description && (
                        <Text style={styles.eventDesc}>{event.description}</Text>
                      )}
                      <Text style={styles.eventBadge}>
                        {event.isGlobal ? 'Tax Deadline' : 'My Event'}
                      </Text>
                    </View>
                  </View>
                </AppCard>
              );
            })
          )}
        </View>

        {/* Upcoming Events */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
        </View>

        <View style={styles.upcomingContainer}>
          {upcomingEvents.map((event) => {
            const icon = EVENT_ICONS[event.type] || 'event';
            const color = EVENT_COLORS[event.type] || Colors.primary;
            return (
              <TouchableOpacity
                key={event.id}
                style={styles.upcomingRow}
                onPress={() => setSelected(event.date)}
              >
                <View style={[styles.iconWrapper, { backgroundColor: `${color}15` }]}>
                  <MaterialIcons name={icon} size={16} color={color} />
                </View>
                <View style={styles.upcomingDetails}>
                  <Text style={styles.upcomingTitle} numberOfLines={1}>{event.title}</Text>
                  <Text style={styles.upcomingDate}>
                    {format(new Date(event.date), 'EEE, MMM dd')}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footerPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: Spacing['3xl'] },
  header: {
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
    marginTop: 2,
  },
  calendarCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  sectionHeader: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md - 1,
    color: Colors.textPrimary,
  },
  eventsContainer: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  emptyEvents: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
  },
  emptyText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  eventCard: {
    marginBottom: Spacing.xs,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm + 1,
    color: Colors.textPrimary,
  },
  eventDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  eventBadge: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 9,
    color: Colors.secondary,
    marginTop: 4,
  },
  upcomingContainer: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  upcomingDetails: {
    flex: 1,
  },
  upcomingTitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  upcomingDate: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  footerPad: {
    height: Spacing['2xl'],
  },
});

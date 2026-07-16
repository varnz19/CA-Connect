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
import { format, parseISO } from 'date-fns';

const TAX_EVENTS = [
  { date: '2025-07-31', title: 'ITR Filing Deadline', type: 'FILING', color: Colors.danger },
  { date: '2025-07-18', title: 'Client Meeting - Rajesh Kumar', type: 'MEETING', color: Colors.success },
  { date: '2025-07-20', title: 'Audit Planning - Meera Patel', type: 'MEETING', color: Colors.success },
  { date: '2025-07-31', title: 'TDS Return Q1', type: 'FILING', color: Colors.warning },
  { date: '2025-08-15', title: 'GST Return GSTR-1', type: 'FILING', color: Colors.danger },
  { date: '2025-09-15', title: 'Advance Tax Q2', type: 'TAX', color: Colors.warning },
  { date: '2025-10-31', title: 'TDS Return Q2', type: 'FILING', color: Colors.warning },
  { date: '2025-11-30', title: 'ROC Annual Filing', type: 'FILING', color: Colors.danger },
  { date: '2025-12-15', title: 'Advance Tax Q3', type: 'TAX', color: Colors.warning },
  { date: '2025-12-31', title: 'GST Annual Return (GSTR-9)', type: 'FILING', color: Colors.danger },
];

const EVENT_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  FILING: 'assignment',
  MEETING: 'people',
  TAX: 'account-balance',
  REMINDER: 'alarm',
};

export default function AdminCalendarScreen() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selected, setSelected] = useState(today);

  const markedDates = TAX_EVENTS.reduce(
    (acc, event) => {
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

  const selectedEvents = TAX_EVENTS.filter((e) => e.date === selected);
  const upcomingEvents = TAX_EVENTS.filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
          <Text style={styles.subtitle}>Filing deadlines & appointments</Text>
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
          selectedEvents.map((event, i) => (
            <AppCard key={i} style={styles.eventCard}>
              <View style={styles.eventRow}>
                <View style={[styles.eventIcon, { backgroundColor: `${event.color}18` }]}>
                  <MaterialIcons name={EVENT_ICONS[event.type] || 'event'} size={18} color={event.color} />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
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
          {upcomingEvents.map((event, i) => (
            <View
              key={i}
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
        </AppCard>

        {/* Legend */}
        <View style={styles.legend}>
          {[
            { color: Colors.danger, label: 'Filing Deadline' },
            { color: Colors.warning, label: 'Tax Payment' },
            { color: Colors.success, label: 'Meeting' },
          ].map((l) => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color }]} />
              <Text style={styles.legendText}>{l.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
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
  },
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
  eventCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.xs,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  eventIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: { flex: 1 },
  eventTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  eventType: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    marginTop: 2,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyCard: {
    marginHorizontal: Spacing.base,
    alignItems: 'center',
    paddingVertical: Spacing.base,
  },
  emptyText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
  },
  upcomingCard: {
    marginHorizontal: Spacing.base,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.base,
  },
  upcomingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  upcomingDate: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingDateText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
  },
  upcomingMonth: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 9,
  },
  upcomingInfo: { flex: 1 },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.base,
    marginTop: Spacing.base,
    paddingHorizontal: Spacing.base,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  bottomPad: { height: Spacing['2xl'] },
});

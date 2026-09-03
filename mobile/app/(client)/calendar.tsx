import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { format, parseISO } from 'date-fns';
import { useCalendarEvents } from '../../hooks/useQueries';

export default function ClientCalendarScreen() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selected, setSelected] = useState(today);
  const { data: eventsData } = useCalendarEvents();

  const formatEventDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yyyy-MM-dd');
    } catch {
      return dateStr;
    }
  };

  const rawEvents = eventsData?.data || [];
  const eventsList = rawEvents.map((e: any) => ({
    ...e,
    date: formatEventDate(e.date),
  }));

  const markedDates = eventsList.reduce(
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
    { [selected]: { selected: true, selectedColor: Colors.primary } } as Record<string, any>
  );

  const selectedEvents = eventsList.filter((e: any) => e.date === selected);
  const upcomingEvents = eventsList
    .filter((e: any) => e.date >= today)
    .sort((a: any, b: any) => a.date.localeCompare(b.date));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tax & Filing Calendar</Text>
          <Text style={styles.subtitle}>Statutory deadlines, GST return cycles, and advisory sessions</Text>
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
          <Text style={styles.sectionHeading}>Deadlines for {format(parseISO(selected), 'dd MMM yyyy').toUpperCase()}</Text>
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
              <Text style={styles.typeMono}>{evt.type?.replace('_', ' ')}</Text>
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
          <Text style={styles.refMeta}>COMPLIANCE SCHEDULE</Text>
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
                  {evt.type?.replace('_', ' ')}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing['3xl'] },
  header: {
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
    fontFamily: Typography.fontFamily.monoRegular,
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
    fontFamily: Typography.fontFamily.medium,
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
});

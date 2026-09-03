import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppointmentCard } from '../../components/common/EntityCards';
import { AppEmpty } from '../../components/common/AppStates';
import { AppButton } from '../../components/common/AppButton';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useAppointments } from '../../hooks/useQueries';
import { AppointmentStatus } from '../../types';

type FilterTab = 'ALL' | AppointmentStatus;

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'REQUESTED', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export default function AdminAppointmentsScreen() {
  const router = useRouter();
  const { data: appointmentsRes, refetch } = useAppointments();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterTab>('ALL');
  const appointmentsList = appointmentsRes?.data || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filtered =
    filter === 'ALL'
      ? appointmentsList
      : appointmentsList.filter((a) => a.status === filter);

  const pendingCount = appointmentsList.filter((a) => a.status === 'REQUESTED').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Client Consultations</Text>
                <Text style={styles.subtitle}>
                  {appointmentsList.length} total sessions
                  {pendingCount > 0 ? ` · ${pendingCount} require confirmation` : ''}
                </Text>
              </View>
              <AppButton
                title="Schedule"
                size="sm"
                onPress={() => router.push('/(admin)/add-appointment' as any)}
              />
            </View>

            <View style={styles.hairlineRule} />

            {/* Flat Filter Bar */}
            <View style={styles.filterBar}>
              <FlatList
                horizontal
                data={FILTERS}
                keyExtractor={(item) => item.key}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
                renderItem={({ item: f }) => (
                  <TouchableOpacity
                    style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                    onPress={() => setFilter(f.key)}
                  >
                    <Text
                      style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}
                    >
                      {f.label}
                    </Text>
                    {f.key === 'REQUESTED' && pendingCount > 0 && (
                      <View style={styles.tabBadge}>
                        <Text style={styles.tabBadgeText}>{pendingCount}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </>
        }
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            showClient
            onPress={() => router.push(`/(admin)/appointment-detail?id=${item.id}` as any)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <AppEmpty
            title="No appointments found"
            description="Book or confirm consultation sessions with clients."
            actionLabel="Schedule Session"
            onAction={() => router.push('/(admin)/add-appointment' as any)}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
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
  filterBar: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
    backgroundColor: Colors.background,
  },
  filterRow: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 4,
  },
  filterChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundCard,
  },
  filterChipText: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  filterChipTextActive: {
    color: Colors.primary,
  },
  tabBadge: {
    paddingHorizontal: 4,
    borderRadius: 2,
    backgroundColor: Colors.secondary,
  },
  tabBadgeText: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: 9,
    color: Colors.textLight,
  },
  list: {
    backgroundColor: Colors.backgroundCard,
  },
});

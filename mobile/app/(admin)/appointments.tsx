import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppointmentCard } from '../../components/common/EntityCards';
import { AppEmpty } from '../../components/common/AppStates';
import { AppButton } from '../../components/common/AppButton';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
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
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Appointments</Text>
                <Text style={styles.subtitle}>
                  {appointmentsList.length} total
                  {pendingCount > 0 ? ` · ${pendingCount} pending review` : ''}
                </Text>
              </View>
              <AppButton
                title="New"
                size="sm"
                onPress={() => router.push('/(admin)/add-appointment' as any)}
              />
            </View>

            {/* Filter Tabs */}
            <FlatList
              horizontal
              data={FILTERS}
              keyExtractor={(item) => item.key}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
              renderItem={({ item: f }) => (
                <TouchableOpacity
                  style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
                  onPress={() => setFilter(f.key)}
                >
                  <Text
                    style={[styles.filterTabText, filter === f.key && styles.filterTabTextActive]}
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
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <AppointmentCard
              appointment={item}
              showClient
              onPress={() => router.push(`/(admin)/appointment-detail?id=${item.id}` as any)}
            />
          </View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <AppEmpty
            icon="event-available"
            title="No appointments found"
            description="Client appointment requests will appear here."
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: Typography.size.xl,
    color: Colors.primary,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  filterRow: { gap: Spacing.xs, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterTabText: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  filterTabTextActive: { color: Colors.textLight },
  tabBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: { fontFamily: Typography.fontFamily.monoBold, fontSize: 9, color: Colors.background },
  list: { paddingBottom: Spacing['3xl'] },
  cardWrapper: { paddingHorizontal: Spacing.xl },
});

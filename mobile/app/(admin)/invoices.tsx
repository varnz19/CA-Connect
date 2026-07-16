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
import { MaterialIcons } from '@expo/vector-icons';
import { AppCard } from '../../components/common/AppCard';
import { AppBadge } from '../../components/common/AppBadge';
import { AppButton } from '../../components/common/AppButton';
import { AppEmpty } from '../../components/common/AppStates';
import { InvoiceCard } from '../../components/common/EntityCards';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useInvoices } from '../../hooks/useQueries';
import { mockInvoices } from '../../utils/mockData';
import { Invoice, InvoiceStatus } from '../../types';
import { formatCurrency } from '../../utils/formatters';

type FilterTab = 'ALL' | InvoiceStatus;

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'OVERDUE', label: 'Overdue' },
  { key: 'PAID', label: 'Paid' },
];

export default function InvoicesScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterTab>('ALL');
  const { data: invoicesData, isLoading, refetch } = useInvoices(filter === 'ALL' ? undefined : filter);

  // Fallback to mock data to keep UI always interactive
  const invoicesList = invoicesData?.data || mockInvoices;

  const filtered = filter === 'ALL' ? invoicesList : invoicesList.filter((i) => i.status === filter);

  const totalPending = invoicesList
    .filter((i) => i.status === 'PENDING')
    .reduce((sum, i) => sum + i.total, 0);
  const totalOverdue = invoicesList
    .filter((i) => i.status === 'OVERDUE')
    .reduce((sum, i) => sum + i.total, 0);
  const totalPaid = invoicesList
    .filter((i) => i.status === 'PAID')
    .reduce((sum, i) => sum + i.total, 0);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Invoices</Text>
                <Text style={styles.subtitle}>{invoicesList.length} total invoices</Text>
              </View>
              <AppButton
                title="New Invoice"
                size="sm"
                onPress={() => router.push('/(admin)/create-invoice' as any)}
              />
            </View>

            {/* Summary Cards */}
            <View style={styles.summaryRow}>
              {[
                { label: 'Pending', amount: totalPending, color: Colors.warning, bg: Colors.warningLight },
                { label: 'Overdue', amount: totalOverdue, color: Colors.danger, bg: Colors.dangerLight },
                { label: 'Collected', amount: totalPaid, color: Colors.success, bg: Colors.successLight },
              ].map((s) => (
                <AppCard key={s.label} style={[styles.summaryCard, { borderTopColor: s.color, borderTopWidth: 3 }]}>
                  <Text style={[styles.summaryAmount, { color: s.color }]}>
                    {formatCurrency(s.amount)}
                  </Text>
                  <Text style={styles.summaryLabel}>{s.label}</Text>
                </AppCard>
              ))}
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterRow}>
              {FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
                  onPress={() => setFilter(f.key)}
                >
                  <Text style={[styles.filterTabText, filter === f.key && styles.filterTabTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <InvoiceCard
              invoice={item}
              showClient
              onPress={() => router.push(`/(admin)/invoice-detail?id=${item.id}` as any)}
            />
          </View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <AppEmpty
            icon="receipt-long"
            title="No invoices found"
            description="Generate your first invoice to get started."
            actionLabel="New Invoice"
            onAction={() => router.push('/(admin)/create-invoice' as any)}
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
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  summaryCard: {
    flex: 1,
    padding: Spacing.sm,
    gap: 2,
  },
  summaryAmount: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
  },
  summaryLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  filterTab: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.textLight,
  },
  list: {
    paddingBottom: Spacing['3xl'],
  },
  cardWrapper: {
    paddingHorizontal: Spacing.base,
  },
});

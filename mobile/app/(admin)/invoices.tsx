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
import { AppButton } from '../../components/common/AppButton';
import { AppEmpty } from '../../components/common/AppStates';
import { InvoiceCard } from '../../components/common/EntityCards';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useInvoices } from '../../hooks/useQueries';
import { Invoice, InvoiceStatus } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { InvoiceDetailModal } from '../../components/invoices/InvoiceDetailModal';
import { invoiceService } from '../../services/invoiceService';

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
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  const { data: invoicesData, isLoading, refetch } = useInvoices(filter === 'ALL' ? undefined : filter);

  const invoicesList = invoicesData?.data || [];
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

  const handleMarkPaid = async (id: string) => {
    setIsMarkingPaid(true);
    try {
      await invoiceService.markPaid(id);
      Alert.alert('Success', 'Invoice recorded as settled/paid.');
      await refetch();
      if (selectedInvoice && selectedInvoice.id === id) {
        setSelectedInvoice({ ...selectedInvoice, status: 'PAID', paidAt: new Date().toISOString() });
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update invoice status.');
    } finally {
      setIsMarkingPaid(false);
    }
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
                <Text style={styles.title}>GST Invoices</Text>
                <Text style={styles.subtitle}>{invoicesList.length} total billing records · Tap to inspect</Text>
              </View>
              <AppButton
                title="+ New Invoice"
                size="sm"
                onPress={() => router.push('/(admin)/create-invoice' as any)}
              />
            </View>

            <View style={styles.hairlineRule} />

            {/* Plain Stat Blocks */}
            <View style={styles.summaryContainer}>
              <View style={styles.statBlock}>
                <Text style={styles.statAmount}>{formatCurrency(totalPending)}</Text>
                <Text style={styles.statLabel}>Pending Fee</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBlock}>
                <Text style={[styles.statAmount, { color: Colors.danger }]}>{formatCurrency(totalOverdue)}</Text>
                <Text style={styles.statLabel}>Overdue</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBlock}>
                <Text style={styles.statAmount}>{formatCurrency(totalPaid)}</Text>
                <Text style={styles.statLabel}>Collected</Text>
              </View>
            </View>

            <View style={styles.hairlineRule} />

            {/* Flat Filter Bar */}
            <View style={styles.filterBar}>
              {FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                  onPress={() => setFilter(f.key)}
                >
                  <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <InvoiceCard
            invoice={item}
            showClient
            onPress={() => setSelectedInvoice(item)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <AppEmpty
              title="No invoices found"
              description="Generate a GST tax invoice to initiate fee collection."
              actionLabel="Create Invoice"
              onAction={() => router.push('/(admin)/create-invoice' as any)}
            />
          ) : null
        }
      />

      {/* Full Detailed Tax Invoice Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        visible={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        isAdmin={true}
        onMarkPaid={handleMarkPaid}
        isProcessing={isMarkingPaid}
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
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    paddingVertical: Spacing.md,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statAmount: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.md,
    color: Colors.primary,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.hairline,
  },
  filterBar: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.textLight,
  },
  list: {
    backgroundColor: Colors.backgroundCard,
    paddingBottom: Spacing['3xl'],
  },
});

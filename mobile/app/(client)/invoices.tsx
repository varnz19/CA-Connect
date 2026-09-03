import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBadge } from '../../components/common/AppBadge';
import { AppEmpty } from '../../components/common/AppStates';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useInvoices } from '../../hooks/useQueries';
import { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { InvoiceDetailModal } from '../../components/invoices/InvoiceDetailModal';
import { invoiceService } from '../../services/invoiceService';
import { MaterialIcons } from '@expo/vector-icons';

export default function ClientInvoicesScreen() {
  const { data: invoicesData, refetch } = useInvoices();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const myInvoices = invoicesData?.data || [];

  const totalOutstanding = myInvoices
    .filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE')
    .reduce((sum, i) => sum + i.total, 0);

  const handlePayInvoice = async (invoiceId: string) => {
    setIsProcessingPayment(true);
    try {
      await invoiceService.markPaid(invoiceId);
      Alert.alert('Payment Successful', 'Fee settlement recorded. Thank you!');
      await refetch();
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, status: 'PAID', paidAt: new Date().toISOString() });
      }
    } catch (err: any) {
      Alert.alert('Payment Error', err.response?.data?.message || 'Payment processing failed.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <TouchableOpacity
      style={styles.invoiceRow}
      onPress={() => setSelectedInvoice(item)}
      activeOpacity={0.7}
    >
      <View style={styles.invoiceLeft}>
        <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
        <Text style={styles.dateMeta}>
          Issued: {formatDate(item.issueDate)} · Due: {formatDate(item.dueDate)}
        </Text>
        {item.items && item.items.length > 0 && (
          <Text style={styles.particularsSnippet} numberOfLines={1}>
            {item.items.map((i) => i.description).join(', ')}
          </Text>
        )}
      </View>

      <View style={styles.invoiceRight}>
        <Text style={styles.totalAmount}>{formatCurrency(item.total)}</Text>
        <View style={styles.statusRow}>
          <AppBadge status={item.status} />
          <MaterialIcons name="chevron-right" size={16} color={Colors.textTertiary} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={myInvoices}
        keyExtractor={(item) => item.id}
        renderItem={renderInvoice}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Tax Invoices</Text>
                <Text style={styles.subtitle}>{myInvoices.length} invoices issued · Tap to view full breakdown</Text>
              </View>
            </View>

            <View style={styles.hairlineRule} />

            {/* Summary Strip */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryLeft}>
                <Text style={styles.summaryLabel}>OUTSTANDING BALANCE</Text>
                <Text style={styles.summaryValMono}>{formatCurrency(totalOutstanding)}</Text>
              </View>
              {totalOutstanding > 0 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>SETTLEMENT DUE</Text>
                </View>
              )}
            </View>

            <View style={styles.hairlineRule} />
          </>
        }
        ListEmptyComponent={
          <AppEmpty
            title="No invoices found"
            description="All your statutory fee invoices and receipts will appear here."
          />
        }
      />

      {/* Detailed Full Tax Invoice Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        visible={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        isAdmin={false}
        onMarkPaid={handlePayInvoice}
        isProcessing={isProcessingPayment}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
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
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.backgroundCard,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
  summaryValMono: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.lg,
    color: Colors.primary,
    marginTop: 2,
  },
  pendingBadge: {
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pendingBadgeText: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 9,
    color: Colors.danger,
    letterSpacing: 0.5,
  },
  list: {
    backgroundColor: Colors.backgroundCard,
    paddingBottom: Spacing['3xl'],
  },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  invoiceLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  invoiceNumber: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  dateMeta: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  particularsSnippet: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  invoiceRight: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});

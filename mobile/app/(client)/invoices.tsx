import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppCard } from '../../components/common/AppCard';
import { StatusStamp } from '../../components/common/StatusStamp';
import { AppEmpty } from '../../components/common/AppStates';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useInvoices } from '../../hooks/useQueries';
import { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function ClientInvoicesScreen() {
  const { user } = useAuthStore();
  const clientId = user?.clientProfile?.id || 'cp-001';
  const { data: invoicesData, refetch } = useInvoices();
  const [refreshing, setRefreshing] = React.useState(false);
  const tokens = useAuthStore.getState().tokens;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const myInvoices = invoicesData?.data || [];

  const handleDownloadPdf = async (invoiceId: string) => {
    try {
      const baseUrl = api.defaults.baseURL;
      const url = `${baseUrl}/invoices/${invoiceId}/pdf?token=${tokens?.accessToken}`;
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert('Error', 'Could not open PDF file.');
    }
  };

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <AppCard style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
          <Text style={styles.issueDate}>Issued: {formatDate(item.issueDate)}</Text>
        </View>
        <StatusStamp status={item.status} />
      </View>

      <View style={styles.divider} />

      {/* Items */}
      {item.items.map((invItem) => (
        <View key={invItem.id} style={styles.itemRow}>
          <Text style={styles.itemDesc} numberOfLines={1}>{invItem.description}</Text>
          <Text style={styles.itemAmount}>{formatCurrency(invItem.amount)}</Text>
        </View>
      ))}

      <View style={styles.divider} />

      {/* Tax Breakdown */}
      <View style={styles.taxRow}>
        <Text style={styles.taxLabel}>Subtotal</Text>
        <Text style={styles.taxValue}>{formatCurrency(item.subtotal)}</Text>
      </View>
      {item.cgst > 0 && (
        <>
          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>CGST ({item.taxRate / 2}%)</Text>
            <Text style={styles.taxValue}>{formatCurrency(item.cgst)}</Text>
          </View>
          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>SGST ({item.taxRate / 2}%)</Text>
            <Text style={styles.taxValue}>{formatCurrency(item.sgst)}</Text>
          </View>
        </>
      )}
      {item.igst > 0 && (
        <View style={styles.taxRow}>
          <Text style={styles.taxLabel}>IGST ({item.taxRate}%)</Text>
          <Text style={styles.taxValue}>{formatCurrency(item.igst)}</Text>
        </View>
      )}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>{formatCurrency(item.total)}</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <MaterialIcons name="event" size={12} color={Colors.textTertiary} />
          <Text style={styles.footerText}>Due: {formatDate(item.dueDate)}</Text>
        </View>
        <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownloadPdf(item.id)}>
          <MaterialIcons name="cloud-download" size={16} color={Colors.secondary} />
          <Text style={styles.downloadText}>Download PDF</Text>
        </TouchableOpacity>
      </View>

      {item.paidAt && (
        <View style={styles.paidBanner}>
          <MaterialIcons name="check-circle" size={14} color={Colors.success} />
          <Text style={styles.paidText}>Paid on {formatDate(item.paidAt)}</Text>
        </View>
      )}
    </AppCard>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={myInvoices}
        keyExtractor={(item) => item.id}
        renderItem={renderInvoice}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>My Invoices</Text>
            <Text style={styles.subtitle}>{myInvoices.length} invoice(s)</Text>
          </View>
        }
        ListEmptyComponent={
          <AppEmpty
            icon="receipt-long"
            title="No invoices yet"
            description="Your invoices from your CA will appear here."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
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
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['3xl'] },
  card: {
    marginBottom: Spacing.md,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceNumber: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.base,
    color: Colors.primary,
  },
  issueDate: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  itemDesc: {
    flex: 1,
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  itemAmount: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  taxLabel: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  taxValue: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: Typography.size.base,
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  totalValue: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.lg,
    color: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  downloadText: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: Typography.size.xs,
    color: Colors.secondary,
    textTransform: 'uppercase',
  },
  paidBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
    backgroundColor: Colors.background,
    borderLeftWidth: 2,
    borderLeftColor: Colors.success,
    padding: Spacing.sm,
  },
  paidText: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: Typography.size.xs,
    color: Colors.success,
    textTransform: 'uppercase',
  },
});

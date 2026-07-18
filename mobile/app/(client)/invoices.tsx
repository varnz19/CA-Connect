import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppCard } from '../../components/common/AppCard';
import { AppBadge } from '../../components/common/AppBadge';
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
        <AppBadge status={item.status} />
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
  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing['3xl'] },
  card: { marginBottom: Spacing.sm },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceNumber: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  issueDate: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.sm },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  itemDesc: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  itemAmount: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  taxLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  taxValue: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.infoLight,
    borderRadius: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  downloadText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.secondary,
  },
  paidBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
    backgroundColor: Colors.successLight,
    borderRadius: 6,
    padding: Spacing.xs,
  },
  paidText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.success,
  },
});

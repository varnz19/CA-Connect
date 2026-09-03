import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { Invoice } from '../../types';
import { AppBadge } from '../common/AppBadge';
import { AppButton } from '../common/AppButton';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  visible: boolean;
  onClose: () => void;
  onMarkPaid?: (id: string) => void;
  isAdmin?: boolean;
  isProcessing?: boolean;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  visible,
  onClose,
  onMarkPaid,
  isAdmin = false,
  isProcessing = false,
}) => {
  if (!invoice) return null;

  const client = invoice.client || invoice.clientProfile?.user;
  const profile = invoice.clientProfile;
  const items = invoice.items || [];

  const subtotal = invoice.subtotal || items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
  const cgst = invoice.cgst || (subtotal * (invoice.taxRate / 2) / 100);
  const sgst = invoice.sgst || (subtotal * (invoice.taxRate / 2) / 100);
  const total = invoice.total || (subtotal + cgst + sgst);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.statutoryTag}>STATUTORY TAX INVOICE</Text>
              <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.headerRight}>
              <AppBadge status={invoice.status} />
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <MaterialIcons name="close" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.hairlineRule} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Parties & Dates Grid */}
            <View style={styles.partiesGrid}>
              <View style={styles.partyCol}>
                <Text style={styles.sectionLabel}>BILLED TO</Text>
                <Text style={styles.partyName}>
                  {client ? `${client.firstName} ${client.lastName}` : 'Client Account'}
                </Text>
                {profile?.firmName && (
                  <Text style={styles.partyFirm}>{profile.firmName}</Text>
                )}
                <Text style={styles.partyMetaMono}>
                  GSTIN: {profile?.gstin || '—'}
                </Text>
                <Text style={styles.partyMetaMono}>
                  PAN: {profile?.panNumber || '—'}
                </Text>
                {profile?.gstState && (
                  <Text style={styles.partyMeta}>State: {profile.gstState}</Text>
                )}
              </View>

              <View style={styles.dateCol}>
                <Text style={styles.sectionLabel}>INVOICE DATES</Text>
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>Issue Date:</Text>
                  <Text style={styles.dateValMono}>{formatDate(invoice.issueDate)}</Text>
                </View>
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>Due Date:</Text>
                  <Text style={[styles.dateValMono, invoice.status === 'OVERDUE' && styles.overdueDate]}>
                    {formatDate(invoice.dueDate)}
                  </Text>
                </View>
                {invoice.paidAt && (
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>Settled At:</Text>
                    <Text style={styles.dateValMono}>{formatDate(invoice.paidAt)}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.hairlineRule} />

            {/* Line Items Table */}
            <Text style={styles.sectionLabel}>ITEMIZED PARTICULARS</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, styles.colDesc]}>PARTICULARS / SERVICE</Text>
                <Text style={[styles.th, styles.colQty]}>QTY</Text>
                <Text style={[styles.th, styles.colRate]}>RATE (INR)</Text>
                <Text style={[styles.th, styles.colAmt]}>TOTAL</Text>
              </View>

              {items.length > 0 ? (
                items.map((item, idx) => (
                  <View key={item.id || idx} style={styles.tableRow}>
                    <Text style={[styles.td, styles.colDesc]}>{item.description}</Text>
                    <Text style={[styles.tdMono, styles.colQty]}>{item.quantity}</Text>
                    <Text style={[styles.tdMono, styles.colRate]}>{formatCurrency(item.unitPrice)}</Text>
                    <Text style={[styles.tdMono, styles.colAmt]}>
                      {formatCurrency(item.amount || item.quantity * item.unitPrice)}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.tableRow}>
                  <Text style={[styles.td, styles.colDesc]}>Professional Advisory Services</Text>
                  <Text style={[styles.tdMono, styles.colQty]}>1</Text>
                  <Text style={[styles.tdMono, styles.colRate]}>{formatCurrency(subtotal)}</Text>
                  <Text style={[styles.tdMono, styles.colAmt]}>{formatCurrency(subtotal)}</Text>
                </View>
              )}
            </View>

            <View style={styles.hairlineRule} />

            {/* Financial Ledger Calculation */}
            <View style={styles.calcContainer}>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Taxable Subtotal</Text>
                <Text style={styles.calcValMono}>{formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>CGST ({invoice.taxRate / 2}%)</Text>
                <Text style={styles.calcValMono}>{formatCurrency(cgst)}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>SGST ({invoice.taxRate / 2}%)</Text>
                <Text style={styles.calcValMono}>{formatCurrency(sgst)}</Text>
              </View>

              <View style={[styles.hairlineRule, { marginVertical: 6 }]} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL INVOICE PAYABLE</Text>
                <Text style={styles.totalValMono}>{formatCurrency(total)}</Text>
              </View>
            </View>

            {/* Terms / Remarks */}
            {invoice.notes ? (
              <View style={styles.notesBlock}>
                <Text style={styles.sectionLabel}>PAYMENT TERMS & REMARKS</Text>
                <Text style={styles.notesText}>{invoice.notes}</Text>
              </View>
            ) : null}

            {/* Actions */}
            <View style={styles.actionRow}>
              {invoice.status !== 'PAID' && onMarkPaid && (
                <AppButton
                  title={
                    isProcessing
                      ? 'Processing...'
                      : isAdmin
                      ? 'Record as Paid'
                      : `Settle Fee (${formatCurrency(total)})`
                  }
                  size="md"
                  onPress={() => onMarkPaid(invoice.id)}
                  loading={isProcessing}
                  style={styles.primaryAction}
                />
              )}
              <AppButton
                title="Close"
                variant="outline"
                size="md"
                onPress={onClose}
                style={invoice.status === 'PAID' ? { flex: 1 } : styles.secondaryAction}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 38, 30, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '90%',
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  statutoryTag: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 9,
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  invoiceNumber: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.base,
    color: Colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  closeBtn: {
    padding: 4,
  },
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.hairline,
    marginVertical: Spacing.sm,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  partiesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Spacing.xs,
  },
  partyCol: {
    flex: 1,
    marginRight: Spacing.md,
  },
  dateCol: {
    width: 160,
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  partyName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  partyFirm: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  partyMetaMono: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  partyMeta: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  dateLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  dateValMono: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 11,
    color: Colors.primary,
  },
  overdueDate: {
    color: Colors.danger,
    fontFamily: Typography.fontFamily.monoBold,
  },
  table: {
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  th: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 9,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  td: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.primary,
  },
  tdMono: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.primary,
  },
  colDesc: { flex: 2 },
  colQty: { width: 40, textAlign: 'center' },
  colRate: { width: 85, textAlign: 'right' },
  colAmt: { width: 85, textAlign: 'right' },
  calcContainer: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: 4,
    marginVertical: Spacing.xs,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  calcLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  calcValMono: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: 2,
  },
  totalLabel: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: 11,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  totalValMono: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.lg,
    color: Colors.primary,
  },
  notesBlock: {
    marginVertical: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: 4,
  },
  notesText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  primaryAction: {
    flex: 2,
  },
  secondaryAction: {
    flex: 1,
  },
});

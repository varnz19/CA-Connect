import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
  Share,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
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

const buildInvoiceHtml = (invoice: Invoice) => {
  const client = invoice.client || invoice.clientProfile?.user;
  const profile = invoice.clientProfile;
  const items = invoice.items || [];
  const subtotal = invoice.subtotal || items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
  const cgst = invoice.cgst || (subtotal * (invoice.taxRate / 2) / 100);
  const sgst = invoice.sgst || (subtotal * (invoice.taxRate / 2) / 100);
  const total = invoice.total || (subtotal + cgst + sgst);

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${invoice.invoiceNumber}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #0F172A;
        margin: 0;
        padding: 36px;
        background: #FFFFFF;
      }
      .header-table {
        width: 100%;
        border-bottom: 2px solid #2563EB;
        padding-bottom: 18px;
        margin-bottom: 20px;
      }
      .firm-title {
        font-size: 20px;
        font-weight: 800;
        color: #1E3A8A;
        letter-spacing: -0.5px;
      }
      .firm-sub {
        font-size: 11px;
        color: #64748B;
        margin-top: 3px;
      }
      .doc-type {
        text-align: right;
      }
      .doc-badge {
        display: inline-block;
        background: #EFF6FF;
        color: #2563EB;
        font-size: 10px;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 4px;
        letter-spacing: 1px;
      }
      .inv-num {
        font-size: 16px;
        font-weight: 800;
        color: #0F172A;
        margin-top: 4px;
      }
      .info-grid {
        width: 100%;
        margin-bottom: 24px;
      }
      .info-grid td {
        vertical-align: top;
        font-size: 12px;
        line-height: 1.5;
      }
      .info-label {
        font-size: 9px;
        font-weight: 700;
        color: #94A3B8;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .info-name {
        font-size: 14px;
        font-weight: 700;
        color: #0F172A;
      }
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      .items-table th {
        background: #F8FAFC;
        border-top: 1px solid #E2E8F0;
        border-bottom: 1px solid #E2E8F0;
        padding: 9px 10px;
        font-size: 10px;
        font-weight: 700;
        color: #475569;
        text-align: left;
        letter-spacing: 0.5px;
      }
      .items-table td {
        border-bottom: 1px solid #F1F5F9;
        padding: 10px;
        font-size: 12px;
      }
      .text-right {
        text-align: right;
      }
      .summary-table {
        width: 280px;
        margin-left: auto;
        margin-bottom: 24px;
      }
      .summary-table td {
        padding: 5px 8px;
        font-size: 12px;
      }
      .summary-table tr.total-row td {
        border-top: 2px solid #0F172A;
        font-size: 14px;
        font-weight: 800;
        color: #1E3A8A;
        padding-top: 8px;
      }
      .footer-note {
        font-size: 10px;
        color: #64748B;
        border-top: 1px dashed #CBD5E1;
        padding-top: 12px;
        margin-top: 28px;
      }
      .status-stamp {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 4px;
        font-weight: 700;
        font-size: 10px;
        text-transform: uppercase;
      }
      .status-PAID { background: #DCFCE7; color: #15803D; }
      .status-PENDING { background: #FEF3C7; color: #B45309; }
      .status-OVERDUE { background: #FEE2E2; color: #B91C1C; }
    </style>
  </head>
  <body>
    <table class="header-table">
      <tr>
        <td>
          <div class="firm-title">CA CONNECT & ASSOCIATES</div>
          <div class="firm-sub">Chartered Accountants · Practice Network</div>
          <div class="firm-sub">ICAI Firm Reg. No: 123456E · GSTIN: 27AAAAA1111A1Z1</div>
        </td>
        <td class="doc-type">
          <div class="doc-badge">TAX INVOICE</div>
          <div class="inv-num">${invoice.invoiceNumber}</div>
          <div style="margin-top: 4px;">
            <span class="status-stamp status-${invoice.status}">${invoice.status}</span>
          </div>
        </td>
      </tr>
    </table>

    <table class="info-grid">
      <tr>
        <td style="width: 55%;">
          <div class="info-label">BILLED TO</div>
          <div class="info-name">${client ? `${client.firstName} ${client.lastName}` : 'Client Account'}</div>
          ${profile?.firmName ? `<div>${profile.firmName}</div>` : ''}
          ${profile?.gstin ? `<div>GSTIN: ${profile.gstin}</div>` : ''}
          ${profile?.panNumber ? `<div>PAN: ${profile.panNumber}</div>` : ''}
          ${profile?.address ? `<div>${profile.address}</div>` : ''}
        </td>
        <td style="width: 45%;">
          <div class="info-label">INVOICE DETAILS</div>
          <div><strong>Date:</strong> ${new Date(invoice.issueDate || Date.now()).toLocaleDateString('en-IN')}</div>
          <div><strong>Due Date:</strong> ${new Date(invoice.dueDate || Date.now()).toLocaleDateString('en-IN')}</div>
          ${invoice.paidAt ? `<div><strong>Settled On:</strong> ${new Date(invoice.paidAt).toLocaleDateString('en-IN')}</div>` : ''}
        </td>
      </tr>
    </table>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 50%;">PARTICULARS</th>
          <th class="text-right" style="width: 15%;">QTY</th>
          <th class="text-right" style="width: 15%;">RATE (₹)</th>
          <th class="text-right" style="width: 20%;">TOTAL (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${(items.length > 0 ? items : [{ description: 'Professional Advisory Services', quantity: 1, unitPrice: subtotal, amount: subtotal }])
          .map(
            (item: any) => `
          <tr>
            <td>${item.description}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">${Number(item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td class="text-right">${Number(item.amount || item.quantity * item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>

    <table class="summary-table">
      <tr>
        <td>Subtotal</td>
        <td class="text-right">₹${Number(subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td>CGST (${invoice.taxRate / 2}%)</td>
        <td class="text-right">₹${Number(cgst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td>SGST (${invoice.taxRate / 2}%)</td>
        <td class="text-right">₹${Number(sgst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr class="total-row">
        <td>TOTAL PAYABLE</td>
        <td class="text-right">₹${Number(total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    </table>

    <div class="footer-note">
      <strong>Payment Terms:</strong><br/>
      ${invoice.notes || 'Payment due within indicated due date via NEFT/RTGS.'}<br/>
      <em>Official statutory tax invoice generated via CA Connect.</em>
    </div>
  </body>
  </html>
  `;
};

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  visible,
  onClose,
  onMarkPaid,
  isAdmin = false,
  isProcessing = false,
}) => {
  if (!invoice) return null;

  const [isPrinting, setIsPrinting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const client = invoice.client || invoice.clientProfile?.user;
  const profile = invoice.clientProfile;
  const items = invoice.items || [];

  const subtotal = invoice.subtotal || items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
  const cgst = invoice.cgst || (subtotal * (invoice.taxRate / 2) / 100);
  const sgst = invoice.sgst || (subtotal * (invoice.taxRate / 2) / 100);
  const total = invoice.total || (subtotal + cgst + sgst);

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const html = buildInvoiceHtml(invoice);
      await Print.printAsync({ html });
    } catch (err: any) {
      console.error('Print error:', err);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.print();
      } else {
        Alert.alert('Print Error', 'Could not open print dialogue. Please try downloading the PDF instead.');
      }
    } finally {
      setIsPrinting(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const html = buildInvoiceHtml(invoice);

      if (Platform.OS !== 'web') {
        try {
          const { uri } = await Print.printToFileAsync({ html });
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
              UTI: '.pdf',
              mimeType: 'application/pdf',
              dialogTitle: `Share Invoice ${invoice.invoiceNumber}`,
            });
            return;
          }
        } catch (sharePdfErr) {
          console.warn('Sharing file fallback:', sharePdfErr);
        }
      }

      // Universal Share Fallback
      const shareMessage = `GST Tax Invoice: ${invoice.invoiceNumber}\nAmount: ${formatCurrency(total)}\nDue Date: ${formatDate(invoice.dueDate)}\nStatus: ${invoice.status}`;
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: `Invoice ${invoice.invoiceNumber}`,
          text: shareMessage,
          url: `http://localhost:4000/api/invoices/${invoice.id}/pdf`,
        });
      } else {
        await Share.share({
          title: `Invoice ${invoice.invoiceNumber}`,
          message: `${shareMessage}\n\nDownload PDF: http://localhost:4000/api/invoices/${invoice.id}/pdf`,
        });
      }
    } catch (err: any) {
      console.error('Share error:', err);
      Alert.alert('Share Invoice', `Invoice Number: ${invoice.invoiceNumber}\nAmount: ${formatCurrency(total)}`);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownloadPdf = () => {
    const url = `http://localhost:4000/api/invoices/${invoice.id}/pdf`;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch(() => {
        Alert.alert('PDF', `Download URL: ${url}`);
      });
    }
  };

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

          {/* Quick Print & Share Toolbar */}
          <View style={styles.utilityBar}>
            <TouchableOpacity
              style={styles.utilityBtn}
              onPress={handlePrint}
              disabled={isPrinting}
              activeOpacity={0.7}
            >
              {isPrinting ? (
                <ActivityIndicator size="small" color={Colors.primaryLight} />
              ) : (
                <Ionicons name="print-outline" size={16} color={Colors.primaryLight} />
              )}
              <Text style={styles.utilityBtnText}>Print</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.utilityBtn}
              onPress={handleShare}
              disabled={isSharing}
              activeOpacity={0.7}
            >
              {isSharing ? (
                <ActivityIndicator size="small" color="#059669" />
              ) : (
                <Ionicons name="share-social-outline" size={16} color="#059669" />
              )}
              <Text style={[styles.utilityBtnText, { color: '#059669' }]}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.utilityBtn}
              onPress={handleDownloadPdf}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text-outline" size={16} color="#D97706" />
              <Text style={[styles.utilityBtnText, { color: '#D97706' }]}>PDF</Text>
            </TouchableOpacity>
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
  utilityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  utilityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  utilityBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 12,
    color: Colors.primaryLight,
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

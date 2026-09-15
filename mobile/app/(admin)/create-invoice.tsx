import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { invoiceService } from '../../services/invoiceService';
import { clientService } from '../../services/clientService';
import { User } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { InvoiceDetailModal } from '../../components/invoices/InvoiceDetailModal';

interface FormItem {
  id: string;
  description: string;
  quantityStr: string;
  unitPriceStr: string;
}

export default function AdminCreateInvoiceScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const scrollRef = useRef<ScrollView>(null);
  const { clientId } = useLocalSearchParams<{ clientId: string }>();

  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<User[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [showClientModal, setShowClientModal] = useState(false);
  const [dueDate, setDueDate] = useState<string>('');
  const [taxRate, setTaxRate] = useState<number>(18);
  const [notes, setNotes] = useState<string>(
    'Payment due within 15 days via NEFT/RTGS. GST reverse charge is not applicable.'
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdInvoice, setCreatedInvoice] = useState<any | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [items, setItems] = useState<FormItem[]>([
    {
      id: 'item-1',
      description: 'Statutory Audit & Tax Compliance Services',
      quantityStr: '1',
      unitPriceStr: '5000',
    },
  ]);

  useEffect(() => {
    // Initialize default due date to 15 days ahead
    const future = new Date();
    future.setDate(future.getDate() + 15);
    setDueDate(future.toISOString().split('T')[0]);

    // Fetch clients
    clientService
      .getClients()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setClients(res.data);
          if (clientId) {
            const matched = res.data.find(
              (c) => c.clientProfile?.id === clientId || c.id === clientId
            );
            if (matched && matched.clientProfile?.id) {
              setSelectedClientId(matched.clientProfile.id);
            } else {
              setSelectedClientId(clientId);
            }
          } else {
            // Find first client with a valid profile
            const firstValid = res.data.find((c) => c.clientProfile?.id);
            if (firstValid && firstValid.clientProfile?.id) {
              setSelectedClientId(firstValid.clientProfile.id);
            }
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load clients:', err);
        setErrorMessage('Failed to load clients. Please check your network connection.');
      });
  }, [clientId]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: '',
        quantityStr: '1',
        unitPriceStr: '2500',
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof FormItem, value: string) => {
    if (errorMessage) setErrorMessage(null);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Financial calculations
  const subtotal = items.reduce((sum, item) => {
    const qty = Math.max(0, parseInt(item.quantityStr, 10) || 0);
    const price = Math.max(0, parseFloat(item.unitPriceStr) || 0);
    return sum + qty * price;
  }, 0);

  const cgst = (subtotal * (taxRate / 2)) / 100;
  const sgst = (subtotal * (taxRate / 2)) / 100;
  const total = subtotal + cgst + sgst;

  const setPresetDueDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const selectedClient = clients.find(
    (c) => c.clientProfile?.id === selectedClientId || c.id === selectedClientId
  );

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedClientId) {
      setErrorMessage('Please select a client account to bill this invoice to.');
      return;
    }

    if (!dueDate.trim()) {
      setErrorMessage('Please specify a valid due date (YYYY-MM-DD).');
      return;
    }

    // Validate line items
    for (let idx = 0; idx < items.length; idx++) {
      const itm = items[idx];
      if (!itm.description.trim()) {
        setErrorMessage(`Line Item ${idx + 1} is missing a description.`);
        return;
      }
      const qty = parseInt(itm.quantityStr, 10);
      if (isNaN(qty) || qty < 1) {
        setErrorMessage(`Line Item ${idx + 1} must have a quantity of at least 1.`);
        return;
      }
      const price = parseFloat(itm.unitPriceStr);
      if (isNaN(price) || price <= 0) {
        setErrorMessage(`Line Item ${idx + 1} must have a unit price greater than zero.`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const payload = {
        clientProfileId: selectedClientId,
        dueDate,
        taxRate,
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          description: i.description.trim(),
          quantity: parseInt(i.quantityStr, 10),
          unitPrice: parseFloat(i.unitPriceStr),
        })),
      };

      const res = await invoiceService.createInvoice(payload);
      if (res.data) {
        setCreatedInvoice(res.data);
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        setSuccessMessage(`Official GST Invoice ${res.data.invoiceNumber} generated!`);
        setShowInvoiceModal(true);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to generate invoice. Please verify line items and try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForm = () => {
    setCreatedInvoice(null);
    setSuccessMessage(null);
    setErrorMessage(null);
    setItems([
      {
        id: `item-${Date.now()}`,
        description: 'Statutory Audit & Tax Compliance Services',
        quantityStr: '1',
        unitPriceStr: '5000',
      },
    ]);
    const future = new Date();
    future.setDate(future.getDate() + 15);
    setDueDate(future.toISOString().split('T')[0]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.replace('/(admin)/invoices')}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={18} color={Colors.primaryLight} />
            <Text style={styles.backText}>All Invoices</Text>
          </TouchableOpacity>
          <View style={styles.portalTag}>
            <Text style={styles.portalTagText}>GST BILLING</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerBlock}>
              <Text style={styles.refCode}>STATUTORY TAX INVOICE</Text>
              <Text style={styles.pageTitle}>Generate GST Tax Invoice</Text>
              <Text style={styles.pageSubtitle}>
                Create an official practice invoice with CGST, SGST, and itemized billing ledger.
              </Text>
            </View>

            {/* Success Alert */}
            {/* Created Invoice Card with Print & Share */}
            {createdInvoice && (
              <View style={styles.createdInvoiceCard}>
                <View style={styles.createdInvoiceHeader}>
                  <Ionicons name="checkmark-circle" size={24} color={Colors.successDark} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.createdInvoiceTitle}>Invoice Generated Successfully!</Text>
                    <Text style={styles.createdInvoiceSubtitle}>
                      {createdInvoice.invoiceNumber} · {formatCurrency(createdInvoice.total)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.createdInvoiceNote}>
                  Official GST tax invoice has been registered. The client was notified via portal alert and email.
                </Text>
                <View style={styles.createdInvoiceActions}>
                  <TouchableOpacity
                    style={styles.printActionBtn}
                    onPress={() => setShowInvoiceModal(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="print-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.printActionBtnText}>Print & Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.allInvoicesBtn}
                    onPress={() => router.replace('/(admin)/invoices')}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="receipt-long" size={16} color={Colors.primaryLight} />
                    <Text style={styles.allInvoicesBtnText}>All Invoices</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.newInvoiceBtn}
                    onPress={() => {
                      setCreatedInvoice(null);
                      setSuccessMessage(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add-circle-outline" size={16} color="#64748B" />
                    <Text style={styles.newInvoiceBtnText}>+ New</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Error Alert */}
            {errorMessage && (
              <View style={styles.errorAlert}>
                <MaterialIcons name="error-outline" size={18} color={Colors.danger} />
                <Text style={styles.errorAlertText}>{errorMessage}</Text>
              </View>
            )}

            <View style={styles.hairlineRule} />

            {/* Client Selection Card */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Bill To Client *</Text>
              <TouchableOpacity
                style={styles.clientSelectCard}
                onPress={() => setShowClientModal(true)}
                activeOpacity={0.8}
              >
                <View style={styles.clientSelectLeft}>
                  <View style={styles.clientAvatarBox}>
                    <Text style={styles.clientAvatarText}>
                      {selectedClient ? selectedClient.firstName[0] : '?'}
                    </Text>
                  </View>
                  <View style={styles.clientInfoText}>
                    <Text style={styles.clientName}>
                      {selectedClient
                        ? `${selectedClient.firstName} ${selectedClient.lastName}`
                        : 'Select client account...'}
                    </Text>
                    <Text style={styles.clientSub}>
                      {selectedClient?.clientProfile?.firmName
                        ? `${selectedClient.clientProfile.firmName} · Code: ${selectedClient.clientProfile.clientCode || 'CAC'}`
                        : 'Tap to choose client from practice roster'}
                    </Text>
                  </View>
                </View>
                <View style={styles.changePill}>
                  <Text style={styles.changePillText}>Change</Text>
                  <MaterialIcons name="chevron-right" size={16} color={Colors.primaryLight} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Date & Tax Configuration */}
            <View style={styles.row}>
              <View style={styles.half}>
                <AppInput
                  label="Due Date (YYYY-MM-DD) *"
                  placeholder="2026-04-15"
                  value={dueDate}
                  onChangeText={(val) => {
                    setDueDate(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                />
                <View style={styles.presetDateRow}>
                  <TouchableOpacity
                    style={styles.presetDateBtn}
                    onPress={() => setPresetDueDate(15)}
                  >
                    <Text style={styles.presetDateBtnText}>+15 Days</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.presetDateBtn}
                    onPress={() => setPresetDueDate(30)}
                  >
                    <Text style={styles.presetDateBtnText}>+30 Days</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.half}>
                <Text style={styles.miniLabel}>GST Tax Rate (%) *</Text>
                <View style={styles.taxRatePillsRow}>
                  {[18, 12, 5, 0].map((rate) => (
                    <TouchableOpacity
                      key={rate}
                      style={[
                        styles.taxRatePill,
                        taxRate === rate && styles.taxRatePillActive,
                      ]}
                      onPress={() => setTaxRate(rate)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.taxRatePillText,
                          taxRate === rate && styles.taxRatePillTextActive,
                        ]}
                      >
                        {rate}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.taxRateHint}>
                  {taxRate === 18
                    ? '18% Standard CA Professional Services'
                    : `${taxRate}% Applicable GST`}
                </Text>
              </View>
            </View>

            <View style={styles.hairlineRule} />

            {/* Line Items Section */}
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionHeading}>Particulars & Line Items</Text>
                <Text style={styles.sectionSub}>Itemized billable services</Text>
              </View>
              <TouchableOpacity
                style={styles.addItemBtn}
                onPress={handleAddItem}
                activeOpacity={0.8}
              >
                <MaterialIcons name="add" size={16} color={Colors.primaryLight} />
                <Text style={styles.addItemBtnText}>Add Line</Text>
              </TouchableOpacity>
            </View>

            {items.map((item, index) => {
              const qty = Math.max(0, parseInt(item.quantityStr, 10) || 0);
              const price = Math.max(0, parseFloat(item.unitPriceStr) || 0);
              const lineTotal = qty * price;

              return (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemCardHeader}>
                    <View style={styles.itemBadge}>
                      <Text style={styles.itemBadgeText}>ITEM #{index + 1}</Text>
                    </View>
                    <View style={styles.itemHeaderRight}>
                      <Text style={styles.lineTotalMono}>{formatCurrency(lineTotal)}</Text>
                      {items.length > 1 && (
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => handleRemoveItem(item.id)}
                          activeOpacity={0.7}
                        >
                          <MaterialIcons name="delete-outline" size={18} color={Colors.danger} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <AppInput
                    label="Service Description *"
                    placeholder="e.g. Statutory Audit, GST Reconciliation, ITR Filing"
                    value={item.description}
                    onChangeText={(val) => handleUpdateItem(item.id, 'description', val)}
                  />

                  <View style={styles.row}>
                    <View style={styles.half}>
                      <AppInput
                        label="Quantity / Units *"
                        placeholder="1"
                        keyboardType="numeric"
                        value={item.quantityStr}
                        onChangeText={(val) => handleUpdateItem(item.id, 'quantityStr', val)}
                      />
                    </View>
                    <View style={styles.half}>
                      <AppInput
                        label="Unit Rate (₹ INR) *"
                        placeholder="5000"
                        keyboardType="numeric"
                        value={item.unitPriceStr}
                        onChangeText={(val) => handleUpdateItem(item.id, 'unitPriceStr', val)}
                      />
                    </View>
                  </View>
                </View>
              );
            })}

            <View style={styles.hairlineRule} />

            {/* Financial Ledger Breakdown */}
            <View style={styles.ledgerCard}>
              <Text style={styles.ledgerCardTitle}>Official Financial Breakdown</Text>

              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLabel}>Subtotal (Taxable Value)</Text>
                <Text style={styles.ledgerValMono}>{formatCurrency(subtotal)}</Text>
              </View>

              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLabel}>CGST ({taxRate / 2}%)</Text>
                <Text style={styles.ledgerValMono}>{formatCurrency(cgst)}</Text>
              </View>

              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLabel}>SGST ({taxRate / 2}%)</Text>
                <Text style={styles.ledgerValMono}>{formatCurrency(sgst)}</Text>
              </View>

              <View style={styles.ledgerDivider} />

              <View style={styles.totalRow}>
                <View>
                  <Text style={styles.totalLabel}>TOTAL INVOICE PAYABLE</Text>
                  <Text style={styles.totalSub}>Inclusive of all statutory taxes</Text>
                </View>
                <Text style={styles.totalValMono}>{formatCurrency(total)}</Text>
              </View>
            </View>

            {/* Payment Notes */}
            <AppInput
              label="Payment Terms & Notes (Optional)"
              placeholder="Bank details, NEFT instructions, or remarks..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
            />

            {/* Submit / Created Actions */}
            {createdInvoice ? (
              <View style={styles.createdBottomBar}>
                <AppButton
                  title={`View / Print ${createdInvoice.invoiceNumber}`}
                  onPress={() => setShowInvoiceModal(true)}
                  size="md"
                  style={{ width: '100%' }}
                />
                <View style={styles.createdSubActions}>
                  <TouchableOpacity
                    style={styles.anotherBtn}
                    onPress={handleResetForm}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add-circle-outline" size={16} color={Colors.primary} />
                    <Text style={styles.anotherBtnText}>Create Another</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => router.replace('/(admin)/invoices')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelBtnText}>Back to Invoices</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => router.replace('/(admin)/invoices')}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <AppButton
                  title={isLoading ? 'Generating Invoice...' : 'Generate Official GST Invoice'}
                  onPress={handleSubmit}
                  loading={isLoading}
                  size="md"
                  style={styles.submitBtn}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Client Picker Modal */}
      <Modal
        visible={showClientModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClientModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Client Account</Text>
                <Text style={styles.modalSubtitle}>Choose a registered practice client</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowClientModal(false)}
              >
                <MaterialIcons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {clients.map((c) => {
                const profileId = c.clientProfile?.id || c.id;
                const isSelected = selectedClientId === profileId;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                    onPress={() => {
                      if (c.clientProfile?.id) {
                        setSelectedClientId(c.clientProfile.id);
                      } else {
                        setSelectedClientId(c.id);
                      }
                      setShowClientModal(false);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.modalItemLeft}>
                      <View
                        style={[
                          styles.modalAvatarBox,
                          isSelected && styles.modalAvatarBoxSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.modalAvatarText,
                            isSelected && styles.modalAvatarTextSelected,
                          ]}
                        >
                          {c.firstName[0]}
                        </Text>
                      </View>
                      <View style={styles.modalItemText}>
                        <Text style={styles.modalClientName}>
                          {c.firstName} {c.lastName}
                        </Text>
                        <Text style={styles.modalClientFirm}>
                          {c.clientProfile?.firmName || 'Individual Client'}
                        </Text>
                        <Text style={styles.modalClientCode}>
                          ID: {c.clientProfile?.clientCode || 'CAC'} · {c.email}
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primaryLight} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <InvoiceDetailModal
        invoice={createdInvoice}
        visible={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        isAdmin={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },
  topBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primaryLight,
  },
  portalTag: {
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  portalTagText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    color: Colors.primaryLight,
    letterSpacing: 0.5,
  },
  scroll: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: Colors.backgroundCard,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  headerBlock: {
    marginBottom: Spacing.sm,
  },
  refCode: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 10,
    color: Colors.primaryLight,
    letterSpacing: 1,
    marginBottom: 4,
  },
  pageTitle: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  pageSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  createdInvoiceCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  createdInvoiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  createdInvoiceTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 15,
    color: '#166534',
  },
  createdInvoiceSubtitle: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: 13,
    color: '#15803D',
    marginTop: 2,
  },
  createdInvoiceNote: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
  },
  createdInvoiceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  printActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  printActionBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  allInvoicesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  allInvoicesBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 12,
    color: Colors.primaryLight,
  },
  newInvoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  newInvoiceBtnText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: '#475569',
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    borderWidth: 1,
    borderColor: Colors.successBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  successAlertText: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: Colors.successDark,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  errorAlertText: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: Colors.dangerDark,
  },
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  sectionBlock: {
    marginBottom: Spacing.md,
  },
  sectionHeading: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  sectionSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  clientSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.xs,
  },
  clientSelectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  clientAvatarBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientAvatarText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 14,
    color: Colors.primaryLight,
  },
  clientInfoText: {
    flex: 1,
  },
  clientName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  clientSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  changePillText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 11,
    color: Colors.primaryLight,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  half: {
    flex: 1,
  },
  presetDateRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: -Spacing.xs,
    marginBottom: Spacing.xs,
  },
  presetDateBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetDateBtnText: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  miniLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs + 2,
  },
  taxRatePillsRow: {
    flexDirection: 'row',
    gap: 6,
    height: 48,
    alignItems: 'center',
  },
  taxRatePill: {
    flex: 1,
    height: 46,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  taxRatePillActive: {
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.primarySoft,
  },
  taxRatePillText: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  taxRatePillTextActive: {
    color: Colors.primaryLight,
  },
  taxRateHint: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addItemBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 11,
    color: Colors.primaryLight,
  },
  itemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  itemCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  itemBadgeText: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: 9,
    color: Colors.primaryLight,
    letterSpacing: 0.5,
  },
  itemHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  lineTotalMono: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  deleteBtn: {
    padding: 4,
  },
  ledgerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: 6,
  },
  ledgerCardTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ledgerLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  ledgerValMono: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  ledgerDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  totalLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  totalSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 10,
    color: Colors.textTertiary,
  },
  totalValMono: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: 18,
    color: Colors.primaryLight,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundCard,
  },
  cancelBtnText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  submitBtn: {
    flex: 2,
    marginVertical: 0,
  },
  createdBottomBar: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  createdSubActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  anotherBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.backgroundCard,
  },
  anotherBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },

  // Client Selection Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '80%',
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.md,
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalList: {
    marginTop: Spacing.md,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    backgroundColor: '#F8FAFC',
  },
  modalItemSelected: {
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.primarySoft,
  },
  modalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  modalAvatarBox: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarBoxSelected: {
    backgroundColor: Colors.primaryLight,
  },
  modalAvatarText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  modalAvatarTextSelected: {
    color: '#FFFFFF',
  },
  modalItemText: {
    flex: 1,
  },
  modalClientName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  modalClientFirm: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.primaryLight,
    marginTop: 1,
  },
  modalClientCode: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { invoiceService } from '../../services/invoiceService';
import { clientService } from '../../services/clientService';
import { User } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function AdminCreateInvoiceScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<User[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [taxRate, setTaxRate] = useState<number>(18);
  const [notes, setNotes] = useState<string>('');
  const [showPicker, setShowPicker] = useState(false);
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Professional Accounting Services', quantity: 1, unitPrice: 5000 }
  ]);

  const { clientId } = useLocalSearchParams<{ clientId: string }>();
  
  useEffect(() => {
    clientService.getClients()
      .then((res) => {
        if (res.data) {
          setClients(res.data);
          if (clientId) {
            setSelectedClientId(clientId);
          } else if (res.data.length > 0) {
            setSelectedClientId(res.data[0].clientProfile?.id || '');
          }
        }
      })
      .catch((err) => console.error('Failed to load clients:', err));

    const future = new Date();
    future.setDate(future.getDate() + 15);
    setDueDate(future.toISOString().split('T')[0]);
  }, []);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Math.random().toString(), description: '', quantity: 1, unitPrice: 0 }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const cgst = subtotal * (taxRate / 2) / 100;
  const sgst = cgst;
  const total = subtotal + cgst + sgst;

  const handleSubmit = async () => {
    if (!selectedClientId) {
      Alert.alert('Validation Error', 'Please select a client account.');
      return;
    }
    const emptyItems = items.filter(i => !i.description.trim() || i.unitPrice <= 0);
    if (emptyItems.length > 0) {
      Alert.alert('Validation Error', 'Please ensure all line items have descriptions and prices.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        clientProfileId: selectedClientId,
        dueDate,
        taxRate,
        notes,
        items: items.map(i => ({
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        }))
      };

      const res = await invoiceService.createInvoice(payload);
      if (res.data) {
        Alert.alert('Success', 'Official GST invoice generated.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to generate invoice.';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedClient = clients.find(c => c.clientProfile?.id === selectedClientId);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={18} color={Colors.primary} />
            <Text style={styles.backText}>All Invoices</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerBlock}>
              <Text style={styles.refCode}>LEDGER DISPATCH</Text>
              <Text style={styles.pageTitle}>New GST Tax Invoice</Text>
              <Text style={styles.pageSubtitle}>
                Generate a statutory tax invoice with CGST, SGST, and auto-computed totals.
              </Text>
            </View>

            <View style={styles.hairlineRule} />

            {/* Client Picker */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Bill To Client *</Text>
              <TouchableOpacity
                style={styles.pickerTrigger}
                onPress={() => setShowPicker(!showPicker)}
                activeOpacity={0.7}
              >
                <Text style={styles.pickerText}>
                  {selectedClient
                    ? `${selectedClient.firstName} ${selectedClient.lastName} · ${selectedClient.clientProfile?.firmName || 'Individual'}`
                    : 'Select a client...'}
                </Text>
                <MaterialIcons name={showPicker ? 'arrow-drop-up' : 'arrow-drop-down'} size={20} color={Colors.primary} />
              </TouchableOpacity>

              {showPicker && (
                <View style={styles.dropdownList}>
                  {clients.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.dropdownRow,
                        selectedClientId === c.clientProfile?.id && styles.dropdownRowSelected,
                      ]}
                      onPress={() => {
                        setSelectedClientId(c.clientProfile?.id || '');
                        setShowPicker(false);
                      }}
                    >
                      <Text style={styles.dropdownName}>{c.firstName} {c.lastName}</Text>
                      <Text style={styles.dropdownFirm}>{c.clientProfile?.firmName || 'Individual'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Date & Tax inputs (Underline style) */}
            <View style={styles.row}>
              <View style={styles.half}>
                <AppInput
                  label="Due Date (YYYY-MM-DD) *"
                  placeholder="2026-04-15"
                  value={dueDate}
                  onChangeText={setDueDate}
                />
              </View>
              <View style={styles.half}>
                <AppInput
                  label="GST Tax Rate (%) *"
                  placeholder="18"
                  keyboardType="numeric"
                  value={String(taxRate)}
                  onChangeText={(val) => setTaxRate(Number(val) || 0)}
                />
              </View>
            </View>

            <View style={styles.hairlineRule} />

            {/* Line Items: Single Column Forms */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Particulars / Line Items</Text>
              <TouchableOpacity onPress={handleAddItem}>
                <Text style={styles.addLink}>+ Add Item</Text>
              </TouchableOpacity>
            </View>

            {items.map((item, index) => (
              <View key={item.id} style={styles.lineItemBlock}>
                <View style={styles.lineItemTop}>
                  <Text style={styles.itemIndex}>ITEM {index + 1}</Text>
                  {items.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                      <Text style={styles.removeLink}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <AppInput
                  label="Particulars / Description"
                  placeholder="Audit & Assurance Services"
                  value={item.description}
                  onChangeText={(val) => handleUpdateItem(item.id, 'description', val)}
                />

                <View style={styles.row}>
                  <View style={styles.half}>
                    <AppInput
                      label="Quantity / Units"
                      placeholder="1"
                      keyboardType="numeric"
                      value={String(item.quantity)}
                      onChangeText={(val) => handleUpdateItem(item.id, 'quantity', Number(val) || 1)}
                    />
                  </View>
                  <View style={styles.half}>
                    <AppInput
                      label="Unit Rate (INR)"
                      placeholder="5000"
                      keyboardType="numeric"
                      value={String(item.unitPrice)}
                      onChangeText={(val) => handleUpdateItem(item.id, 'unitPrice', Number(val) || 0)}
                    />
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.hairlineRule} />

            {/* Ledger Table Breakdown (Actual paper invoice ledger) */}
            <View style={styles.ledgerTableBlock}>
              <Text style={styles.sectionHeading}>Financial Breakdown</Text>
              
              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLabel}>Subtotal</Text>
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

              <View style={[styles.hairlineRule, { marginVertical: Spacing.sm }]} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL INVOICE AMOUNT</Text>
                <Text style={styles.totalValMono}>{formatCurrency(total)}</Text>
              </View>
            </View>

            <AppInput
              label="Payment Instructions & Terms (Optional)"
              placeholder="Payment due within 15 days via NEFT / RTGS..."
              value={notes}
              onChangeText={setNotes}
            />

            <AppButton
              title={isLoading ? 'Generating Record...' : 'Generate Official GST Invoice'}
              onPress={handleSubmit}
              loading={isLoading}
              size="md"
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  topBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  scroll: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 540,
  },
  headerBlock: {
    marginBottom: Spacing.md,
  },
  refCode: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  pageTitle: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: Typography.size.xl,
    color: Colors.primary,
  },
  pageSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.hairline,
    marginVertical: Spacing.lg,
  },
  formGroup: {
    marginBottom: Spacing.base,
  },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
  },
  pickerText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.primary,
  },
  dropdownList: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: 4,
    marginTop: 4,
    maxHeight: 180,
  },
  dropdownRow: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  dropdownRowSelected: {
    backgroundColor: 'rgba(184, 134, 58, 0.08)',
  },
  dropdownName: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  dropdownFirm: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  half: {
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionHeading: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  addLink: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: Typography.size.xs,
    color: Colors.secondaryDark,
  },
  lineItemBlock: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
    marginBottom: Spacing.md,
  },
  lineItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  itemIndex: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
  removeLink: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.danger,
  },
  ledgerTableBlock: {
    padding: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: 4,
    marginBottom: Spacing.lg,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  ledgerLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  ledgerValMono: {
    fontFamily: Typography.fontFamily.monoMedium,
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
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 11,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  totalValMono: {
    fontFamily: Typography.fontFamily.monoBold, // Hero amount
    fontSize: Typography.size.lg,
    color: Colors.primary,
  },
  submitBtn: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
});

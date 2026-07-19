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
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
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
  
  // Invoice items state
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0 }
  ]);

  const { clientId } = useLocalSearchParams<{ clientId: string }>();
  
  // Load clients list on mount
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

    // Default due date to 15 days from today
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

  // Math calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const cgst = subtotal * (taxRate / 2) / 100;
  const sgst = cgst;
  const total = subtotal + cgst + sgst;

  const handleSubmit = async () => {
    if (!selectedClientId) {
      Alert.alert('Validation Error', 'Please select a client.');
      return;
    }
    const emptyItems = items.filter(i => !i.description.trim() || i.unitPrice <= 0);
    if (emptyItems.length > 0) {
      Alert.alert('Validation Error', 'Please make sure all items have descriptions and valid prices.');
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
        Alert.alert('Success', 'GST Invoice generated successfully.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create invoice.';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={20} color={Colors.textPrimary} />
            <Text style={styles.backText}>Back to Invoices</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.brandName}>Generate GST Invoice</Text>
            <Text style={styles.brandTagline}>Compute tax rates, CGST/SGST, and output professional PDFs</Text>
          </View>

          {/* Form */}
          <AppCard style={styles.card}>
            <Text style={styles.sectionTitle}>Invoice Setup</Text>

            {/* Client Picker */}
            <View style={styles.pickerField}>
              <Text style={styles.fieldLabel}>Select Client</Text>
              {clients.length === 0 ? (
                <View style={styles.pickerWrapper}>
                  <Text style={styles.pickerEmpty}>No active client profiles</Text>
                </View>
              ) : (
                <View style={{ zIndex: 1000, position: 'relative' }}>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => setShowPicker(!showPicker)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.selectButtonText}>
                      {clients.find(c => c.clientProfile?.id === selectedClientId)
                        ? `${clients.find(c => c.clientProfile?.id === selectedClientId)?.firstName} ${clients.find(c => c.clientProfile?.id === selectedClientId)?.lastName} (${clients.find(c => c.clientProfile?.id === selectedClientId)?.clientProfile?.firmName || 'No Firm'})`
                        : 'Choose a client...'}
                    </Text>
                    <MaterialIcons
                      name={showPicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {showPicker && (
                    <View style={styles.dropdownContainer}>
                      <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                        {clients.map((c) => (
                          <TouchableOpacity
                            key={c.id}
                            style={[
                              styles.dropdownItem,
                              selectedClientId === c.clientProfile?.id && styles.dropdownItemSelected
                            ]}
                            onPress={() => {
                              setSelectedClientId(c.clientProfile?.id || '');
                              setShowPicker(false);
                            }}
                          >
                            <Text style={[
                              styles.dropdownItemText,
                              selectedClientId === c.clientProfile?.id && styles.dropdownItemTextSelected
                            ]}>
                              {c.firstName} {c.lastName} ({c.clientProfile?.firmName || 'No Firm'})
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}
            </View>

            <AppInput
              label="Due Date"
              placeholder="YYYY-MM-DD"
              value={dueDate}
              onChangeText={setDueDate}
            />

            <AppInput
              label="Tax Rate (%)"
              placeholder="18"
              keyboardType="numeric"
              value={String(taxRate)}
              onChangeText={(val) => setTaxRate(Number(val) || 0)}
            />

            <Text style={[styles.sectionTitle, { marginTop: Spacing.base }]}>Line Items</Text>

            {/* Line Items Builder */}
            {items.map((item, index) => (
              <View key={item.id} style={styles.itemRowCard}>
                <View style={styles.itemRowHeader}>
                  <Text style={styles.itemIndex}>Item #{index + 1}</Text>
                  {items.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                      <MaterialIcons name="delete-forever" size={20} color={Colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
                
                <AppInput
                  label="Description"
                  placeholder="GST Compliance Filing Fee"
                  value={item.description}
                  onChangeText={(val) => handleUpdateItem(item.id, 'description', val)}
                />

                <View style={styles.row}>
                  <View style={styles.half}>
                    <AppInput
                      label="Quantity"
                      placeholder="1"
                      keyboardType="numeric"
                      value={String(item.quantity)}
                      onChangeText={(val) => handleUpdateItem(item.id, 'quantity', Number(val) || 1)}
                    />
                  </View>
                  <View style={styles.half}>
                    <AppInput
                      label="Unit Price (INR)"
                      placeholder="5000"
                      keyboardType="numeric"
                      value={String(item.unitPrice)}
                      onChangeText={(val) => handleUpdateItem(item.id, 'unitPrice', Number(val) || 0)}
                    />
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.addItemBtn} onPress={handleAddItem}>
              <MaterialIcons name="add-circle-outline" size={18} color={Colors.secondary} />
              <Text style={styles.addItemText}>Add Line Item</Text>
            </TouchableOpacity>

            <AppInput
              label="Notes (Optional)"
              placeholder="Thank you for your business!"
              value={notes}
              onChangeText={setNotes}
            />

            {/* Financial Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.sumRow}>
                <Text style={styles.sumLabel}>Subtotal</Text>
                <Text style={styles.sumValue}>{formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.sumRow}>
                <Text style={styles.sumLabel}>CGST ({taxRate / 2}%)</Text>
                <Text style={styles.sumValue}>{formatCurrency(cgst)}</Text>
              </View>
              <View style={styles.sumRow}>
                <Text style={styles.sumLabel}>SGST ({taxRate / 2}%)</Text>
                <Text style={styles.sumValue}>{formatCurrency(sgst)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.sumRow}>
                <Text style={styles.grandLabel}>Total (INR)</Text>
                <Text style={styles.grandValue}>{formatCurrency(total)}</Text>
              </View>
            </View>

            <AppButton
              title={isLoading ? 'Generating Invoice...' : 'Generate & Issue Invoice'}
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.submitBtn}
            />
          </AppCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  topBar: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  scroll: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.base,
  },
  brandName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 22,
    color: Colors.primary,
  },
  brandTagline: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.sm,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  pickerField: {
    marginBottom: Spacing.sm,
  },
  fieldLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  pickerWrapper: {
    backgroundColor: Colors.backgroundInput,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    height: 48,
    paddingHorizontal: Spacing.sm,
  },
  selectButtonText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  dropdownContainer: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    marginTop: 4,
    maxHeight: 180,
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    zIndex: 2000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  dropdownScroll: {
    paddingVertical: 4,
  },
  dropdownItem: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.statusActive,
  },
  dropdownItemText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  dropdownItemTextSelected: {
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
  pickerEmpty: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  half: {
    flex: 1,
  },
  itemRowCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  itemRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  itemIndex: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.sm,
    color: Colors.secondaryDark,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 40,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.secondary,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  addItemText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.secondaryDark,
  },
  summaryCard: {
    backgroundColor: Colors.backgroundInput,
    borderRadius: 12,
    padding: Spacing.base,
    marginVertical: Spacing.base,
    gap: Spacing.xs,
  },
  sumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sumLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  sumValue: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  grandLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.primary,
  },
  grandValue: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.secondaryDark,
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
});

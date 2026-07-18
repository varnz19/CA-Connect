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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { documentService } from '../../services/documentService';
import { clientService } from '../../services/clientService';
import { User } from '../../types';

export default function AdminRequestDocumentScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<User[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [docName, setDocName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');

  // Fetch active client list on mount
  useEffect(() => {
    clientService.getClients()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setClients(res.data);
          setSelectedClientId(res.data[0].clientProfile?.id || '');
        }
      })
      .catch((err) => console.error('Failed to fetch clients:', err));

    // Default due date to 7 days from now
    const future = new Date();
    future.setDate(future.getDate() + 7);
    setDueDate(future.toISOString().split('T')[0]);
  }, []);

  const handleSubmit = async () => {
    if (!selectedClientId) {
      Alert.alert('Validation Error', 'Please select a client to request document from.');
      return;
    }
    if (!docName.trim()) {
      Alert.alert('Validation Error', 'Please enter a document name or title.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        clientProfileId: selectedClientId,
        name: docName,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      };

      const res = await documentService.createDocumentRequest(payload);
      if (res.data) {
        Alert.alert('Success', 'Document requested successfully.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to request document.';
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
            <Text style={styles.backText}>Back to Documents</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.brandName}>Request Document</Text>
            <Text style={styles.brandTagline}>Request GST invoices, audit sheets, or PAN cards from clients</Text>
          </View>

          {/* Form */}
          <AppCard style={styles.card}>
            <Text style={styles.sectionTitle}>Request Details</Text>

            {/* Client Selector */}
            <View style={styles.pickerField}>
              <Text style={styles.fieldLabel}>Select Client</Text>
              <View style={styles.pickerWrapper}>
                {clients.length === 0 ? (
                  <Text style={styles.pickerEmpty}>No active client profiles</Text>
                ) : (
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    style={styles.htmlSelect}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.clientProfile?.id}>
                        {c.firstName} {c.lastName} ({c.clientProfile?.firmName || 'No Firm'})
                      </option>
                    ))}
                  </select>
                )}
              </View>
            </View>

            <AppInput
              label="Document Name / Title"
              placeholder="e.g. GST Purchase Invoices Q1"
              value={docName}
              onChangeText={setDocName}
            />

            <AppInput
              label="Description / Instructions"
              placeholder="Please upload PDF scans of all purchase receipts for Q1 compliance."
              value={description}
              onChangeText={setDescription}
            />

            <AppInput
              label="Due Date"
              placeholder="YYYY-MM-DD"
              value={dueDate}
              onChangeText={setDueDate}
            />

            <AppButton
              title={isLoading ? 'Submitting Request...' : 'Send Document Request'}
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
  htmlSelect: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
    backgroundColor: 'transparent',
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    outlineStyle: 'none',
  } as any,
  pickerEmpty: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
  },
  submitBtn: {
    marginTop: Spacing.base,
  },
});

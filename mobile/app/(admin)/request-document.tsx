import React, { useState, useEffect, useRef } from 'react';
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
import { useQueryClient } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { documentService } from '../../services/documentService';
import { clientService } from '../../services/clientService';
import { User } from '../../types';

export default function AdminRequestDocumentScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isSubmitting = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<User[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [docName, setDocName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [showPicker, setShowPicker] = useState(false);

  const { clientId } = useLocalSearchParams<{ clientId: string }>();

  useEffect(() => {
    clientService.getClients()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setClients(res.data);
          if (clientId) {
            setSelectedClientId(clientId);
          } else {
            setSelectedClientId(res.data[0].clientProfile?.id || '');
          }
        }
      })
      .catch((err) => console.error('Failed to fetch clients:', err));

    const future = new Date();
    future.setDate(future.getDate() + 7);
    setDueDate(future.toISOString().split('T')[0]);
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting.current || isLoading) return;

    if (!selectedClientId) {
      Alert.alert('Validation Error', 'Please select a client to request document from.');
      return;
    }
    if (!docName.trim()) {
      Alert.alert('Validation Error', 'Please enter a document name or title.');
      return;
    }

    isSubmitting.current = true;
    setIsLoading(true);
    try {
      const payload = {
        clientProfileId: selectedClientId,
        name: docName.trim(),
        description: description.trim() || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      };

      const res = await documentService.createDocumentRequest(payload);
      if (res.data) {
        queryClient.invalidateQueries({ queryKey: ['documents'] });
        Alert.alert('Success', 'Compliance document request dispatched to client.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to request document.';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
      isSubmitting.current = false;
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
            <Text style={styles.backText}>All Documents</Text>
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
              <Text style={styles.refCode}>COMPLIANCE DISPATCH</Text>
              <Text style={styles.pageTitle}>Request Client Document</Text>
              <Text style={styles.pageSubtitle}>
                Request bank statements, Form 16, audit ledgers, or purchase bills from a client.
              </Text>
            </View>

            <View style={styles.hairlineRule} />

            {/* Flat Form */}
            <View style={styles.form}>
              {/* Client Picker */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Target Client *</Text>
                <TouchableOpacity
                  style={styles.pickerTrigger}
                  onPress={() => setShowPicker(!showPicker)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pickerText}>
                    {selectedClient
                      ? `${selectedClient.firstName} ${selectedClient.lastName} · ${selectedClient.clientProfile?.firmName || 'Individual'}`
                      : 'Select client...'}
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

              <AppInput
                label="Required Document Name *"
                placeholder="e.g. Bank Statements (Apr 2025 – Mar 2026)"
                value={docName}
                onChangeText={setDocName}
              />

              <AppInput
                label="Compliance Guidelines & Instructions (Optional)"
                placeholder="Please upload in password-free PDF or Excel format..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              <AppInput
                label="Submission Deadline Date (YYYY-MM-DD)"
                placeholder="2026-04-10"
                value={dueDate}
                onChangeText={setDueDate}
              />

              <AppButton
                title={isLoading ? 'Issuing Request...' : 'Dispatch Document Request'}
                onPress={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
                size="md"
                style={styles.submitBtn}
              />
            </View>
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
    maxWidth: 520,
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
  form: {
    gap: Spacing.md,
  },
  formGroup: {
    marginBottom: Spacing.sm,
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
  submitBtn: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});

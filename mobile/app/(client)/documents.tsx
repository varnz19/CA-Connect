import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { documentService } from '../../services/documentService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppCard } from '../../components/common/AppCard';
import { AppBadge } from '../../components/common/AppBadge';
import { AppButton } from '../../components/common/AppButton';
import { AppEmpty } from '../../components/common/AppStates';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useDocuments } from '../../hooks/useQueries';
import { DocumentRequest } from '../../types';
import { formatDate, formatFileSize } from '../../utils/formatters';
import * as DocumentPicker from 'expo-document-picker';

export default function ClientDocumentsScreen() {
  const { user } = useAuthStore();
  const clientId = user?.clientProfile?.id || 'cp-001';
  const { data: documentsData, refetch } = useDocuments();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const documentsList = documentsData?.data || [];
  const myDocs = documentsList; // Backend already filters for user
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const resolveDocUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('localhost:') || url.includes('127.0.0.1:')) {
      const apiBaseUrl = api.defaults.baseURL || '';
      try {
        const parsedApi = new URL(apiBaseUrl);
        const parsedDoc = new URL(url);
        parsedDoc.host = parsedApi.host;
        parsedDoc.protocol = parsedApi.protocol;
        return parsedDoc.toString();
      } catch (e) {
        const serverHost = apiBaseUrl.replace('/api', '');
        return url.replace('http://localhost:3000', serverHost);
      }
    }
    return url;
  };

  const handleUpload = async (requestId: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/vnd.ms-excel', 'application/zip'],
        multiple: false,
      });
      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setUploadingId(requestId);
        await documentService.uploadDocument(
          requestId,
          file.uri,
          file.name,
          file.mimeType || 'application/octet-stream',
          // @ts-ignore
          file.file
        );
        Alert.alert('Success', 'Document uploaded successfully.');
        await refetch();
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploadingId(null);
    }
  };

  const renderRequest = ({ item }: { item: DocumentRequest }) => {
    const canUpload = item.status === 'REQUESTED' || item.status === 'REJECTED';

    return (
      <AppCard style={styles.card}>
        {/* Request Header */}
        <View style={styles.cardHeader}>
          <View style={styles.docIcon}>
            <MaterialIcons name="folder-open" size={20} color={Colors.secondary} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.docName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.docDesc} numberOfLines={2}>{item.description}</Text>
            )}
          </View>
          <AppBadge status={item.status} />
        </View>

        {/* Admin Comment */}
        {item.adminComment && (
          <View style={styles.commentBox}>
            <MaterialIcons name="comment" size={12} color={Colors.statusPendingText} />
            <Text style={styles.commentText}>{item.adminComment}</Text>
          </View>
        )}

        {/* Uploaded Documents */}
        {item.documents.length > 0 && (
          <View style={styles.uploadedList}>
            <Text style={styles.uploadedLabel}>Uploaded Files</Text>
            {item.documents.map((doc) => (
              <View key={doc.id} style={styles.fileRow}>
                <MaterialIcons name="insert-drive-file" size={16} color={Colors.secondary} />
                <Text style={styles.fileName} numberOfLines={1}>{doc.fileName}</Text>
                <Text style={styles.fileSize}>{formatFileSize(doc.fileSize)}</Text>
                <TouchableOpacity onPress={() => Linking.openURL(resolveDocUrl(doc.fileUrl))}>
                  <MaterialIcons name="cloud-download" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.cardFooter}>
          {item.dueDate && (
            <View style={styles.dueDateRow}>
              <MaterialIcons name="schedule" size={12} color={Colors.textTertiary} />
              <Text style={styles.dueDate}>Due: {formatDate(item.dueDate)}</Text>
            </View>
          )}
          {canUpload && (
            <AppButton
              title={uploadingId === item.id ? 'Uploading...' : 'Upload Document'}
              variant="primary"
              size="sm"
              loading={uploadingId === item.id}
              onPress={() => handleUpload(item.id)}
              style={styles.uploadBtn}
            />
          )}
        </View>
      </AppCard>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={myDocs}
        keyExtractor={(item) => item.id}
        renderItem={renderRequest}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Documents</Text>
            <Text style={styles.subtitle}>{myDocs.length} request(s)</Text>
          </View>
        }
        ListEmptyComponent={
          <AppEmpty
            icon="folder-open"
            title="No document requests"
            description="Your CA will request documents here when needed."
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
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  docName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  docDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  commentBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    backgroundColor: Colors.warningLight,
    borderRadius: 8,
    padding: Spacing.xs,
    marginTop: Spacing.sm,
  },
  commentText: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.statusPendingText,
  },
  uploadedList: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.xs,
  },
  uploadedLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.backgroundInput,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs + 2,
  },
  fileName: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  fileSize: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  dueDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dueDate: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  uploadBtn: {},
});

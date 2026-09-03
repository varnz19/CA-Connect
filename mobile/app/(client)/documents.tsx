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
import { AppBadge } from '../../components/common/AppBadge';
import { AppButton } from '../../components/common/AppButton';
import { AppEmpty } from '../../components/common/AppStates';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useDocuments } from '../../hooks/useQueries';
import { DocumentRequest } from '../../types';
import { formatDate, formatFileSize } from '../../utils/formatters';
import * as DocumentPicker from 'expo-document-picker';

export default function ClientDocumentsScreen() {
  const { user } = useAuthStore();
  const { data: documentsData, refetch } = useDocuments();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const documentsList = documentsData?.data || [];
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
      <View style={styles.docRow}>
        <View style={styles.docTop}>
          <View style={styles.docInfo}>
            <Text style={styles.docName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.docDesc}>{item.description}</Text>
            )}
            {item.dueDate && (
              <Text style={styles.docDue}>Due: {formatDate(item.dueDate)}</Text>
            )}
          </View>
          <AppBadge status={item.status} />
        </View>

        {item.adminComment && (
          <View style={styles.commentBox}>
            <Text style={styles.commentLabel}>CA INSTRUCTION:</Text>
            <Text style={styles.commentText}>{item.adminComment}</Text>
          </View>
        )}

        {item.documents.length > 0 && (
          <View style={styles.filesList}>
            {item.documents.map((doc) => (
              <View key={doc.id} style={styles.fileItem}>
                <Text style={styles.fileName} numberOfLines={1}>{doc.fileName}</Text>
                <Text style={styles.fileSize}>{formatFileSize(doc.fileSize)}</Text>
                <TouchableOpacity onPress={() => Linking.openURL(resolveDocUrl(doc.fileUrl))}>
                  <Text style={styles.downloadLink}>Download</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {canUpload && (
          <View style={styles.uploadRow}>
            <AppButton
              title={uploadingId === item.id ? 'Uploading...' : 'Upload Required File'}
              variant="outline"
              size="sm"
              loading={uploadingId === item.id}
              onPress={() => handleUpload(item.id)}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={documentsList}
        keyExtractor={(item) => item.id}
        renderItem={renderRequest}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Document Submissions</Text>
              <Text style={styles.subtitle}>{documentsList.length} compliance requirement(s)</Text>
            </View>
            <View style={styles.hairlineRule} />
          </>
        }
        ListEmptyComponent={
          <AppEmpty
            title="No document requests"
            description="Your CA firm will publish compliance file requests here."
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: Typography.size.xl,
    color: Colors.primary,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.hairline,
  },
  list: {
    backgroundColor: Colors.backgroundCard,
  },
  docRow: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  docTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.primary,
  },
  docDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  docDue: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  commentBox: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderLeftWidth: 2,
    borderLeftColor: Colors.secondary,
  },
  commentLabel: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 9,
    color: Colors.secondaryDark,
    letterSpacing: 0.5,
  },
  commentText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.primary,
    marginTop: 2,
  },
  filesList: {
    marginTop: Spacing.sm,
    gap: 4,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: Spacing.sm,
  },
  fileName: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.primary,
  },
  fileSize: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
  },
  downloadLink: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.secondaryDark,
    textDecorationLine: 'underline',
  },
  uploadRow: {
    marginTop: Spacing.md,
    alignItems: 'flex-start',
  },
});

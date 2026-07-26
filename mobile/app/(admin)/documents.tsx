import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AppButton } from '../../components/common/AppButton';
import { DocumentCard } from '../../components/common/EntityCards';
import { AppEmpty } from '../../components/common/AppStates';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useDocuments } from '../../hooks/useQueries';
import { DocumentStatus } from '../../types';

type FilterTab = 'ALL' | DocumentStatus;

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'REQUESTED', label: 'Requested' },
  { key: 'UPLOADED', label: 'Uploaded' },
  { key: 'UNDER_REVIEW', label: 'Review' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

export default function AdminDocumentsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterTab>('ALL');

  const { data: documentsRes, refetch } = useDocuments();
  const [refreshing, setRefreshing] = useState(false);
  const documentsList = documentsRes?.data || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filtered =
    filter === 'ALL'
      ? documentsList
      : documentsList.filter((d) => d.status === filter);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Documents</Text>
                <Text style={styles.subtitle}>{documentsList.length} requests</Text>
              </View>
              <AppButton
                title="Request"
                size="sm"
                onPress={() => router.push('/(admin)/request-document' as any)}
              />
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterScroll}>
              <FlatList
                horizontal
                data={FILTERS}
                keyExtractor={(item) => item.key}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
                renderItem={({ item: f }) => (
                  <TouchableOpacity
                    style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
                    onPress={() => setFilter(f.key)}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        filter === f.key && styles.filterTabTextActive,
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <DocumentCard
              doc={item}
              showClient
              onPress={() => router.push(`/(admin)/document-detail?id=${item.id}` as any)}
            />
          </View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <AppEmpty
            icon="folder-open"
            title="No documents found"
            description="Request documents from your clients to get started."
            actionLabel="Request Document"
            onAction={() => router.push('/(admin)/request-document' as any)}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: Typography.size.xl,
    color: Colors.primary,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  filterScroll: { paddingLeft: Spacing.xl },
  filterRow: { gap: Spacing.xs, marginBottom: Spacing.md, paddingRight: Spacing.xl },
  filterTab: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterTabText: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  filterTabTextActive: { color: Colors.textLight },
  list: { paddingBottom: Spacing['3xl'] },
  cardWrapper: { paddingHorizontal: Spacing.xl },
});

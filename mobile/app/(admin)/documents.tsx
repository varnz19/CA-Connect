import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppButton } from '../../components/common/AppButton';
import { DocumentCard } from '../../components/common/EntityCards';
import { AppEmpty } from '../../components/common/AppStates';
import { Colors, Typography, Spacing } from '../../constants/theme';
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
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Document Requests</Text>
                <Text style={styles.subtitle}>{documentsList.length} total filing requirements</Text>
              </View>
              <AppButton
                title="Request Doc"
                size="sm"
                onPress={() => router.push('/(admin)/request-document' as any)}
              />
            </View>

            <View style={styles.hairlineRule} />

            {/* Flat Filter Bar */}
            <View style={styles.filterBar}>
              <FlatList
                horizontal
                data={FILTERS}
                keyExtractor={(item) => item.key}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
                renderItem={({ item: f }) => (
                  <TouchableOpacity
                    style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                    onPress={() => setFilter(f.key)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filter === f.key && styles.filterChipTextActive,
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
          <DocumentCard
            doc={item}
            showClient
            onPress={() => router.push(`/(admin)/request-document` as any)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <AppEmpty
            title="No document requests"
            description="Request compliance documents from clients to initiate review."
            actionLabel="Request Doc"
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
  filterBar: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
    backgroundColor: Colors.background,
  },
  filterRow: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundCard,
  },
  filterChipText: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  filterChipTextActive: {
    color: Colors.primary,
  },
  list: {
    backgroundColor: Colors.backgroundCard,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AppCard } from '../../components/common/AppCard';
import { AppAvatar } from '../../components/common/AppAvatar';
import { AppBadge } from '../../components/common/AppBadge';
import { AppButton } from '../../components/common/AppButton';
import { AppEmpty } from '../../components/common/AppStates';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useClients } from '../../hooks/useQueries';
import { mockClients } from '../../utils/mockData';
import { User } from '../../types';

export default function ClientsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: clientsData, isLoading, refetch } = useClients(search);

  // Fallback to mockClients to keep the UI interactive under all conditions
  const clientsList = clientsData?.data || mockClients;

  const filtered = clientsList.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.clientProfile?.firmName?.toLowerCase().includes(q) ||
      c.clientProfile?.clientCode?.toLowerCase().includes(q)
    );
  });

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDelete = (client: User) => {
    Alert.alert(
      'Delete Client',
      `Are you sure you want to delete ${client.firstName} ${client.lastName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  const renderClient = ({ item }: { item: User }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/(admin)/client-detail?id=${item.id}` as any)}
    >
      <AppCard style={styles.clientCard}>
        <View style={styles.clientRow}>
          <AppAvatar
            name={`${item.firstName} ${item.lastName}`}
            size="md"
            uri={item.avatar}
          />
          <View style={styles.clientInfo}>
            <View style={styles.clientNameRow}>
              <Text style={styles.clientName}>
                {item.firstName} {item.lastName}
              </Text>
              <AppBadge
                label={item.isActive ? 'Active' : 'Inactive'}
                variant={item.isActive ? 'success' : 'neutral'}
              />
            </View>
            {item.clientProfile?.firmName && (
              <Text style={styles.firmName}>{item.clientProfile.firmName}</Text>
            )}
            <Text style={styles.clientEmail}>{item.email}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Text style={styles.metaText}>{item.clientProfile?.clientCode}</Text>
              </View>
              {item.clientProfile?.gstin && (
                <View style={styles.metaChip}>
                  <Text style={styles.metaText}>{item.clientProfile.gstState}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={() => router.push(`/(admin)/client-detail?id=${item.id}` as any)}
          >
            <MaterialIcons name="person" size={14} color={Colors.primary} />
            <Text style={styles.actionBtnText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnSecondary]}
            onPress={() => router.push(`/(admin)/messages?clientId=${item.id}` as any)}
          >
            <MaterialIcons name="chat" size={14} color={Colors.secondary} />
            <Text style={[styles.actionBtnText, { color: Colors.secondary }]}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDanger]}
            onPress={() => handleDelete(item)}
          >
            <MaterialIcons name="delete-outline" size={14} color={Colors.danger} />
            <Text style={[styles.actionBtnText, { color: Colors.danger }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </AppCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Clients</Text>
          <Text style={styles.subtitle}>{filtered.length} total clients</Text>
        </View>
        <AppButton
          title="Add Client"
          size="sm"
          onPress={() => router.push('/(admin)/add-client' as any)}
          style={styles.addBtn}
        />
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <MaterialIcons name="search" size={18} color={Colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, firm or code..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialIcons name="close" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderClient}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <AppEmpty
            icon="people-outline"
            title="No clients found"
            description={search ? 'Try a different search term.' : 'Add your first client to get started.'}
            actionLabel={!search ? 'Add Client' : undefined}
            onAction={!search ? () => router.push('/(admin)/add-client' as any) : undefined}
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
  addBtn: {},
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 44,
    gap: Spacing.xs,
  },
  searchIcon: { marginLeft: 4 },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  list: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  clientCard: {
    marginBottom: Spacing.sm,
  },
  clientRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  clientInfo: { flex: 1 },
  clientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  clientName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  firmName: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  clientEmail: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  metaChip: {
    backgroundColor: Colors.backgroundInput,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  metaText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
  },
  actionBtnPrimary: { backgroundColor: Colors.statusActive },
  actionBtnSecondary: { backgroundColor: Colors.infoLight },
  actionBtnDanger: { backgroundColor: Colors.dangerLight },
  actionBtnText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.primary,
  },
});

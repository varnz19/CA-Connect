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
import { StatusStamp } from '../../components/common/StatusStamp';
import { AppBadge } from '../../components/common/AppBadge';
import { AppButton } from '../../components/common/AppButton';
import { AppEmpty } from '../../components/common/AppStates';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useClients } from '../../hooks/useQueries';
import { useMutation } from '@tanstack/react-query';
import { clientService } from '../../services/clientService';
import { User } from '../../types';

export default function ClientsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: clientsData, isLoading, refetch } = useClients(search);

  // Use real data and fallback to empty array
  const clientsList = clientsData?.data || [];

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

  const deleteMutation = useMutation({
    mutationFn: clientService.deleteClient,
    onSuccess: () => {
      refetch();
      Alert.alert('Success', 'Client deleted successfully.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete client.');
    }
  });

  const handleDelete = (client: User) => {
    Alert.alert(
      'Delete Client',
      `Are you sure you want to delete ${client.firstName} ${client.lastName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(client.id) },
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
              <StatusStamp
                status={item.isActive ? 'ACTIVE' : 'INACTIVE'}
                size="sm"
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
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
  addBtn: {},
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 40,
    gap: Spacing.xs,
  },
  searchIcon: { marginLeft: 4 },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  clientCard: {
    marginBottom: Spacing.md,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  clientRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  clientInfo: { flex: 1 },
  clientNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  clientName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.primary,
  },
  firmName: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  clientEmail: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  metaChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  metaText: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 10,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.xs,
  },
  actionBtnPrimary: {},
  actionBtnSecondary: {},
  actionBtnDanger: {},
  actionBtnText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
});

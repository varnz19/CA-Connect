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
import { AppBadge } from '../../components/common/AppBadge';
import { AppButton } from '../../components/common/AppButton';
import { AppAvatar } from '../../components/common/AppAvatar';
import { AppEmpty } from '../../components/common/AppStates';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useClients } from '../../hooks/useQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '../../services/clientService';
import { User } from '../../types';

export default function ClientsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const { data: clientsData, isLoading, refetch } = useClients();
  const [refreshing, setRefreshing] = useState(false);

  const clients = clientsData?.data || [];

  const filtered = clients.filter(
    (c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.clientProfile?.firmName?.toLowerCase().includes(search.toLowerCase()) ||
      c.clientProfile?.clientCode?.toLowerCase().includes(search.toLowerCase()) ||
      c.clientProfile?.panNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const deleteMutation = useMutation({
    mutationFn: clientService.deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      Alert.alert('Success', 'Client record removed.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete client.');
    },
  });

  const handleDelete = (client: User) => {
    Alert.alert(
      'Delete Client Record',
      `Are you sure you want to remove ${client.firstName} ${client.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(client.id) },
      ]
    );
  };

  const renderClient = ({ item }: { item: User }) => {
    const fullName = `${item.firstName} ${item.lastName}`;
    const profile = item.clientProfile;

    return (
      <View style={styles.clientCard}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.clientHeader}
          onPress={() => router.push(`/(admin)/client-detail?id=${item.id}` as any)}
        >
          {/* Avatar with initials or photo */}
          <AppAvatar name={fullName} size="md" uri={item.avatar} />

          {/* Profile details */}
          <View style={styles.clientInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.clientName}>{fullName}</Text>
              <AppBadge status={item.isActive ? 'ACTIVE' : 'CANCELLED'} />
            </View>

            {profile?.firmName && (
              <Text style={styles.firmName} numberOfLines={1}>{profile.firmName}</Text>
            )}

            <View style={styles.metaRow}>
              <Text style={styles.clientCode}>CODE: {profile?.clientCode || '—'}</Text>
              {profile?.panNumber && (
                <Text style={styles.panMeta}>· PAN: {profile.panNumber}</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Row Actions: Profile & Direct Chat */}
        <View style={styles.clientActionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push(`/(admin)/client-detail?id=${item.id}` as any)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="person-outline" size={14} color={Colors.primary} />
            <Text style={styles.actionBtnText}>Full Profile</Text>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push(`/(admin)/chat?clientId=${item.id}` as any)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="chat-bubble-outline" size={14} color={Colors.secondaryDark} />
            <Text style={[styles.actionBtnText, { color: Colors.secondaryDark }]}>Message</Text>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push(`/(admin)/create-invoice?clientId=${profile?.id || ''}` as any)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="receipt-long" size={14} color={Colors.primary} />
            <Text style={styles.actionBtnText}>Invoice</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Client Directory</Text>
          <Text style={styles.subtitle}>{filtered.length} active client profiles</Text>
        </View>
        <AppButton
          title="+ Add Client"
          size="sm"
          onPress={() => router.push('/(admin)/add-client' as any)}
        />
      </View>

      {/* Flat Search Bar */}
      <View style={styles.searchWrapper}>
        <MaterialIcons name="search" size={18} color={Colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by client name, firm, PAN, or code..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialIcons name="close" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Dense List with Hairline Dividers */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderClient}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading ? (
            <AppEmpty
              title="No clients found"
              description={
                search
                  ? 'No clients matching your query. Try searching by PAN or firm name.'
                  : 'Your client directory is currently empty.'
              }
              actionLabel={search ? 'Clear Search' : 'Register New Client'}
              onAction={
                search
                  ? () => setSearch('')
                  : () => router.push('/(admin)/add-client' as any)
              }
            />
          ) : null
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
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
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    padding: 0,
  },
  list: {
    backgroundColor: Colors.backgroundCard,
    paddingBottom: Spacing['3xl'],
  },
  clientCard: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  clientInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clientName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  firmName: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  clientCode: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
  },
  panMeta: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
  },
  clientActionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.hairline,
    backgroundColor: 'rgba(20, 38, 30, 0.02)',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  actionBtnText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
    color: Colors.primary,
  },
  actionDivider: {
    width: 1,
    backgroundColor: Colors.hairline,
  },
});

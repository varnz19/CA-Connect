import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AppCard } from '../../components/common/AppCard';
import { AppAvatar } from '../../components/common/AppAvatar';
import { AppEmpty } from '../../components/common/AppStates';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useConversations } from '../../hooks/useQueries';
import { Conversation } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';

export default function AdminMessagesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: conversationsData, isLoading, refetch } = useConversations();
  
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const conversationsList = conversationsData?.data || [];

  const sorted = [...conversationsList].sort(
    (a, b) =>
      new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
  );

  const renderConversation = ({ item }: { item: Conversation }) => {
    const userProfile = item.client || item.clientProfile?.user;
    if (!userProfile) return null;
    const fullName = `${userProfile.firstName} ${userProfile.lastName}`;
    const hasUnread = (item.unreadCount ?? 0) > 0;
    const firmName = item.clientProfile?.firmName;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push(`/(admin)/chat?conversationId=${item.id}&clientId=${userProfile.id}` as any)}
      >
        <View style={[styles.conversationRow, hasUnread && styles.unreadRow]}>
          <View style={styles.avatarWrapper}>
            <AppAvatar name={fullName} size="md" uri={userProfile.avatar} />
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.convInfo}>
            <View style={styles.convTop}>
              <Text style={[styles.clientName, hasUnread && styles.boldText]}>{fullName}</Text>
              {item.lastMessageAt && (
                <Text style={styles.timestamp}>{formatRelativeTime(item.lastMessageAt)}</Text>
              )}
            </View>
            {firmName && (
              <Text style={styles.firmName}>{firmName}</Text>
            )}
            {item.lastMessage && (
              <Text
                style={[styles.lastMessage, hasUnread && styles.boldText]}
                numberOfLines={1}
              >
                {item.lastMessage.senderId === 'admin-001' ? 'You: ' : ''}
                {item.lastMessage.content || '📎 Attachment'}
              </Text>
            )}
          </View>
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>{sorted.length} conversations</Text>
      </View>

      {/* Conversation List */}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <AppEmpty
            icon="chat-bubble-outline"
            title="No conversations yet"
            description="Messages from clients will appear here."
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
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
  list: {
    paddingBottom: Spacing['3xl'],
    backgroundColor: Colors.backgroundCard,
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.backgroundCard,
  },
  unreadRow: {
    backgroundColor: Colors.infoLight,
  },
  avatarWrapper: {
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
    borderWidth: 1.5,
    borderColor: Colors.backgroundCard,
  },
  convInfo: { flex: 1 },
  convTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientName: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  boldText: {
    fontFamily: Typography.fontFamily.semiBold,
  },
  firmName: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.secondary,
    marginTop: 1,
  },
  timestamp: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  lastMessage: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 10,
    color: Colors.textLight,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: Spacing.base + 44 + Spacing.sm,
  },
});

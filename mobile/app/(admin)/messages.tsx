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
import { AppAvatar } from '../../components/common/AppAvatar';
import { AppEmpty } from '../../components/common/AppStates';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useConversations } from '../../hooks/useQueries';
import { Conversation } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';

export default function AdminMessagesScreen() {
  const router = useRouter();
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
        activeOpacity={0.7}
        style={[styles.conversationRow, hasUnread && styles.unreadRow]}
        onPress={() => router.push(`/(admin)/chat?conversationId=${item.id}&clientId=${userProfile.id}` as any)}
      >
        <AppAvatar name={fullName} size="md" uri={userProfile.avatar} />
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
              {item.lastMessage.content || 'Attachment'}
            </Text>
          )}
        </View>
        {hasUnread && <View style={styles.brassDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>{sorted.length} active conversations</Text>
      </View>

      <View style={styles.hairlineRule} />

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <AppEmpty
            title="No conversations"
            description="Client message threads will appear here once communication begins."
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
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
    gap: Spacing.md,
  },
  unreadRow: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary, // Brass accent for unread
  },
  convInfo: {
    flex: 1,
  },
  convTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  clientName: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  boldText: {
    fontFamily: Typography.fontFamily.semiBold,
  },
  timestamp: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
  },
  firmName: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  lastMessage: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  brassDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
  },
});

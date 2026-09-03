import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useNotifications } from '../../hooks/useQueries';
import { useMutation } from '@tanstack/react-query';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types';
import { format, parseISO } from 'date-fns';

export default function ClientNotificationsScreen() {
  const { data: notificationsRes, refetch } = useNotifications();
  const [refreshing, setRefreshing] = React.useState(false);
  const notificationsList = notificationsRes?.data || [];
  const unreadCount = notificationsList.filter((n) => !n.readAt).length;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const markAllReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => refetch(),
  });

  const markReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => refetch(),
  });

  const renderNotification = ({ item, index }: { item: Notification; index: number }) => {
    const isUnread = !item.readAt;
    const showDayHeader =
      index === 0 ||
      format(parseISO(notificationsList[index - 1].createdAt), 'yyyy-MM-dd') !==
        format(parseISO(item.createdAt), 'yyyy-MM-dd');

    return (
      <View>
        {showDayHeader && (
          <View style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>
              {format(parseISO(item.createdAt), 'EEEE, dd MMMM yyyy').toUpperCase()}
            </Text>
            <View style={styles.dayHairline} />
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.notifRow, isUnread && styles.notifRowUnread]}
          onPress={() => !item.readAt && markReadMutation.mutate(item.id)}
        >
          {/* Small Brass dot for unread */}
          <View style={styles.dotCol}>
            {isUnread ? <View style={styles.brassDot} /> : <View style={styles.emptyDot} />}
          </View>

          <View style={styles.notifContent}>
            <Text style={[styles.notifTitle, isUnread && styles.notifTitleBold]}>{item.title}</Text>
            <Text style={styles.notifBody}>{item.body}</Text>
          </View>

          <Text style={styles.timestampMono}>
            {format(parseISO(item.createdAt), 'hh:mm a')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Practice Notices</Text>
          <Text style={styles.subtitle}>
            {notificationsList.length} notices{unreadCount > 0 ? ` · ${unreadCount} unread` : ''}
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={() => markAllReadMutation.mutate()}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.hairlineRule} />

      <FlatList
        data={notificationsList}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.list}
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
  markAllText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.secondaryDark,
    textDecorationLine: 'underline',
  },
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.hairline,
  },
  list: {
    backgroundColor: Colors.backgroundCard,
    paddingBottom: Spacing['3xl'],
  },
  dayHeader: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.background,
  },
  dayHeaderText: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
  dayHairline: {
    height: 1,
    backgroundColor: Colors.hairline,
    marginTop: Spacing.xs,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  notifRowUnread: {
    backgroundColor: Colors.backgroundCard,
  },
  dotCol: {
    width: 16,
    paddingTop: 5,
  },
  brassDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
  },
  emptyDot: {
    width: 6,
    height: 6,
  },
  notifContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  notifTitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  notifTitleBold: {
    fontFamily: Typography.fontFamily.semiBold,
  },
  notifBody: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  timestampMono: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
    paddingTop: 2,
  },
});

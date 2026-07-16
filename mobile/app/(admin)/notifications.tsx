import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppCard } from '../../components/common/AppCard';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { mockAdminNotifications } from '../../utils/mockData';
import { Notification, NotificationType } from '../../types';
import { formatDistanceFromNow } from '../../utils/formatters';

const NOTIF_ICONS: Record<NotificationType, { icon: keyof typeof MaterialIcons.glyphMap; color: string }> = {
  DOCUMENT_UPLOADED: { icon: 'cloud-upload', color: Colors.secondary },
  APPOINTMENT_BOOKED: { icon: 'event', color: Colors.success },
  APPOINTMENT_CONFIRMED: { icon: 'event-available', color: Colors.success },
  APPOINTMENT_REJECTED: { icon: 'event-busy', color: Colors.danger },
  APPOINTMENT_CANCELLED: { icon: 'cancel', color: Colors.danger },
  INVOICE_GENERATED: { icon: 'receipt', color: Colors.warning },
  INVOICE_PAID: { icon: 'check-circle', color: Colors.success },
  INVOICE_VIEWED: { icon: 'visibility', color: Colors.secondary },
  MESSAGE_RECEIVED: { icon: 'chat', color: Colors.primary },
  SERVICE_UPDATED: { icon: 'work', color: Colors.primary },
  DOCUMENT_APPROVED: { icon: 'task-alt', color: Colors.success },
  DOCUMENT_REJECTED: { icon: 'cancel', color: Colors.danger },
  PAYMENT_RECEIVED: { icon: 'payments', color: Colors.success },
};

export default function AdminNotificationsScreen() {
  const unreadCount = mockAdminNotifications.filter((n) => !n.readAt).length;

  const renderNotification = ({ item }: { item: Notification }) => {
    const config = NOTIF_ICONS[item.type] || { icon: 'notifications', color: Colors.primary };
    const isUnread = !item.readAt;

    return (
      <TouchableOpacity activeOpacity={0.8}>
        <View style={[styles.notifRow, isUnread && styles.unreadRow]}>
          {isUnread && <View style={styles.unreadIndicator} />}
          <View style={[styles.notifIcon, { backgroundColor: `${config.color}18` }]}>
            <MaterialIcons name={config.icon} size={20} color={config.color} />
          </View>
          <View style={styles.notifContent}>
            <Text style={[styles.notifTitle, isUnread && styles.boldText]}>{item.title}</Text>
            <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
            <Text style={styles.notifTime}>{formatDistanceFromNow(item.createdAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.subtitle}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={mockAdminNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    color: Colors.secondary,
  },
  markAllBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.statusActive,
  },
  markAllText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  list: { paddingBottom: Spacing['3xl'], backgroundColor: Colors.backgroundCard },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    position: 'relative',
  },
  unreadRow: {
    backgroundColor: Colors.infoLight,
  },
  unreadIndicator: {
    position: 'absolute',
    left: 6,
    top: '50%',
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifContent: { flex: 1 },
  notifTitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  boldText: { fontFamily: Typography.fontFamily.semiBold },
  notifBody: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  notifTime: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: Spacing.base + 44 + Spacing.sm,
  },
});

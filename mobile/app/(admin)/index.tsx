import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AppCard } from '../../components/common/AppCard';
import { AppAvatar } from '../../components/common/AppAvatar';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { mockAdminDashboard } from '../../utils/mockData';
import {
  useClients,
  useDocuments,
  useInvoices,
  useAppointments,
  useCalendarEvents,
  useNotifications,
} from '../../hooks/useQueries';
import { format } from 'date-fns';
import { formatRelativeTime, formatDate } from '../../utils/formatters';

interface StatCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: number | string;
  color: string;
  bg: string;
  onPress?: () => void;
}

const StatCard = ({ icon, label, value, color, bg, onPress }: StatCardProps) => (
  <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.8}>
    <AppCard style={styles.statCardInner}>
      <View style={[styles.statIconBg, { backgroundColor: bg }]}>
        <MaterialIcons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </AppCard>
  </TouchableOpacity>
);

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);
  const { data: clientsRes, refetch: refetchClients } = useClients();
  const { data: docsRes, refetch: refetchDocs } = useDocuments();
  const { data: invoicesRes, refetch: refetchInvoices } = useInvoices();
  const { data: appointmentsRes, refetch: refetchAppointments } = useAppointments();
  const { data: calendarRes, refetch: refetchCalendar } = useCalendarEvents();
  const { data: notificationsRes, refetch: refetchNotifications } = useNotifications();

  const totalClients = clientsRes?.total || clientsRes?.data?.length || 0;
  const pendingDocuments = (docsRes?.data || []).filter((d) => d.status === 'REQUESTED' || d.status === 'UPLOADED').length;
  const pendingInvoices = (invoicesRes?.data || []).filter((i) => i.status === 'PENDING').length;
  const upcomingDeadlines = (calendarRes?.data || []).filter((e: any) => e.type === 'FILING_DEADLINE').length;
  
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const formatEventDate = (dateStr: string) => {
    try { return format(new Date(dateStr), 'yyyy-MM-dd'); } catch { return dateStr; }
  };
  
  const todayAptsList = (appointmentsRes?.data || []).filter(
    (a) => formatEventDate(a.confirmedDate || a.requestedDate) === todayStr
  );
  const todayAppointments = todayAptsList.length;

  const liveActivities: any[] = [];
  (invoicesRes?.data || []).forEach((inv: any) => {
    liveActivities.push({
      id: `invoice-${inv.id}`,
      icon: 'receipt',
      color: Colors.secondary,
      action: inv.status === 'PAID' ? 'Invoice Paid' : 'Invoice Generated',
      description: `Invoice ${inv.invoiceNumber} for ${inv.client?.firmName || 'Client'}`,
      timestamp: inv.updatedAt || inv.issueDate,
    });
  });
  (docsRes?.data || []).forEach((doc: any) => {
    liveActivities.push({
      id: `doc-${doc.id}`,
      icon: doc.status === 'APPROVED' ? 'check-circle' : 'folder',
      color: doc.status === 'APPROVED' ? Colors.success : Colors.primary,
      action: doc.status === 'UPLOADED' ? 'Document Uploaded' : doc.status === 'APPROVED' ? 'Document Approved' : 'Document Requested',
      description: `${doc.name} for request`,
      timestamp: doc.updatedAt || doc.createdAt,
    });
  });
  (appointmentsRes?.data || []).forEach((apt: any) => {
    liveActivities.push({
      id: `apt-${apt.id}`,
      icon: 'event',
      color: '#8B5CF6',
      action: apt.status === 'CONFIRMED' ? 'Appointment Confirmed' : 'Appointment Requested',
      description: `Meeting: ${apt.purpose}`,
      timestamp: apt.updatedAt || apt.createdAt,
    });
  });
  const recentActivities = liveActivities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const stats = {
    totalClients,
    pendingDocuments,
    pendingInvoices,
    upcomingDeadlines,
    todayAppointments,
    recentActivities,
  };
  const unreadNotifications = (notificationsRes?.data || []).filter((n) => !n.readAt).length;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchClients(),
      refetchDocs(),
      refetchInvoices(),
      refetchAppointments(),
      refetchCalendar(),
      refetchNotifications(),
    ]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => router.push('/(admin)/notifications' as any)}
            >
              <MaterialIcons name="notifications-none" size={24} color={Colors.textPrimary} />
              {unreadNotifications > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadNotifications}</Text>
                </View>
              )}
            </TouchableOpacity>
            <AppAvatar
              name={`${user?.firstName} ${user?.lastName}`}
              size="sm"
              uri={user?.avatar}
            />
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview</Text>
        </View>
        <View style={styles.statsGrid}>
          <StatCard
            icon="people"
            label="Total Clients"
            value={stats.totalClients}
            color={Colors.primary}
            bg={Colors.statusActive}
            onPress={() => router.push('/(admin)/clients')}
          />
          <StatCard
            icon="folder-open"
            label="Pending Docs"
            value={stats.pendingDocuments}
            color={Colors.warning}
            bg={Colors.warningLight}
            onPress={() => router.push('/(admin)/documents' as any)}
          />
          <StatCard
            icon="receipt"
            label="Pending Invoices"
            value={stats.pendingInvoices}
            color={Colors.danger}
            bg={Colors.dangerLight}
            onPress={() => router.push('/(admin)/invoices')}
          />
          <StatCard
            icon="event"
            label="Upcoming Deadlines"
            value={stats.upcomingDeadlines}
            color={Colors.secondary}
            bg={Colors.infoLight}
            onPress={() => router.push('/(admin)/calendar' as any)}
          />
          <StatCard
            icon="today"
            label="Today's Appointments"
            value={stats.todayAppointments}
            color={Colors.success}
            bg={Colors.successLight}
            onPress={() => router.push('/(admin)/appointments' as any)}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionScroll}>
          {[
            { icon: 'person-add', label: 'Add Client', route: '/(admin)/clients' },
            { icon: 'post-add', label: 'New Invoice', route: '/(admin)/invoices' },
            { icon: 'assignment', label: 'Doc Request', route: '/(admin)/documents' },
            { icon: 'event-available', label: 'Appointments', route: '/(admin)/appointments' },
            { icon: 'calendar-today', label: 'Calendar', route: '/(admin)/calendar' },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionChip}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconBg}>
                <MaterialIcons name={action.icon as any} size={20} color={Colors.primary} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Upcoming Appointments */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Appointments</Text>
          <TouchableOpacity onPress={() => router.push('/(admin)/appointments' as any)}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {todayAptsList.slice(0, 3).map((apt) => (
          <TouchableOpacity
            key={apt.id}
            activeOpacity={0.8}
            onPress={() => router.push(`/(admin)/appointment-detail?id=${apt.id}` as any)}
          >
            <AppCard style={styles.aptCard}>
              <View style={styles.aptRow}>
                <View style={styles.aptTimeBadge}>
                  <Text style={styles.aptTime}>
                    {new Date(apt.confirmedDate || apt.requestedDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </Text>
                </View>
                <View style={styles.aptInfo}>
                  <Text style={styles.aptTitle}>{apt.title}</Text>
                  <Text style={styles.aptClient}>
                    {apt.clientProfile?.user ? `${apt.clientProfile.user.firstName} ${apt.clientProfile.user.lastName}` : 'Client'}
                  </Text>
                </View>
                <View style={styles.aptDuration}>
                  <MaterialIcons name="schedule" size={14} color={Colors.textTertiary} />
                  <Text style={styles.aptDurationText}>{apt.duration}m</Text>
                </View>
              </View>
            </AppCard>
          </TouchableOpacity>
        ))}
        {todayAptsList.length === 0 && (
          <AppCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>No appointments scheduled for today</Text>
          </AppCard>
        )}

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>
        <AppCard style={styles.activityCard} noPadding>
          {stats.recentActivities.map((activity: any, index: number) => (
            <View
              key={activity.id}
              style={[
                styles.activityItem,
                index < stats.recentActivities.length - 1 && styles.activityBorder,
              ]}
            >
              <View style={[styles.activityIconBg, { backgroundColor: `${activity.color}18` }]}>
                <MaterialIcons
                  name={activity.icon as any}
                  size={16}
                  color={activity.color}
                />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityAction}>{activity.action}</Text>
                <Text style={styles.activityDesc}>{activity.description}</Text>
              </View>
              <Text style={styles.activityTime}>
                {formatRelativeTime(activity.timestamp)}
              </Text>
            </View>
          ))}
        </AppCard>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  headerLeft: { flex: 1 },
  greeting: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  userName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    color: Colors.textPrimary,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  notifBtn: { position: 'relative', padding: 4 },
  notifBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 9,
    color: Colors.textLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  seeAll: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.secondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  statCard: {
    width: '47%',
  },
  statCardInner: {
    gap: Spacing.xs,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size['2xl'],
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  actionScroll: {
    paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
  },
  actionChip: {
    alignItems: 'center',
    marginRight: Spacing.sm,
    width: 72,
  },
  actionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  actionLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  aptCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  aptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  aptTimeBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.statusActive,
    borderRadius: 10,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    minWidth: 52,
  },
  aptTime: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.primary,
  },
  aptAm: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.secondary,
  },
  aptInfo: { flex: 1 },
  aptTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  aptClient: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  aptDuration: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  aptDurationText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  activityCard: {
    marginHorizontal: Spacing.base,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.base,
  },
  activityBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  activityIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: { flex: 1 },
  activityAction: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  activityDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  activityTime: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  emptyCard: {
    marginHorizontal: Spacing.base,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
  },
  bottomPad: { height: Spacing.xl },
});

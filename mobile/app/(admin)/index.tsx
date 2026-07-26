import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
  Platform,
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
    <AppCard style={styles.statCardInner} padding={Spacing.base}>
      <View style={styles.statHeaderRow}>
        <View style={[styles.statIconBg, { backgroundColor: bg }]}>
          <MaterialIcons name={icon} size={24} color={color} />
        </View>
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
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

  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

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

        {/* Desktop Layout Wrapper */}
        <View style={[styles.mainLayout, isDesktop && styles.mainLayoutDesktop]}>
          <View style={styles.mainColumn}>
            {/* Quick Actions */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            <View style={styles.actionGrid}>
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
                  <AppCard style={styles.actionIconBg} noPadding>
                    <MaterialIcons name={action.icon as any} size={24} color={Colors.primary} />
                  </AppCard>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

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
          </View>

          <View style={styles.sideColumn}>
            {/* Recent Activity */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
            </View>
            <AppCard style={styles.activityCard} noPadding>
              {stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity: any, index: number) => (
                  <View
                    key={activity.id}
                    style={[
                      styles.activityItem,
                      index < stats.recentActivities.length - 1 && styles.activityBorder,
                    ]}
                  >
                    <View style={[styles.activityIconBg, { backgroundColor: `${activity.color}15` }]}>
                      <MaterialIcons
                        name={activity.icon as any}
                        size={18}
                        color={activity.color}
                      />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityAction}>{activity.action}</Text>
                      <Text style={styles.activityDesc}>{activity.description}</Text>
                    </View>
                    <Text style={styles.activityTime}>{formatRelativeTime(activity.timestamp)}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No recent activity</Text>
                </View>
              )}
            </AppCard>
          </View>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background }, // paper
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerLeft: { flex: 1 },
  greeting: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  userName: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: Typography.size['2xl'],
    color: Colors.primary, // ink-900
    marginTop: Spacing.xs,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  notifBtn: { position: 'relative', padding: 4 },
  notifBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.secondary, // brass
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 9,
    color: Colors.background,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.xs,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  seeAll: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: Typography.size.sm,
    color: Colors.secondaryDark,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.base,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 160,
    minWidth: 140,
  },
  statCardInner: {
    height: 110,
    justifyContent: 'space-between',
    borderRadius: 4, // structural
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
    padding: Spacing.base,
  },
  statHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statContent: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontFamily: Typography.fontFamily.monoBold, // Ledger style numbers
    fontSize: Typography.size['2xl'],
    color: Colors.primary,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  mainLayout: {
    flexDirection: 'column',
    width: '100%',
  },
  mainLayoutDesktop: {
    flexDirection: 'row',
    paddingRight: Spacing.xl,
  },
  mainColumn: {
    flex: 2,
  },
  sideColumn: {
    flex: 1,
    paddingLeft: Spacing.xl,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.base,
  },
  actionChip: {
    alignItems: 'center',
    width: 72,
  },
  actionIconBg: {
    width: 56,
    height: 56,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  aptCard: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 0, // We want the time badge to touch edges
    overflow: 'hidden',
  },
  aptRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aptTimeBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.primaryLight}15`, // light ink
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    minWidth: 70,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  aptTime: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  aptAm: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  aptInfo: { flex: 1, paddingHorizontal: Spacing.base },
  aptTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  aptClient: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  aptDuration: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingRight: Spacing.base },
  aptDurationText: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  activityCard: {
    marginHorizontal: Spacing.xl,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.base,
    padding: Spacing.base,
  },
  activityBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border, // hairline
  },
  activityIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  activityInfo: { flex: 1 },
  activityAction: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  activityDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activityTime: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  emptyCard: {
    marginHorizontal: Spacing.xl,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
  },
  bottomPad: { height: Spacing.xl },
});

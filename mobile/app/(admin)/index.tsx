import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AppAvatar } from '../../components/common/AppAvatar';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing } from '../../constants/theme';
import {
  useClients,
  useDocuments,
  useInvoices,
  useAppointments,
  useCalendarEvents,
  useNotifications,
} from '../../hooks/useQueries';
import { format } from 'date-fns';

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const attentionItems = [
    {
      id: 'pending-docs',
      label: 'Pending Document Requests',
      count: pendingDocuments,
      meta: 'Awaiting client uploads or approval',
      route: '/(admin)/documents',
      alert: pendingDocuments > 0,
    },
    {
      id: 'pending-invoices',
      label: 'Unpaid GST Invoices',
      count: pendingInvoices,
      meta: 'Pending receipt & reconciliation',
      route: '/(admin)/invoices',
      alert: pendingInvoices > 0,
    },
    {
      id: 'filing-deadlines',
      label: 'Filing & Statutory Deadlines',
      count: upcomingDeadlines,
      meta: 'Upcoming GST & Income Tax calendar',
      route: '/(admin)/calendar',
      alert: upcomingDeadlines > 0,
    },
    {
      id: 'unread-notifs',
      label: 'Unread Practice Notices',
      count: unreadNotifications,
      meta: 'System notices & client submissions',
      route: '/(admin)/notifications',
      alert: unreadNotifications > 0,
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Top Header: Dynamic Greeting + Date + Profile */}
        <View style={styles.topHeader}>
          <View style={styles.topHeaderLeft}>
            <Text style={styles.greetingText}>
              {getGreeting()}, {user?.firstName || 'Admin'}
            </Text>
            <Text style={styles.dateLabel}>{format(new Date(), 'EEEE, dd MMMM yyyy')}</Text>
          </View>

          <View style={styles.topHeaderRight}>
            <TouchableOpacity
              style={styles.notifButton}
              onPress={() => router.push('/(admin)/notifications' as any)}
            >
              <MaterialIcons name="notifications-none" size={20} color={Colors.primary} />
              {unreadNotifications > 0 && <View style={styles.notifDot} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(admin)/settings' as any)}>
              <AppAvatar
                name={`${user?.firstName} ${user?.lastName}`}
                size="sm"
                uri={user?.avatar}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.hairlineRule} />

        {/* Compact Key Metrics Strip */}
        <View style={styles.statBlocksContainer}>
          <TouchableOpacity
            style={styles.statBlock}
            activeOpacity={0.7}
            onPress={() => router.push('/(admin)/clients')}
          >
            <Text style={styles.statNumber}>{totalClients}</Text>
            <Text style={styles.statLabel}>Clients</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statBlock}
            activeOpacity={0.7}
            onPress={() => router.push('/(admin)/documents' as any)}
          >
            <Text style={styles.statNumber}>{pendingDocuments}</Text>
            <Text style={styles.statLabel}>Docs Due</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statBlock}
            activeOpacity={0.7}
            onPress={() => router.push('/(admin)/invoices')}
          >
            <Text style={styles.statNumber}>{pendingInvoices}</Text>
            <Text style={styles.statLabel}>Unpaid</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statBlock}
            activeOpacity={0.7}
            onPress={() => router.push('/(admin)/appointments' as any)}
          >
            <Text style={styles.statNumber}>{todayAppointments}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hairlineRule} />

        {/* Quick Tools Row (Compact pills) */}
        <View style={styles.toolsRow}>
          {[
            { label: '+ Client', route: '/(admin)/add-client' },
            { label: '+ Invoice', route: '/(admin)/create-invoice' },
            { label: '+ Request Doc', route: '/(admin)/request-document' },
            { label: '+ Meeting', route: '/(admin)/add-appointment' },
            { label: 'Calendar', route: '/(admin)/calendar' },
          ].map((tool) => (
            <TouchableOpacity
              key={tool.label}
              style={styles.toolChip}
              onPress={() => router.push(tool.route as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.toolChipText}>{tool.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.hairlineRule} />

        {/* Compact Needs Attention List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Needs Attention</Text>
          <Text style={styles.refMeta}>TODAY</Text>
        </View>

        <View style={styles.attentionList}>
          {attentionItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.attentionRow}
              activeOpacity={0.7}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.attentionInfo}>
                <Text style={styles.attentionLabel}>{item.label}</Text>
                <Text style={styles.attentionMeta}>{item.meta}</Text>
              </View>
              <View style={styles.attentionRight}>
                <Text style={[styles.attentionCount, item.alert && styles.attentionCountAlert]}>
                  {item.count}
                </Text>
                <MaterialIcons name="chevron-right" size={16} color={Colors.textTertiary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Schedule - Clean, compact section */}
        <View style={[styles.sectionHeaderRow, { marginTop: Spacing.md }]}>
          <Text style={styles.sectionHeading}>Today's Schedule ({todayAppointments})</Text>
          <TouchableOpacity onPress={() => router.push('/(admin)/appointments' as any)}>
            <Text style={styles.seeAllLink}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.scheduleBlock}>
          {todayAptsList.length > 0 ? (
            todayAptsList.slice(0, 3).map((apt) => (
              <TouchableOpacity
                key={apt.id}
                style={styles.scheduleRow}
                onPress={() => router.push(`/(admin)/appointment-detail?id=${apt.id}` as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.scheduleTime}>
                  {format(new Date(apt.confirmedDate || apt.requestedDate), 'hh:mm a')}
                </Text>
                <View style={styles.scheduleDetails}>
                  <Text style={styles.scheduleTitle} numberOfLines={1}>{apt.title}</Text>
                  <Text style={styles.scheduleClient} numberOfLines={1}>
                    {apt.clientProfile?.user
                      ? `${apt.clientProfile.user.firstName} ${apt.clientProfile.user.lastName}`
                      : 'Client'}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No appointments scheduled today.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xl },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  topHeaderLeft: { flex: 1 },
  greetingText: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: Typography.size.lg,
    color: Colors.primary,
  },
  dateLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  topHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  notifButton: {
    padding: 6,
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
  },
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.hairline,
  },
  // Compact stat strip
  statBlocksContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    paddingVertical: Spacing.sm,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  statNumber: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.lg,
    color: Colors.primary,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.hairline,
  },
  // Compact Tools Row
  toolsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  toolChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  toolChipText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
    color: Colors.primary,
  },
  // Attention section
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  sectionHeading: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  refMeta: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 9,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
  seeAllLink: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.secondaryDark,
  },
  attentionList: {
    backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.hairline,
  },
  attentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  attentionInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  attentionLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  attentionMeta: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  attentionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  attentionCount: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  attentionCountAlert: {
    color: Colors.secondaryDark,
    fontFamily: Typography.fontFamily.monoBold,
  },
  // Schedule section
  scheduleBlock: {
    backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.hairline,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  scheduleTime: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 11,
    color: Colors.secondaryDark,
    width: 75,
  },
  scheduleDetails: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  scheduleTitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  scheduleClient: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  emptyRow: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
});

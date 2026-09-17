import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AppAvatar } from '../../components/common/AppAvatar';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
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

  const pendingAptsList = (appointmentsRes?.data || []).filter((a) => a.status === 'REQUESTED');
  const pendingAppointments = pendingAptsList.length;

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
      id: 'pending-apts',
      label: 'Consultation Requests',
      count: pendingAppointments,
      meta: 'Client advisory sessions awaiting confirmation',
      route: '/(admin)/appointments',
      alert: pendingAppointments > 0,
    },
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
            <View style={styles.headerTitleRow}>
              {!isDesktop && (
                <Image
                  source={require('../../assets/ca-logo.png')}
                  style={styles.headerLogo}
                  resizeMode="contain"
                />
              )}
              <View>
                <Text style={styles.greetingText}>
                  {getGreeting()}, {user?.firstName || 'Admin'}
                </Text>
                <Text style={styles.dateLabel}>{format(new Date(), 'EEEE, dd MMMM yyyy')}</Text>
              </View>
            </View>
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

        {/* Modern Colorful Key Metrics Strip */}
        <View style={styles.statCardsGrid}>
          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: Colors.primarySoft, borderColor: '#BFDBFE' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(admin)/clients')}
          >
            <View style={styles.metricTopRow}>
              <Text style={[styles.metricNumber, { color: Colors.primaryLight }]}>{totalClients}</Text>
              <View style={[styles.metricIconBox, { backgroundColor: '#DBEAFE' }]}>
                <MaterialIcons name="people" size={16} color={Colors.primaryLight} />
              </View>
            </View>
            <Text style={styles.metricLabel}>Total Clients</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: Colors.warningLight, borderColor: Colors.warningBorder }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(admin)/documents' as any)}
          >
            <View style={styles.metricTopRow}>
              <Text style={[styles.metricNumber, { color: Colors.warningDark }]}>{pendingDocuments}</Text>
              <View style={[styles.metricIconBox, { backgroundColor: '#FEF3C7' }]}>
                <MaterialIcons name="upload-file" size={16} color={Colors.warningDark} />
              </View>
            </View>
            <Text style={styles.metricLabel}>Docs Due</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: Colors.dangerLight, borderColor: Colors.dangerBorder }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(admin)/invoices')}
          >
            <View style={styles.metricTopRow}>
              <Text style={[styles.metricNumber, { color: Colors.dangerDark }]}>{pendingInvoices}</Text>
              <View style={[styles.metricIconBox, { backgroundColor: '#FEE2E2' }]}>
                <MaterialIcons name="receipt-long" size={16} color={Colors.dangerDark} />
              </View>
            </View>
            <Text style={styles.metricLabel}>Unpaid Invoices</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.metricCard,
              pendingAppointments > 0
                ? { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }
                : { backgroundColor: Colors.successLight, borderColor: Colors.successBorder },
            ]}
            activeOpacity={0.8}
            onPress={() => router.push('/(admin)/appointments' as any)}
          >
            <View style={styles.metricTopRow}>
              <Text
                style={[
                  styles.metricNumber,
                  { color: pendingAppointments > 0 ? Colors.warningDark : Colors.successDark },
                ]}
              >
                {pendingAppointments > 0 ? pendingAppointments : todayAppointments}
              </Text>
              <View
                style={[
                  styles.metricIconBox,
                  { backgroundColor: pendingAppointments > 0 ? '#FDE68A' : '#D1FAE5' },
                ]}
              >
                <MaterialIcons
                  name={pendingAppointments > 0 ? 'notification-important' : 'event'}
                  size={16}
                  color={pendingAppointments > 0 ? Colors.warningDark : Colors.successDark}
                />
              </View>
            </View>
            <Text style={styles.metricLabel}>
              {pendingAppointments > 0 ? 'Consult Requests' : "Today's Meetings"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Tools Row (Vibrant interactive pills) */}
        <View style={styles.toolsRow}>
          {[
            { label: '+ Client', icon: 'person-add', route: '/(admin)/add-client', color: Colors.primaryLight },
            { label: '+ Invoice', icon: 'receipt', route: '/(admin)/create-invoice', color: Colors.purple },
            { label: '+ Request Doc', icon: 'note-add', route: '/(admin)/request-document', color: Colors.warningDark },
            { label: '+ Meeting', icon: 'event-available', route: '/(admin)/add-appointment', color: Colors.successDark },
            { label: 'Calendar', icon: 'calendar-month', route: '/(admin)/calendar', color: Colors.infoDark },
          ].map((tool) => (
            <TouchableOpacity
              key={tool.label}
              style={styles.toolChip}
              onPress={() => router.push(tool.route as any)}
              activeOpacity={0.8}
            >
              <MaterialIcons name={tool.icon as any} size={15} color={tool.color} />
              <Text style={styles.toolChipText}>{tool.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Compact Needs Attention List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Needs Attention</Text>
          <Text style={styles.refMeta}>ACTIVE ALERTS</Text>
        </View>

        <View style={styles.attentionList}>
          {attentionItems.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.attentionRow, idx === attentionItems.length - 1 && { borderBottomWidth: 0 }]}
              activeOpacity={0.7}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.attentionInfo}>
                <Text style={styles.attentionLabel}>{item.label}</Text>
                <Text style={styles.attentionMeta}>{item.meta}</Text>
              </View>
              <View style={styles.attentionRight}>
                <View style={[
                  styles.attentionCountBadge,
                  item.alert ? { backgroundColor: Colors.dangerLight, borderColor: Colors.dangerBorder } : { backgroundColor: Colors.backgroundSubtle, borderColor: Colors.border }
                ]}>
                  <Text style={[styles.attentionCount, item.alert && styles.attentionCountAlert]}>
                    {item.count}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={18} color={Colors.textTertiary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Prominent Pending Consultation Requests Section */}
        {pendingAppointments > 0 && (
          <>
            <View style={[styles.sectionHeaderRow, { marginTop: Spacing.md }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.sectionHeading}>Pending Consultation Requests</Text>
                <View style={[styles.attentionCountBadge, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                  <Text style={[styles.attentionCount, { color: Colors.warningDark }]}>{pendingAppointments}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => router.push('/(admin)/appointments' as any)}>
                <Text style={styles.seeAllLink}>View all ({pendingAppointments})</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pendingAptsContainer}>
              {pendingAptsList.slice(0, 3).map((apt) => {
                const clientObj = apt.clientProfile?.user;
                const clientName = clientObj
                  ? `${clientObj.firstName} ${clientObj.lastName}`
                  : apt.clientProfile?.firmName || 'Client';

                return (
                  <TouchableOpacity
                    key={apt.id}
                    style={styles.pendingAptCard}
                    onPress={() => router.push(`/(admin)/appointment-detail?id=${apt.id}` as any)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.pendingAptLeft}>
                      <View style={styles.pendingAptHeaderRow}>
                        <Text style={styles.pendingAptClient}>{clientName}</Text>
                        <View style={styles.pendingAptBadge}>
                          <Text style={styles.pendingAptBadgeText}>Action Required</Text>
                        </View>
                      </View>
                      <Text style={styles.pendingAptTitle} numberOfLines={1}>{apt.title}</Text>
                      <Text style={styles.pendingAptTime}>
                        Requested: {format(new Date(apt.requestedDate), 'EEE, dd MMM yyyy · hh:mm a')} ({apt.duration}m)
                      </Text>
                    </View>
                    <View style={styles.pendingAptActionBtn}>
                      <Text style={styles.pendingAptActionText}>Confirm</Text>
                      <MaterialIcons name="arrow-forward" size={14} color={Colors.primaryLight} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerLogo: {
    width: 34,
    height: 34,
    borderRadius: 6,
  },
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
  // Modern Colorful Metric Cards Grid
  statCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  metricTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricNumber: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.xl,
  },
  metricIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  // Compact Tools Row
  toolsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs + 2,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  toolChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
    ...Shadows.sm,
  },
  toolChipText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 12,
    color: Colors.textPrimary,
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
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    color: Colors.primaryLight,
  },
  attentionList: {
    backgroundColor: Colors.backgroundCard,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  attentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  attentionInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  attentionLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  attentionMeta: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  attentionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  attentionCountBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    minWidth: 26,
    alignItems: 'center',
  },
  attentionCount: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  attentionCountAlert: {
    color: Colors.dangerDark,
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

  // Pending Consultation Requests
  pendingAptsContainer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  pendingAptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  pendingAptLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  pendingAptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  pendingAptClient: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  pendingAptBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  pendingAptBadgeText: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: 9,
    color: '#B45309',
    letterSpacing: 0.3,
  },
  pendingAptTitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.primary,
    marginBottom: 2,
  },
  pendingAptTime: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  pendingAptActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  pendingAptActionText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: Colors.textLight,
  },
});

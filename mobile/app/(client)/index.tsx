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
  useServices,
  useInvoices,
  useDocuments,
  useAppointments,
  useNotifications,
} from '../../hooks/useQueries';
import { format } from 'date-fns';

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: servicesRes, refetch: refetchServices } = useServices();
  const { data: invoicesRes, refetch: refetchInvoices } = useInvoices();
  const { data: documentsRes, refetch: refetchDocuments } = useDocuments();
  const { data: appointmentsRes, refetch: refetchAppointments } = useAppointments();
  const { data: notificationsRes, refetch: refetchNotifications } = useNotifications();

  const clientServices = servicesRes?.data || [];
  const clientDocs = (documentsRes?.data || []).filter(
    (d) => d.status === 'REQUESTED' || d.status === 'REJECTED'
  );
  const clientApts = (appointmentsRes?.data || []).filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'REQUESTED'
  );
  const clientInvoices = (invoicesRes?.data || []).filter(
    (i) => i.status === 'PENDING'
  );
  const unreadNotifs = (notificationsRes?.data || []).filter((n) => !n.readAt).length;
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchServices(),
      refetchInvoices(),
      refetchDocuments(),
      refetchAppointments(),
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

  const attentionItems = [
    {
      id: 'docs-action',
      label: 'Document Uploads Required',
      count: clientDocs.length,
      meta: 'Files requested by your CA',
      route: '/(client)/documents',
      hasAlert: clientDocs.length > 0,
    },
    {
      id: 'invoices-due',
      label: 'Pending Invoices',
      count: clientInvoices.length,
      meta: 'Awaiting fee settlement',
      route: '/(client)/invoices',
      hasAlert: clientInvoices.length > 0,
    },
    {
      id: 'active-services',
      label: 'Active Engagements',
      count: clientServices.length,
      meta: 'Filings, compliance & advisory',
      route: '/(client)/services',
      hasAlert: false,
    },
    {
      id: 'active-apts',
      label: 'Scheduled Consultations',
      count: clientApts.length,
      meta: 'Upcoming sessions with CA',
      route: '/(client)/calendar',
      hasAlert: false,
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
        {/* Top Header: Dynamic Greeting + Date + Avatar */}
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
                  {getGreeting()}, {user?.firstName || 'Client'}
                </Text>
                <Text style={styles.dateLabel}>
                  {user?.clientProfile?.firmName || 'Client Portal'} · {format(new Date(), 'dd MMMM yyyy')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.topHeaderRight}>
            <TouchableOpacity
              style={styles.notifButton}
              onPress={() => router.push('/(client)/notifications' as any)}
            >
              <MaterialIcons name="notifications-none" size={20} color={Colors.primary} />
              {unreadNotifs > 0 && <View style={styles.notifDot} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(client)/profile' as any)}>
              <AppAvatar name={`${user?.firstName} ${user?.lastName}`} size="sm" uri={user?.avatar} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.hairlineRule} />

        {/* Modern Colorful Key Metrics Strip */}
        <View style={styles.statCardsGrid}>
          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: Colors.warningLight, borderColor: Colors.warningBorder }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(client)/documents')}
          >
            <View style={styles.metricTopRow}>
              <Text style={[styles.metricNumber, { color: Colors.warningDark }]}>{clientDocs.length}</Text>
              <View style={[styles.metricIconBox, { backgroundColor: '#FEF3C7' }]}>
                <MaterialIcons name="upload-file" size={16} color={Colors.warningDark} />
              </View>
            </View>
            <Text style={styles.metricLabel}>Docs Due</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: Colors.dangerLight, borderColor: Colors.dangerBorder }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(client)/invoices')}
          >
            <View style={styles.metricTopRow}>
              <Text style={[styles.metricNumber, { color: Colors.dangerDark }]}>{clientInvoices.length}</Text>
              <View style={[styles.metricIconBox, { backgroundColor: '#FEE2E2' }]}>
                <MaterialIcons name="receipt-long" size={16} color={Colors.dangerDark} />
              </View>
            </View>
            <Text style={styles.metricLabel}>Unpaid Invoices</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: Colors.primarySoft, borderColor: '#BFDBFE' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(client)/services')}
          >
            <View style={styles.metricTopRow}>
              <Text style={[styles.metricNumber, { color: Colors.primaryLight }]}>{clientServices.length}</Text>
              <View style={[styles.metricIconBox, { backgroundColor: '#DBEAFE' }]}>
                <MaterialIcons name="assignment" size={16} color={Colors.primaryLight} />
              </View>
            </View>
            <Text style={styles.metricLabel}>Engagements</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: Colors.successLight, borderColor: Colors.successBorder }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(client)/calendar')}
          >
            <View style={styles.metricTopRow}>
              <Text style={[styles.metricNumber, { color: Colors.successDark }]}>{clientApts.length}</Text>
              <View style={[styles.metricIconBox, { backgroundColor: '#D1FAE5' }]}>
                <MaterialIcons name="event" size={16} color={Colors.successDark} />
              </View>
            </View>
            <Text style={styles.metricLabel}>Meetings</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Strip */}
        <View style={styles.toolsRow}>
          {[
            { label: '+ Book Consultation', icon: 'event-available', route: '/(client)/book-appointment', color: Colors.primaryLight },
            { label: 'Upload Documents', icon: 'cloud-upload', route: '/(client)/documents', color: Colors.warningDark },
            { label: 'Message CA', icon: 'chat', route: '/(client)/messages', color: Colors.purple },
            { label: 'Tax Calendar', icon: 'calendar-month', route: '/(client)/calendar', color: Colors.infoDark },
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
          <Text style={styles.sectionHeading}>Account Status & Actions</Text>
          <Text style={styles.refMeta}>OVERVIEW</Text>
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
                  item.hasAlert ? { backgroundColor: Colors.dangerLight, borderColor: Colors.dangerBorder } : { backgroundColor: Colors.backgroundSubtle, borderColor: Colors.border }
                ]}>
                  <Text style={[styles.attentionCount, item.hasAlert && styles.attentionCountAlert]}>
                    {item.count}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={18} color={Colors.textTertiary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Contact Practice Banner */}
        <View style={styles.contactPracticeBox}>
          <View style={styles.contactPracticeInfo}>
            <Text style={styles.contactPracticeTitle}>Need Financial Guidance?</Text>
            <Text style={styles.contactPracticeSub}>Reach out directly to your assigned CA for quick answers and filing advice.</Text>
          </View>
          <TouchableOpacity
            style={styles.messageCaBtn}
            onPress={() => router.push('/(client)/messages' as any)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="chat" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.messageCaBtnText}>Open Chat</Text>
          </TouchableOpacity>
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
  contactPracticeBox: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.sm,
  },
  contactPracticeInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  contactPracticeTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.primaryDark,
  },
  contactPracticeSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  messageCaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.primaryLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  messageCaBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    color: '#FFFFFF',
  },
});


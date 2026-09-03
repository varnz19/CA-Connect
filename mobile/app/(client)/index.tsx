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
            <Text style={styles.greetingText}>
              {getGreeting()}, {user?.firstName || 'Client'}
            </Text>
            <Text style={styles.dateLabel}>
              {user?.clientProfile?.firmName || 'Client Portal'} · {format(new Date(), 'dd MMMM yyyy')}
            </Text>
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

        {/* Compact Key Metrics Strip */}
        <View style={styles.statBlocksContainer}>
          <TouchableOpacity
            style={styles.statBlock}
            activeOpacity={0.7}
            onPress={() => router.push('/(client)/documents')}
          >
            <Text style={styles.statNumber}>{clientDocs.length}</Text>
            <Text style={styles.statLabel}>Docs Due</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statBlock}
            activeOpacity={0.7}
            onPress={() => router.push('/(client)/invoices')}
          >
            <Text style={styles.statNumber}>{clientInvoices.length}</Text>
            <Text style={styles.statLabel}>Unpaid</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statBlock}
            activeOpacity={0.7}
            onPress={() => router.push('/(client)/services')}
          >
            <Text style={styles.statNumber}>{clientServices.length}</Text>
            <Text style={styles.statLabel}>Engagements</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statBlock}
            activeOpacity={0.7}
            onPress={() => router.push('/(client)/calendar')}
          >
            <Text style={styles.statNumber}>{clientApts.length}</Text>
            <Text style={styles.statLabel}>Meetings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hairlineRule} />

        {/* Quick Actions Strip */}
        <View style={styles.toolsRow}>
          {[
            { label: '+ Book Consultation', route: '/(client)/book-appointment' },
            { label: 'Upload Documents', route: '/(client)/documents' },
            { label: 'Message CA', route: '/(client)/messages' },
            { label: 'Tax Calendar', route: '/(client)/calendar' },
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
          <Text style={styles.sectionHeading}>Account Status & Actions</Text>
          <Text style={styles.refMeta}>OVERVIEW</Text>
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
                <Text style={[styles.attentionCount, item.hasAlert && styles.attentionCountAlert]}>
                  {item.count}
                </Text>
                <MaterialIcons name="chevron-right" size={16} color={Colors.textTertiary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Contact Practice Banner */}
        <View style={styles.contactPracticeBox}>
          <View style={styles.contactPracticeInfo}>
            <Text style={styles.contactPracticeTitle}>Need Guidance?</Text>
            <Text style={styles.contactPracticeSub}>Send direct queries to your dedicated Chartered Accountant.</Text>
          </View>
          <TouchableOpacity
            style={styles.messageCaBtn}
            onPress={() => router.push('/(client)/messages' as any)}
            activeOpacity={0.7}
          >
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
  contactPracticeBox: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactPracticeInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  contactPracticeTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  contactPracticeSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  messageCaBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  messageCaBtnText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
    color: Colors.textLight,
  },
});

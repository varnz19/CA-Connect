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
import { StatusStamp } from '../../components/common/StatusStamp';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing } from '../../constants/theme';
import {
  useServices,
  useInvoices,
  useDocuments,
  useAppointments,
  useNotifications,
} from '../../hooks/useQueries';
import { formatDate, formatCurrency } from '../../utils/formatters';

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
    (a) => a.status === 'CONFIRMED'
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

  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
            {user?.clientProfile?.firmName && (
              <Text style={styles.firmName}>{user.clientProfile.firmName}</Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => router.push('/(client)/notifications' as any)}
            >
              <MaterialIcons name="notifications-none" size={24} color={Colors.textPrimary} />
              {unreadNotifs > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadNotifs}</Text>
                </View>
              )}
            </TouchableOpacity>
            <AppAvatar name={`${user?.firstName} ${user?.lastName}`} size="sm" uri={user?.avatar} />
          </View>
        </View>

        {/* Summary Strip */}
        <View style={styles.stripContainer}>
          <AppCard style={styles.strip} noPadding>
            {[
              { icon: 'work', label: 'Services', value: clientServices.length, color: Colors.primary },
              { icon: 'folder', label: 'Pending Docs', value: clientDocs.length, color: Colors.warning },
              { icon: 'event', label: 'Appointments', value: clientApts.length, color: Colors.success },
              { icon: 'receipt', label: 'Invoices Due', value: clientInvoices.length, color: Colors.danger },
            ].map((item, i, arr) => (
              <View key={item.label} style={[styles.stripItem, i < arr.length - 1 && styles.stripDivider]}>
                <MaterialIcons name={item.icon as any} size={24} color={item.color} />
                <View style={styles.stripContent}>
                  <Text style={styles.stripValue}>{item.value}</Text>
                  <Text style={styles.stripLabel}>{item.label}</Text>
                </View>
              </View>
            ))}
          </AppCard>
        </View>

        {/* Desktop Layout Wrapper */}
        <View style={[styles.mainLayout, isDesktop && styles.mainLayoutDesktop]}>
          <View style={styles.mainColumn}>
            {/* Active Services */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Services</Text>
              <TouchableOpacity onPress={() => router.push('/(client)/services')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {clientServices.slice(0, 2).map((service) => (
              <AppCard key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceRow}>
                  <View style={styles.serviceIcon}>
                    <MaterialIcons name="work-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    {service.description && (
                      <Text style={styles.serviceDesc} numberOfLines={1}>{service.description}</Text>
                    )}
                    {service.dueDate && (
                      <Text style={styles.serviceDue}>Due: {formatDate(service.dueDate)}</Text>
                    )}
                  </View>
                  <StatusStamp status={service.status} />
                </View>
              </AppCard>
            ))}
            {clientServices.length === 0 && (
              <AppCard style={styles.emptyCard}>
                <Text style={styles.emptyText}>No active services at the moment</Text>
              </AppCard>
            )}

        {/* Pending Documents */}
        {clientDocs.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Action Required</Text>
              <TouchableOpacity onPress={() => router.push('/(client)/documents')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {clientDocs.slice(0, 2).map((doc) => (
              <TouchableOpacity
                key={doc.id}
                onPress={() => router.push('/(client)/documents')}
                activeOpacity={0.8}
              >
                <AppCard style={[styles.serviceCard, styles.alertCard]}>
                  <View style={styles.alertRow}>
                    <View style={styles.alertIcon}>
                      <MaterialIcons name="folder-open" size={18} color={Colors.warning} />
                    </View>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{doc.name}</Text>
                      {doc.status === 'REJECTED' && doc.adminComment && (
                        <Text style={styles.alertText}>{doc.adminComment}</Text>
                      )}
                    </View>
                    <StatusStamp status={doc.status} />
                  </View>
                </AppCard>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Upcoming Appointments */}
        {clientApts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            </View>
            {clientApts.slice(0, 1).map((apt) => (
              <AppCard key={apt.id} style={styles.aptCard}>
                <View style={styles.aptRow}>
                  <View style={styles.aptDateBox}>
                    <Text style={styles.aptDay}>
                      {new Date(apt.confirmedDate || apt.requestedDate).getDate()}
                    </Text>
                    <Text style={styles.aptMonth}>
                      {new Date(apt.confirmedDate || apt.requestedDate).toLocaleString('en', { month: 'short' })}
                    </Text>
                  </View>
                  <View style={styles.aptInfo}>
                    <Text style={styles.aptTitle}>{apt.title}</Text>
                    <Text style={styles.aptTime}>
                      {formatDate(apt.confirmedDate || apt.requestedDate, true)}
                    </Text>
                    <Text style={styles.aptDuration}>{apt.duration} minutes</Text>
                  </View>
                  <StatusStamp status={apt.status} />
                </View>
              </AppCard>
            ))}
          </>
        )}

        {/* Pending Invoices */}
        {clientInvoices.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Payments</Text>
            </View>
            {clientInvoices.slice(0, 1).map((inv) => (
              <TouchableOpacity
                key={inv.id}
                onPress={() => router.push('/(client)/invoices' as any)}
                activeOpacity={0.8}
              >
                <AppCard style={[styles.invoiceCard]}>
                  <View style={styles.invoiceRow}>
                    <View>
                      <Text style={styles.invoiceNumber}>{inv.invoiceNumber}</Text>
                      <Text style={styles.invoiceDue}>Due: {formatDate(inv.dueDate)}</Text>
                    </View>
                    <View style={styles.invoiceRight}>
                      <Text style={styles.invoiceAmount}>{formatCurrency(inv.total)}</Text>
                      <StatusStamp status={inv.status} />
                    </View>
                  </View>
                </AppCard>
              </TouchableOpacity>
            ))}
          </>
        )}

          </View>

          <View style={styles.sideColumn}>
            {/* Quick Actions */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            <View style={styles.actionGrid}>
              {[
                { icon: 'cloud-upload', label: 'Upload Document', route: '/(client)/documents', color: Colors.secondary },
                { icon: 'event', label: 'Book Appointment', route: '/(client)/book-appointment', color: Colors.success },
                { icon: 'receipt', label: 'View Invoices', route: '/(client)/invoices', color: Colors.warning },
                { icon: 'chat', label: 'Message CA', route: '/(client)/messages', color: Colors.primary },
              ].map((action) => (
                <TouchableOpacity
                  key={action.label}
                  style={styles.quickAction}
                  onPress={() => router.push(action.route as any)}
                  activeOpacity={0.8}
                >
                  <AppCard style={styles.quickActionCard}>
                    <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                      <MaterialIcons name={action.icon as any} size={28} color={action.color} />
                    </View>
                    <Text style={styles.quickActionLabel}>{action.label}</Text>
                  </AppCard>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={{ height: Spacing['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerLeft: { flex: 1 },
  greeting: {
    fontFamily: Typography.fontFamily.displayRegular,
    fontSize: Typography.size.lg,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  userName: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: Typography.size['2xl'],
    color: Colors.primary,
    marginTop: 4,
  },
  firmName: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: 4,
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
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: 9,
    color: Colors.background,
  },
  stripContainer: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  strip: { flexDirection: 'row', borderRadius: 0, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.backgroundCard },
  stripItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: 4,
  },
  stripDivider: {
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  stripContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stripValue: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.xl,
    color: Colors.primary,
  },
  stripLabel: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: Typography.size.lg,
    color: Colors.primary,
  },
  seeAll: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: Typography.size.xs,
    color: Colors.secondary,
    textTransform: 'uppercase',
  },
  serviceCard: { marginHorizontal: Spacing.xl, marginBottom: Spacing.sm, borderRadius: 0, borderWidth: 1, borderColor: Colors.border },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  serviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: { flex: 1 },
  serviceName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.primary,
  },
  serviceDesc: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  serviceDue: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  alertCard: { borderLeftWidth: 3, borderLeftColor: Colors.secondary, backgroundColor: Colors.background },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  alertText: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.secondary,
    marginTop: 4,
  },
  aptCard: { marginHorizontal: Spacing.xl, marginBottom: Spacing.sm, borderRadius: 0, borderWidth: 1, borderColor: Colors.border },
  aptRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  aptDateBox: {
    width: 48,
    height: 48,
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aptDay: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.xl,
    color: Colors.primary,
  },
  aptMonth: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  aptInfo: { flex: 1 },
  aptTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.primary,
  },
  aptTime: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  aptDuration: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  invoiceCard: { marginHorizontal: Spacing.xl, marginBottom: Spacing.sm, borderLeftWidth: 3, borderLeftColor: Colors.secondary, borderRadius: 0, borderWidth: 1, borderColor: Colors.border },
  invoiceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  invoiceNumber: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.base,
    color: Colors.primary,
  },
  invoiceDue: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  invoiceRight: { alignItems: 'flex-end', gap: 4 },
  invoiceAmount: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.lg,
    color: Colors.primary,
  },
  emptyCard: { marginHorizontal: Spacing.xl, alignItems: 'center', paddingVertical: Spacing.xl, borderRadius: 0, borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed' },
  emptyText: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
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
    gap: Spacing.sm,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  quickAction: { width: '48%' },
  quickActionCard: { alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.sm, borderRadius: 0, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.backgroundCard },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontFamily: Typography.fontFamily.monoMedium,
    fontSize: Typography.size.xs,
    color: Colors.primary,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

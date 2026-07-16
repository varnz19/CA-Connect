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
import { AppBadge } from '../../components/common/AppBadge';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing } from '../../constants/theme';
import {
  mockServices,
  mockDocumentRequests,
  mockAppointments,
  mockClientNotifications,
  mockInvoices,
} from '../../utils/mockData';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const clientId = user?.clientProfile?.id || 'cp-001';
  const clientServices = mockServices.filter((s) => s.clientProfileId === clientId && s.status === 'ACTIVE');
  const clientDocs = mockDocumentRequests.filter(
    (d) => d.clientProfileId === clientId && (d.status === 'REQUESTED' || d.status === 'REJECTED')
  );
  const clientApts = mockAppointments.filter(
    (a) => a.clientProfileId === clientId && a.status === 'CONFIRMED'
  );
  const clientInvoices = mockInvoices.filter(
    (i) => i.clientProfileId === clientId && i.status === 'PENDING'
  );
  const unreadNotifs = mockClientNotifications.filter((n) => !n.readAt).length;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

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
                <MaterialIcons name={item.icon as any} size={20} color={item.color} />
                <Text style={styles.stripValue}>{item.value}</Text>
                <Text style={styles.stripLabel}>{item.label}</Text>
              </View>
            ))}
          </AppCard>
        </View>

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
                <MaterialIcons name="work-outline" size={18} color={Colors.primary} />
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
              <AppBadge status={service.status} />
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
                    <AppBadge status={doc.status} />
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
                  <AppBadge status={apt.status} />
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
                      <AppBadge status={inv.status} />
                    </View>
                  </View>
                </AppCard>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActions}>
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
                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}18` }]}>
                  <MaterialIcons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </AppCard>
            </TouchableOpacity>
          ))}
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
  firmName: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
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
  stripContainer: { paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  strip: { flexDirection: 'row' },
  stripItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: 2,
  },
  stripDivider: {
    borderRightWidth: 1,
    borderRightColor: Colors.borderLight,
  },
  stripValue: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    color: Colors.textPrimary,
  },
  stripLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.base,
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
  serviceCard: { marginHorizontal: Spacing.base, marginBottom: Spacing.sm },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  serviceIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.statusActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: { flex: 1 },
  serviceName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  serviceDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  serviceDue: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  alertCard: { borderLeftWidth: 3, borderLeftColor: Colors.warning },
  alertIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  alertText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.warning,
    marginTop: 1,
  },
  aptCard: { marginHorizontal: Spacing.base, marginBottom: Spacing.sm },
  aptRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  aptDateBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.statusActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aptDay: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    color: Colors.primary,
  },
  aptMonth: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.secondary,
  },
  aptInfo: { flex: 1 },
  aptTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  aptTime: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  aptDuration: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  invoiceCard: { marginHorizontal: Spacing.base, marginBottom: Spacing.sm, borderLeftWidth: 3, borderLeftColor: Colors.warning },
  invoiceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  invoiceNumber: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  invoiceDue: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  invoiceRight: { alignItems: 'flex-end', gap: 4 },
  invoiceAmount: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  emptyCard: { marginHorizontal: Spacing.base, alignItems: 'center', paddingVertical: Spacing.base },
  emptyText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  quickAction: { width: '47%' },
  quickActionCard: { alignItems: 'center', paddingVertical: Spacing.base, gap: Spacing.xs },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});

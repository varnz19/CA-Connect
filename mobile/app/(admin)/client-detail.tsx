import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppBadge } from '../../components/common/AppBadge';
import { AppButton } from '../../components/common/AppButton';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useClient } from '../../hooks/useQueries';
import { formatCurrency, formatDate } from '../../utils/formatters';

type TabType = 'PROFILE' | 'SERVICES' | 'INVOICES' | 'DOCS' | 'APPOINTMENTS';

export default function AdminClientDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: clientRes, isLoading } = useClient(id || '');
  const [activeTab, setActiveTab] = useState<TabType>('PROFILE');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading client profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const client = clientRes?.data;
  if (!client) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Client record not found.</Text>
          <AppButton title="Return to Directory" onPress={() => router.replace('/(admin)/clients')} size="sm" />
        </View>
      </SafeAreaView>
    );
  }

  const profile = (client.clientProfile || {}) as any;
  const services = profile.services || [];
  const invoices = profile.invoices || [];
  const docRequests = profile.documentRequests || [];
  const appointments = profile.appointments || [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.replace('/(admin)/clients')} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={18} color={Colors.primary} />
          <Text style={styles.backText}>Client Directory</Text>
        </TouchableOpacity>
        <AppBadge status={client.isActive ? 'ACTIVE' : 'CANCELLED'} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header Block: name/title in Ink, key facts as labeled key-value grid */}
        <View style={styles.headerBlock}>
          <Text style={styles.refCode}>CLIENT CODE: {profile.clientCode || 'UNASSIGNED'}</Text>
          <Text style={styles.clientTitle}>{client.firstName} {client.lastName}</Text>
          {profile.firmName && (
            <Text style={styles.firmSubtitle}>{profile.firmName}</Text>
          )}

          {/* Key Facts Grid (Mono type for values) */}
          <View style={styles.keyFactsGrid}>
            <View style={styles.keyFactCol}>
              <Text style={styles.factLabel}>GST STATE</Text>
              <Text style={styles.factValue}>{profile.gstState || '—'}</Text>
            </View>
            <View style={styles.keyFactCol}>
              <Text style={styles.factLabel}>GSTIN</Text>
              <Text style={styles.factValue}>{profile.gstin || '—'}</Text>
            </View>
            <View style={styles.keyFactCol}>
              <Text style={styles.factLabel}>PAN NUMBER</Text>
              <Text style={styles.factValue}>{profile.panNumber || '—'}</Text>
            </View>
          </View>

          {/* Actions: Clear text-labeled buttons in Ink or outline variant */}
          <View style={styles.actionRow}>
            <AppButton
              title="Issue Invoice"
              size="sm"
              onPress={() => router.push(`/(admin)/create-invoice?clientId=${profile.id}` as any)}
            />
            <AppButton
              title="Request Doc"
              variant="outline"
              size="sm"
              onPress={() => router.push(`/(admin)/request-document?clientId=${profile.id}` as any)}
            />
            <AppButton
              title="Message"
              variant="outline"
              size="sm"
              onPress={() => router.push(`/(admin)/chat?clientId=${client.id}` as any)}
            />
          </View>
        </View>

        <View style={styles.hairlineRule} />

        {/* Tab Navigation (Flat) */}
        <View style={styles.tabRow}>
          {(['PROFILE', 'SERVICES', 'INVOICES', 'DOCS', 'APPOINTMENTS'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabItemText, activeTab === tab && styles.tabItemTextActive]}>
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.hairlineRule} />

        {/* Content Section */}
        <View style={styles.contentSection}>
          {activeTab === 'PROFILE' && (
            <View style={styles.sectionBody}>
              <Text style={styles.sectionHeading}>Contact & Registration Details</Text>
              
              <View style={styles.kvRow}>
                <Text style={styles.kvKey}>Email address</Text>
                <Text style={styles.kvValMono}>{client.email}</Text>
              </View>

              <View style={styles.kvRow}>
                <Text style={styles.kvKey}>Phone number</Text>
                <Text style={styles.kvValMono}>{client.phone || 'Not recorded'}</Text>
              </View>

              <View style={styles.kvRow}>
                <Text style={styles.kvKey}>Firm / Trade name</Text>
                <Text style={styles.kvValText}>{profile.firmName || 'Individual'}</Text>
              </View>

              <View style={styles.kvRow}>
                <Text style={styles.kvKey}>PAN card number</Text>
                <Text style={styles.kvValMono}>{profile.panNumber || 'Not recorded'}</Text>
              </View>

              <View style={styles.kvRow}>
                <Text style={styles.kvKey}>GSTIN state jurisdiction</Text>
                <Text style={styles.kvValText}>{profile.gstState || 'Not recorded'}</Text>
              </View>

              <View style={styles.kvRow}>
                <Text style={styles.kvKey}>GSTIN number</Text>
                <Text style={styles.kvValMono}>{profile.gstin || 'Not registered'}</Text>
              </View>

              <View style={styles.kvRow}>
                <Text style={styles.kvKey}>Billing address</Text>
                <Text style={styles.kvValText}>{profile.address || 'Not recorded'}</Text>
              </View>
            </View>
          )}

          {activeTab === 'SERVICES' && (
            <View style={styles.sectionBody}>
              <Text style={styles.sectionHeading}>Assigned Service Engagements</Text>
              {services.length === 0 ? (
                <Text style={styles.emptyText}>No service engagements currently active.</Text>
              ) : (
                services.map((svc: any) => (
                  <View key={svc.id} style={styles.detailListRow}>
                    <View style={styles.detailListLeft}>
                      <Text style={styles.rowTitle}>{svc.name}</Text>
                      {svc.description && <Text style={styles.rowDesc}>{svc.description}</Text>}
                      <Text style={styles.rowMeta}>Started: {formatDate(svc.startDate)}</Text>
                    </View>
                    <AppBadge status={svc.status} />
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === 'INVOICES' && (
            <View style={styles.sectionBody}>
              <Text style={styles.sectionHeading}>Invoices & Billing Statements</Text>
              {invoices.length === 0 ? (
                <Text style={styles.emptyText}>No invoices generated for this account.</Text>
              ) : (
                invoices.map((inv: any) => (
                  <View key={inv.id} style={styles.detailListRow}>
                    <View style={styles.detailListLeft}>
                      <Text style={styles.rowTitleMono}>{inv.invoiceNumber}</Text>
                      <Text style={styles.rowMeta}>Due: {formatDate(inv.dueDate)}</Text>
                    </View>
                    <View style={styles.detailListRight}>
                      <Text style={styles.rowAmount}>{formatCurrency(inv.total)}</Text>
                      <AppBadge status={inv.status} />
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === 'DOCS' && (
            <View style={styles.sectionBody}>
              <Text style={styles.sectionHeading}>Document Requests</Text>
              {docRequests.length === 0 ? (
                <Text style={styles.emptyText}>No document requests issued for this client.</Text>
              ) : (
                docRequests.map((doc: any) => (
                  <View key={doc.id} style={styles.detailListRow}>
                    <View style={styles.detailListLeft}>
                      <Text style={styles.rowTitle}>{doc.name}</Text>
                      {doc.dueDate && <Text style={styles.rowMeta}>Due: {formatDate(doc.dueDate)}</Text>}
                    </View>
                    <AppBadge status={doc.status} />
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === 'APPOINTMENTS' && (
            <View style={styles.sectionBody}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm }}>
                <Text style={styles.sectionHeading}>Consultation History ({appointments.length})</Text>
                <AppButton
                  title="+ Schedule"
                  size="sm"
                  variant="outline"
                  onPress={() => router.push(`/(admin)/add-appointment?clientId=${profile.id}` as any)}
                />
              </View>
              {appointments.length === 0 ? (
                <Text style={styles.emptyText}>No appointments booked for this client.</Text>
              ) : (
                appointments.map((apt: any) => (
                  <TouchableOpacity
                    key={apt.id}
                    style={[styles.detailListRow, { cursor: 'pointer' as any }]}
                    onPress={() => router.push(`/(admin)/appointment-detail?id=${apt.id}` as any)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.detailListLeft}>
                      <Text style={styles.rowTitle}>{apt.title}</Text>
                      <Text style={styles.rowMeta}>
                        {formatDate(apt.confirmedDate || apt.requestedDate, true)} · {apt.duration}m
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <AppBadge status={apt.status} />
                      <MaterialIcons name="chevron-right" size={18} color={Colors.textTertiary} />
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  loadingText: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  scroll: {
    paddingBottom: Spacing['3xl'],
  },
  headerBlock: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.backgroundCard,
  },
  refCode: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  clientTitle: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: Typography.size['2xl'],
    color: Colors.primary,
  },
  firmSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  keyFactsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.hairline,
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  keyFactCol: {
    flex: 1,
  },
  factLabel: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 9,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
  factValue: {
    fontFamily: Typography.fontFamily.monoBold, // mono values
    fontSize: Typography.size.xs,
    color: Colors.primary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.hairline,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.background,
  },
  tabItem: {
    paddingVertical: Spacing.md,
    marginRight: Spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: Colors.primary,
  },
  tabItemText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
  tabItemTextActive: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.semiBold,
  },
  contentSection: {
    backgroundColor: Colors.backgroundCard,
  },
  sectionBody: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  sectionHeading: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  kvKey: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  kvValMono: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.primary,
  },
  kvValText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.primary,
  },
  detailListRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  detailListLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  detailListRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  rowTitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  rowTitleMono: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  rowDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rowMeta: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  rowAmount: {
    fontFamily: Typography.fontFamily.monoBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  emptyText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    paddingVertical: Spacing.md,
  },
});

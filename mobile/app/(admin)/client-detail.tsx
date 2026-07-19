import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppCard } from '../../components/common/AppCard';
import { AppAvatar } from '../../components/common/AppAvatar';
import { AppBadge } from '../../components/common/AppBadge';
import { AppButton } from '../../components/common/AppButton';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useClient } from '../../hooks/useQueries';
import { formatCurrency, formatDate } from '../../utils/formatters';

type TabType = 'PROFILE' | 'SERVICES' | 'INVOICES' | 'DOCS' | 'APPOINTMENTS';

export default function AdminClientDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: clientRes, isLoading, refetch } = useClient(id || '');
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
          <Text style={styles.loadingText}>Client not found.</Text>
          <AppButton title="Go Back" onPress={() => router.replace('/(admin)/clients')} style={styles.backBtn} />
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
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.replace('/(admin)/clients')} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={20} color={Colors.textPrimary} />
          <Text style={styles.backText}>Back to Clients</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User Brief Card */}
        <AppCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <AppAvatar
              name={`${client.firstName} ${client.lastName}`}
              size="lg"
              uri={client.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {client.firstName} {client.lastName}
              </Text>
              <Text style={styles.profileCode}>Code: {profile.clientCode || 'N/A'}</Text>
              <View style={styles.badgeRow}>
                <AppBadge
                  label={client.isActive ? 'Active' : 'Inactive'}
                  variant={client.isActive ? 'success' : 'neutral'}
                />
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/(admin)/create-invoice?clientId=${profile.id}` as any)}
            >
              <MaterialIcons name="receipt" size={16} color={Colors.secondary} />
              <Text style={styles.actionButtonText}>Invoice</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/(admin)/request-document?clientId=${profile.id}` as any)}
            >
              <MaterialIcons name="cloud-upload" size={16} color={Colors.secondary} />
              <Text style={styles.actionButtonText}>Request Doc</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/(admin)/messages?clientId=${client.id}` as any)}
            >
              <MaterialIcons name="chat" size={16} color={Colors.secondary} />
              <Text style={styles.actionButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </AppCard>

        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          {(['PROFILE', 'SERVICES', 'INVOICES', 'DOCS', 'APPOINTMENTS'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'PROFILE' && (
            <AppCard style={styles.contentCard}>
              <Text style={styles.sectionTitle}>Profile Details</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email Address</Text>
                <Text style={styles.detailValue}>{client.email}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone Number</Text>
                <Text style={styles.detailValue}>{client.phone || 'Not Provided'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Firm Name</Text>
                <Text style={styles.detailValue}>{profile.firmName || 'Individual'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>PAN Card Number</Text>
                <Text style={styles.detailValue}>{profile.panNumber || 'Not Registered'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>GSTIN State</Text>
                <Text style={styles.detailValue}>{profile.gstState || 'Not Registered'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>GSTIN Number</Text>
                <Text style={styles.detailValue}>{profile.gstin || 'Not Registered'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Billing Address</Text>
                <Text style={styles.detailValue}>{profile.address || 'No address added'}</Text>
              </View>
            </AppCard>
          )}

          {activeTab === 'SERVICES' && (
            <View style={styles.listContainer}>
              {services.length === 0 ? (
                <Text style={styles.emptyText}>No services assigned to this client.</Text>
              ) : (
                services.map((svc: any) => (
                  <AppCard key={svc.id} style={styles.listItemCard}>
                    <View style={styles.listItemHeader}>
                      <Text style={styles.listItemTitle}>{svc.name}</Text>
                      <AppBadge status={svc.status} />
                    </View>
                    {svc.description && <Text style={styles.listItemDesc}>{svc.description}</Text>}
                    <Text style={styles.listItemFooter}>Started: {formatDate(svc.startDate)}</Text>
                  </AppCard>
                ))
              )}
            </View>
          )}

          {activeTab === 'INVOICES' && (
            <View style={styles.listContainer}>
              {invoices.length === 0 ? (
                <Text style={styles.emptyText}>No invoices generated yet.</Text>
              ) : (
                invoices.map((inv: any) => (
                  <AppCard key={inv.id} style={styles.listItemCard}>
                    <View style={styles.listItemHeader}>
                      <Text style={styles.listItemTitle}>{inv.invoiceNumber}</Text>
                      <AppBadge status={inv.status} />
                    </View>
                    <View style={styles.listItemMeta}>
                      <Text style={styles.metaLabel}>Total Amount:</Text>
                      <Text style={styles.metaValue}>{formatCurrency(inv.total)}</Text>
                    </View>
                    <Text style={styles.listItemFooter}>Due: {formatDate(inv.dueDate)}</Text>
                  </AppCard>
                ))
              )}
            </View>
          )}

          {activeTab === 'DOCS' && (
            <View style={styles.listContainer}>
              {docRequests.length === 0 ? (
                <Text style={styles.emptyText}>No document requests created.</Text>
              ) : (
                docRequests.map((doc: any) => (
                  <AppCard key={doc.id} style={styles.listItemCard}>
                    <View style={styles.listItemHeader}>
                      <Text style={styles.listItemTitle}>{doc.name}</Text>
                      <AppBadge status={doc.status} />
                    </View>
                    {doc.description && <Text style={styles.listItemDesc}>{doc.description}</Text>}
                    {doc.documents && doc.documents.length > 0 && (
                      <View style={styles.docAttachments}>
                        <Text style={styles.attachmentsLabel}>Uploaded Files:</Text>
                        {doc.documents.map((file: any) => (
                          <TouchableOpacity
                            key={file.id}
                            style={styles.fileLink}
                            onPress={() => Linking.openURL(file.fileUrl)}
                          >
                            <MaterialIcons name="insert-drive-file" size={14} color={Colors.secondary} />
                            <Text style={styles.fileLinkText}>{file.fileName}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    <Text style={styles.listItemFooter}>
                      Due: {doc.dueDate ? formatDate(doc.dueDate) : 'No due date'}
                    </Text>
                  </AppCard>
                ))
              )}
            </View>
          )}

          {activeTab === 'APPOINTMENTS' && (
            <View style={styles.listContainer}>
              {appointments.length === 0 ? (
                <Text style={styles.emptyText}>No scheduled appointments.</Text>
              ) : (
                appointments.map((apt: any) => (
                  <AppCard key={apt.id} style={styles.listItemCard}>
                    <View style={styles.listItemHeader}>
                      <Text style={styles.listItemTitle}>{apt.title}</Text>
                      <AppBadge status={apt.status} />
                    </View>
                    {apt.description && <Text style={styles.listItemDesc}>{apt.description}</Text>}
                    <Text style={styles.listItemFooter}>
                      Time: {formatDate(apt.requestedDate, true)}
                    </Text>
                  </AppCard>
                ))
              )}
            </View>
          )}
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  loadingText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
  },
  topBar: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  scroll: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  profileCard: {
    marginBottom: Spacing.base,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.primary,
  },
  profileCode: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: `${Colors.secondary}12`,
  },
  actionButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 12,
    color: Colors.secondaryDark,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.md,
    padding: 2,
    marginBottom: Spacing.base,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  tabButtonActive: {
    backgroundColor: Colors.backgroundCard,
    ...Shadows.sm,
  },
  tabButtonText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  tabButtonTextActive: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.semiBold,
  },
  tabContent: {
    gap: Spacing.sm,
  },
  contentCard: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  detailRow: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingBottom: Spacing.xs,
    gap: 2,
  },
  detailLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  listContainer: {
    gap: Spacing.sm,
  },
  listItemCard: {
    gap: Spacing.xs,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  listItemDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  listItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  metaValue: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
  listItemFooter: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  docAttachments: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  attachmentsLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  fileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fileLinkText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.secondaryDark,
    textDecorationLine: 'underline',
  },
  emptyText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
});

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ServiceCard } from '../../components/common/EntityCards';
import { AppEmpty } from '../../components/common/AppStates';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useServices } from '../../hooks/useQueries';

export default function ClientServicesScreen() {
  const { user } = useAuthStore();
  const clientId = user?.clientProfile?.id || 'cp-001';
  const { data: servicesData, refetch } = useServices();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const myServices = servicesData?.data || [];
  const active = myServices.filter((s) => s.status === 'ACTIVE');
  const completed = myServices.filter((s) => s.status === 'COMPLETED');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={myServices}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>My Services</Text>
              <Text style={styles.subtitle}>
                {active.length} active · {completed.length} completed
              </Text>
            </View>

            {active.length > 0 && (
              <Text style={styles.sectionLabel}>Active Services</Text>
            )}
            {active.map((service) => (
              <View key={service.id} style={styles.cardWrapper}>
                <ServiceCard service={service} showClient={false} />
              </View>
            ))}

            {completed.length > 0 && (
              <Text style={[styles.sectionLabel, styles.sectionLabelTop]}>Completed Services</Text>
            )}
          </>
        }
        renderItem={({ item }) =>
          item.status === 'COMPLETED' ? (
            <View style={styles.cardWrapper}>
              <ServiceCard service={item} showClient={false} />
            </View>
          ) : null
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <AppEmpty
            icon="work-outline"
            title="No services assigned"
            description="Your CA will assign services to you here."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionLabelTop: { marginTop: Spacing.base },
  list: { paddingBottom: Spacing['3xl'] },
  cardWrapper: { paddingHorizontal: Spacing.base },
});

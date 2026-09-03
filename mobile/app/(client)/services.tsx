import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ServiceCard } from '../../components/common/EntityCards';
import { AppEmpty } from '../../components/common/AppStates';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useServices } from '../../hooks/useQueries';

export default function ClientServicesScreen() {
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
              <Text style={styles.title}>Service Engagements</Text>
              <Text style={styles.subtitle}>
                {active.length} active · {completed.length} completed
              </Text>
            </View>
            <View style={styles.hairlineRule} />
          </>
        }
        renderItem={({ item }) => (
          <ServiceCard service={item} showClient={false} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <AppEmpty
            title="No service records"
            description="Professional CA services assigned to your firm account will appear here."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: Typography.size.xl,
    color: Colors.primary,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.monoRegular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  hairlineRule: {
    height: 1,
    backgroundColor: Colors.hairline,
  },
  list: {
    backgroundColor: Colors.backgroundCard,
  },
});

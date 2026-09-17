import { Tabs } from 'expo-router';
import { StyleSheet, View, Text, useWindowDimensions, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sidebar } from '../../components/navigation/Sidebar';

interface TabIconProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  color: any;
  focused: boolean;
  label: string;
}

const TabIcon = ({ icon, color, focused, label }: TabIconProps) => (
  <View style={tabStyles.tab}>
    {focused && <View style={tabStyles.topIndicator} />}
    <MaterialIcons name={icon} size={20} color={color} />
    <Text style={[tabStyles.label, { color, fontFamily: focused ? Typography.fontFamily.semiBold : Typography.fontFamily.medium }]}>
      {label}
    </Text>
  </View>
);

const tabStyles = StyleSheet.create({
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: '100%',
    position: 'relative',
    paddingTop: 4,
  },
  topIndicator: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 2,
    backgroundColor: Colors.secondary, // Brass top accent line
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
});

export default function AdminLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768 && Platform.OS === 'web';

  const sidebarItems = [
    { name: 'index', label: 'Dashboard', icon: 'dashboard' as const, route: '/' },
    { name: 'clients', label: 'Clients', icon: 'people' as const, route: '/clients' },
    { name: 'appointments', label: 'Consultations', icon: 'event' as const, route: '/appointments' },
    { name: 'invoices', label: 'Invoices', icon: 'receipt-long' as const, route: '/invoices' },
    { name: 'messages', label: 'Messages', icon: 'chat' as const, route: '/messages' },
    { name: 'settings', label: 'Settings', icon: 'settings' as const, route: '/settings' },
  ];

  return (
    <View style={layoutStyles.container}>
      {isDesktop && <Sidebar items={sidebarItems} baseRoute="(admin)" />}
      <View style={layoutStyles.content}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: isDesktop ? { display: 'none' } : {
              backgroundColor: Colors.backgroundCard,
              borderTopColor: Colors.hairline,
              borderTopWidth: 1,
              height: 56 + insets.bottom,
              paddingBottom: insets.bottom + 4,
              paddingTop: 0,
            },
            tabBarShowLabel: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ color, focused }) => (
                <TabIcon icon="dashboard" color={color} focused={focused} label="Dashboard" />
              ),
              tabBarActiveTintColor: Colors.secondary,
              tabBarInactiveTintColor: Colors.textTertiary,
            }}
          />
          <Tabs.Screen
            name="clients"
            options={{
              title: 'Clients',
              tabBarIcon: ({ color, focused }) => (
                <TabIcon icon="people" color={color} focused={focused} label="Clients" />
              ),
              tabBarActiveTintColor: Colors.secondary,
              tabBarInactiveTintColor: Colors.textTertiary,
            }}
          />
          <Tabs.Screen
            name="appointments"
            options={{
              title: 'Consultations',
              tabBarIcon: ({ color, focused }) => (
                <TabIcon icon="event" color={color} focused={focused} label="Consults" />
              ),
              tabBarActiveTintColor: Colors.secondary,
              tabBarInactiveTintColor: Colors.textTertiary,
            }}
          />
          <Tabs.Screen
            name="invoices"
            options={{
              title: 'Invoices',
              tabBarIcon: ({ color, focused }) => (
                <TabIcon icon="receipt-long" color={color} focused={focused} label="Invoices" />
              ),
              tabBarActiveTintColor: Colors.secondary,
              tabBarInactiveTintColor: Colors.textTertiary,
            }}
          />
          <Tabs.Screen
            name="messages"
            options={{
              title: 'Messages',
              tabBarIcon: ({ color, focused }) => (
                <TabIcon icon="chat" color={color} focused={focused} label="Messages" />
              ),
              tabBarActiveTintColor: Colors.secondary,
              tabBarInactiveTintColor: Colors.textTertiary,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color, focused }) => (
                <TabIcon icon="settings" color={color} focused={focused} label="Settings" />
              ),
              tabBarActiveTintColor: Colors.secondary,
              tabBarInactiveTintColor: Colors.textTertiary,
            }}
          />
          <Tabs.Screen name="calendar" options={{ href: null }} />
          <Tabs.Screen name="chat" options={{ href: null }} />
          <Tabs.Screen name="documents" options={{ href: null }} />
          <Tabs.Screen name="notifications" options={{ href: null }} />
          <Tabs.Screen name="add-client" options={{ href: null }} />
          <Tabs.Screen name="add-appointment" options={{ href: null }} />
          <Tabs.Screen name="create-invoice" options={{ href: null }} />
          <Tabs.Screen name="request-document" options={{ href: null }} />
          <Tabs.Screen name="appointment-detail" options={{ href: null }} />
          <Tabs.Screen name="change-password" options={{ href: null }} />
          <Tabs.Screen name="edit-profile" options={{ href: null }} />
          <Tabs.Screen name="firm-info" options={{ href: null }} />
          <Tabs.Screen name="client-detail" options={{ href: null }} />
        </Tabs>
      </View>
    </View>
  );
}

const layoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

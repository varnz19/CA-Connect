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
    backgroundColor: Colors.secondary,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
});

export default function ClientLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768 && Platform.OS === 'web';

  const sidebarItems = [
    { name: 'index', label: 'Dashboard', icon: 'home' as const, route: '/' },
    { name: 'services', label: 'Services', icon: 'work' as const, route: '/services' },
    { name: 'documents', label: 'Documents', icon: 'folder' as const, route: '/documents' },
    { name: 'calendar', label: 'Calendar', icon: 'event' as const, route: '/calendar' },
    { name: 'messages', label: 'Messages', icon: 'chat' as const, route: '/messages' },
    { name: 'profile', label: 'Profile', icon: 'person' as const, route: '/profile' },
  ];

  return (
    <View style={layoutStyles.container}>
      {isDesktop && <Sidebar items={sidebarItems} baseRoute="(client)" />}
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
              tabBarIcon: ({ color, focused }) => (
                <TabIcon icon="home" color={color} focused={focused} label="Home" />
              ),
              tabBarActiveTintColor: Colors.secondary,
              tabBarInactiveTintColor: Colors.textTertiary,
            }}
          />
          <Tabs.Screen
            name="services"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <TabIcon icon="work" color={color} focused={focused} label="Services" />
              ),
              tabBarActiveTintColor: Colors.secondary,
              tabBarInactiveTintColor: Colors.textTertiary,
            }}
          />
          <Tabs.Screen
            name="documents"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <TabIcon icon="folder" color={color} focused={focused} label="Docs" />
              ),
              tabBarActiveTintColor: Colors.secondary,
              tabBarInactiveTintColor: Colors.textTertiary,
            }}
          />
          <Tabs.Screen
            name="calendar"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <TabIcon icon="event" color={color} focused={focused} label="Calendar" />
              ),
              tabBarActiveTintColor: Colors.secondary,
              tabBarInactiveTintColor: Colors.textTertiary,
            }}
          />
          <Tabs.Screen
            name="messages"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <TabIcon icon="chat" color={color} focused={focused} label="Chat" />
              ),
              tabBarActiveTintColor: Colors.secondary,
              tabBarInactiveTintColor: Colors.textTertiary,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <TabIcon icon="person" color={color} focused={focused} label="Profile" />
              ),
              tabBarActiveTintColor: Colors.secondary,
              tabBarInactiveTintColor: Colors.textTertiary,
            }}
          />
          <Tabs.Screen name="book-appointment" options={{ href: null }} />
          <Tabs.Screen name="invoices" options={{ href: null }} />
          <Tabs.Screen name="notifications" options={{ href: null }} />
          <Tabs.Screen name="edit-profile" options={{ href: null }} />
          <Tabs.Screen name="change-password" options={{ href: null }} />
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

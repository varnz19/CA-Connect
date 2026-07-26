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
    <View style={[tabStyles.iconWrapper, focused && tabStyles.iconWrapperFocused]}>
      <MaterialIcons name={icon} size={22} color={color} />
    </View>
    <Text style={[tabStyles.label, { color, fontFamily: focused ? Typography.fontFamily.semiBold : Typography.fontFamily.medium }]}>
      {label}
    </Text>
  </View>
);

const tabStyles = StyleSheet.create({
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: '100%',
  },
  iconWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  iconWrapperFocused: {
    backgroundColor: `${Colors.secondary}20`,
  },
  label: { fontSize: 11 },
});

export default function ClientLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768 && Platform.OS === 'web';

  const sidebarItems = [
    { name: 'index', label: 'Home', icon: 'home' as const, route: '/' },
    { name: 'services', label: 'Services', icon: 'work' as const, route: '/services' },
    { name: 'documents', label: 'Docs', icon: 'folder' as const, route: '/documents' },
    { name: 'calendar', label: 'Calendar', icon: 'event' as const, route: '/calendar' },
    { name: 'messages', label: 'Chat', icon: 'chat' as const, route: '/messages' },
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
              backgroundColor: Colors.tabBarBackground,
              borderTopColor: Colors.primaryLight,
              borderTopWidth: 1,
              height: 72 + insets.bottom,
              paddingBottom: insets.bottom + 8,
              paddingTop: 8,
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
              tabBarInactiveTintColor: Colors.tabBarInactive,
            }}
          />
          <Tabs.Screen
            name="services"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <TabIcon icon="work" color={color} focused={focused} label="Services" />
              ),
              tabBarActiveTintColor: Colors.secondary,
              tabBarInactiveTintColor: Colors.tabBarInactive,
            }}
          />
          <Tabs.Screen
            name="documents"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <TabIcon icon="folder" color={color} focused={focused} label="Docs" />
              ),
              tabBarActiveTintColor: Colors.secondary,
              tabBarInactiveTintColor: Colors.tabBarInactive,
            }}
          />
          <Tabs.Screen
            name="calendar"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <TabIcon icon="event" color={color} focused={focused} label="Calendar" />
              ),
              tabBarActiveTintColor: Colors.secondary,
              tabBarInactiveTintColor: Colors.tabBarInactive,
            }}
          />
          <Tabs.Screen
            name="messages"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <TabIcon icon="chat" color={color} focused={focused} label="Chat" />
              ),
              tabBarActiveTintColor: Colors.secondary,
              tabBarInactiveTintColor: Colors.tabBarInactive,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <TabIcon icon="person" color={color} focused={focused} label="Profile" />
              ),
              tabBarActiveTintColor: Colors.secondary,
              tabBarInactiveTintColor: Colors.tabBarInactive,
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

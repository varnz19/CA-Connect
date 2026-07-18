import { Tabs } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabIconProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  color: any;
  focused: boolean;
  label: string;
}

const TabIcon = ({ icon, color, focused, label }: TabIconProps) => (
  <View style={tabStyles.tab}>
    <MaterialIcons name={icon} size={24} color={color} />
    <Text style={[tabStyles.label, { color, fontFamily: focused ? Typography.fontFamily.semiBold : Typography.fontFamily.medium }]}>
      {label}
    </Text>
  </View>
);

const tabStyles = StyleSheet.create({
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    gap: 4,
  },
  label: { fontSize: 11 },
});

export default function AdminLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBarBackground,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="dashboard" color={color} focused={focused} label="Home" />
          ),
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.tabBarInactive,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="people" color={color} focused={focused} label="Clients" />
          ),
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.tabBarInactive,
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: 'Invoices',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="receipt-long" color={color} focused={focused} label="Invoices" />
          ),
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.tabBarInactive,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="chat" color={color} focused={focused} label="Messages" />
          ),
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.tabBarInactive,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="settings" color={color} focused={focused} label="Settings" />
          ),
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.tabBarInactive,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="add-client"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="create-invoice"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="request-document"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="appointment-detail"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

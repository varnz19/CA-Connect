import { useEffect } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../store/authStore';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

import { socketService } from '../services/socketService';
import { registerForPushNotificationsAsync } from '../utils/notifications';

function RootLayoutNav() {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === '(admin)';
    const inClientGroup = segments[0] === '(client)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/landing');
    } else if (isAuthenticated) {
      if (user?.role === 'ADMIN' && !inAdminGroup) {
        router.replace('/(admin)');
      } else if (user?.role === 'CLIENT' && !inClientGroup) {
        router.replace('/(client)');
      }
    }
  }, [isAuthenticated, segments, user]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(client)" />
    </Stack>
  );
}

export default function RootLayout() {
  const { height: windowHeight } = useWindowDimensions();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const isWebDesktop = Platform.OS === 'web' && windowHeight > 800;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          {isWebDesktop ? (
            <View style={styles.webContainer}>
              <View style={[styles.appContainer, { height: windowHeight > 940 ? 880 : '95%' }]}>
                <RootLayoutNav />
              </View>
            </View>
          ) : (
            <RootLayoutNav />
          )}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900 for dark mode canvas
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
});

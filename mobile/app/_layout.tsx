import { useEffect } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Fraunces_400Regular, Fraunces_500Medium, Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { IBMPlexMono_400Regular, IBMPlexMono_500Medium, IBMPlexMono_600SemiBold, IBMPlexMono_700Bold } from '@expo-google-fonts/ibm-plex-mono';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '../store/authStore';

SplashScreen.preventAutoHideAsync();
WebBrowser.maybeCompleteAuthSession();

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
    Fraunces_400Regular,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
    IBMPlexMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const isWeb = Platform.OS === 'web';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          {isWeb ? (
            <View style={styles.webContainer}>
              <View style={styles.appContainer}>
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
    backgroundColor: '#F5F7FB', // Use global background
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  appContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 1400,
    backgroundColor: '#F5F7FB',
    overflow: 'hidden',
  },
});

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { socketService } from '../services/socketService';
import { authService } from '../services/authService';

/**
 * Robust, cross-platform sign out function.
 * Cleans up socket connection, revokes tokens, clears Zustand state & storage,
 * and navigates to the landing screen.
 */
export const performAppSignOut = async (): Promise<void> => {
  try {
    // Best-effort notification to backend to invalidate refresh token
    await authService.logout().catch(() => {});
  } catch {
    // Ignore network errors on logout
  }

  // Disconnect realtime websocket
  try {
    socketService.disconnect();
  } catch {
    // Ignore socket errors
  }

  // Reset Zustand state
  useAuthStore.getState().logout();

  // Clean persistent storage
  try {
    await AsyncStorage.removeItem('ca-connect-auth');
  } catch {
    // Ignore storage errors
  }

  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem('ca-connect-auth');
    } catch {
      // Ignore web storage errors
    }
  }

  // Navigate to landing screen
  router.replace('/(auth)/landing');
};

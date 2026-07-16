import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  if (Platform.OS === 'web') return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for push notifications!');
    return null;
  }

  try {
    // projectId is required for Expo SDK 49+
    const tokenData = await Notifications.getDevicePushTokenAsync();
    console.log('⚡ Device Push Token:', tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error('⚡ Error fetching push token:', error);
    return null;
  }
};

export const showLocalNotification = async (title: string, body: string, data = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // deliver immediately
  });
};

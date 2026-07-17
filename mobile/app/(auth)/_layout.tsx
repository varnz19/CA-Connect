import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="landing" />
      <Stack.Screen name="admin-login" />
      <Stack.Screen name="client-login" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}

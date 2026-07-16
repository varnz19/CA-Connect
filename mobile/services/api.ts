import axios, { AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import { Platform } from 'react-native';

// Detect host for localhost access
const getBaseUrl = () => {
  // If you run on Android Emulator, localhost is 10.0.2.2.
  // If you run on iOS Simulator/Web, it is localhost.
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }
  return 'http://localhost:3000/api';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT access token into outgoing requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const tokens = useAuthStore.getState().tokens;
    if (tokens?.accessToken) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      config.headers.set('Authorization', `Bearer ${tokens.accessToken}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle expired tokens and automatic refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { tokens, login, logout } = useAuthStore.getState();

    if (error.response?.status === 401 && !originalRequest._retry && tokens?.refreshToken) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(`${getBaseUrl()}/auth/refresh-token`, {
          refreshToken: tokens.refreshToken,
        });

        const newTokens = response.data.data;
        
        // Update store with new tokens (keeps user same)
        const user = useAuthStore.getState().user;
        if (user) {
          login(user, newTokens);
        }

        // Retry the original request
        originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, force logout
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

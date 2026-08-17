import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import api from '../api/api';
import { registerForPushNotificationsAsync } from '../utils/notifications';

import '../global.css';

// ── Auth Context ──────────────────────────────────────────────────────────────
type AuthContextType = {
  isAuthenticated: boolean | null;
  signIn: (token: string) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: null,
  signIn: () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

import { setGlobalSignOut } from '../utils/authActions';

// ── Root Layout ───────────────────────────────────────────────────────────────
export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  // Validate token with server on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('admin_token');
        if (!token) {
          setIsAuthenticated(false);
          return;
        }
        const res = await api.get('/auth/profile');
        if (res.data?.role === 'admin') {
          // Check biometric if enabled
          const biometricEnabled = await AsyncStorage.getItem('biometric_enabled');
          if (biometricEnabled === 'true') {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            
            if (hasHardware && isEnrolled) {
              const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Unlock VORA Admin',
                fallbackLabel: 'Use Password',
                disableDeviceFallback: false,
              });
              
              if (!result.success) {
                // If biometric fails or is cancelled, log out to require password
                await AsyncStorage.removeItem('admin_token');
                setIsAuthenticated(false);
                return;
              }
            }
          }
          setIsAuthenticated(true);

          // Register Push Token
          try {
            const pushToken = await registerForPushNotificationsAsync();
            if (pushToken) {
              await api.put('/auth/push-token', { expoPushToken: pushToken });
            }
          } catch (e) {
            console.log('Failed to register push token on load', e);
          }

        } else {
          await AsyncStorage.removeItem('admin_token');
          setIsAuthenticated(false);
        }
      } catch {
        await AsyncStorage.removeItem('admin_token');
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Navigate based on auth state — only once auth check is done
  useEffect(() => {
    if (isAuthenticated === null) return; // still loading, don't redirect yet
    if (!rootNavigationState?.key) return; // wait until navigation is ready

    const inTabsGroup = segments[0] === '(tabs)';
    const inLoginPage = segments[0] === 'login';

    if (isAuthenticated && !inTabsGroup) {
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inLoginPage) {
      router.replace('/login');
    }
  }, [isAuthenticated, segments]);

  const signIn = useCallback((token: string) => {
    setIsAuthenticated(true);

    // Register Push Token
    (async () => {
      try {
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          await api.put('/auth/push-token', { expoPushToken: pushToken });
        }
      } catch (e) {
        console.log('Failed to register push token on sign in', e);
      }
    })();
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    setGlobalSignOut(signOut);
  }, [signOut]);

  // ALWAYS render Stack so navigation context is always available.
  // Show a loading overlay on top while auth is being checked.
  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, signOut }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="index" redirect />
      </Stack>

      {/* Loading overlay — shown on top of navigation until auth check finishes */}
      {isAuthenticated === null && (
        <View
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#0d9488" />
        </View>
      )}
    </AuthContext.Provider>
  );
}

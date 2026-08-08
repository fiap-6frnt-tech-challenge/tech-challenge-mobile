import '../global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { TransactionProvider } from '../src/contexts/TransactionContext';
import { ThemeProvider } from '../src/theme';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  function AuthGate({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
      if (loading) return;
      const inAuthGroup = segments[0] === '(auth)';
      if (!user && !inAuthGroup) router.replace('/(auth)/login');
      else if (user && inAuthGroup) router.replace('/(app)/(tabs)');
      SplashScreen.hideAsync();
    }, [user, loading, segments]);

    if (loading) return null;
    return children;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AuthGate>
            <TransactionProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(app)" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="storybook" />
              </Stack>
            </TransactionProvider>
          </AuthGate>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

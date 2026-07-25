import '../global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import { TransactionProvider } from '../src/contexts/TransactionContext';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TransactionProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(app)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="storybook" />
          </Stack>
        </TransactionProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

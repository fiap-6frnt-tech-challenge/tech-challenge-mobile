import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { SpikeAuthResult, SpikeStorageResult } from '@/src/spikes/firebaseRiskSpike';

type FirebaseRiskSpikeModule = typeof import('@/src/spikes/firebaseRiskSpike');

async function loadFirebaseRiskSpike(): Promise<FirebaseRiskSpikeModule> {
  return import('@/src/spikes/firebaseRiskSpike');
}

type Status = {
  kind: 'idle' | 'loading' | 'success' | 'error';
  message: string;
};

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function formatAuthResult(result: SpikeAuthResult): string {
  return [
    `operation: ${result.operation}`,
    `authenticated: ${result.isAuthenticated ? 'yes' : 'no'}`,
    `uid: ${result.uid ?? '-'}`,
    `email: ${result.email ?? '-'}`,
  ].join('\n');
}

function formatStorageResult(result: SpikeStorageResult): string {
  return [
    `path: ${result.fullPath}`,
    `contentType: ${result.contentType ?? '-'}`,
    `size: ${result.size}`,
    `deleted: ${result.deleted ? 'yes' : 'no'}`,
    `downloadUrl: ${result.downloadUrl}`,
  ].join('\n');
}

export default function FirebaseSpikeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>({
    kind: 'idle',
    message: 'Open this route only in development: /firebase-spike',
  });
  const [authResult, setAuthResult] = useState<SpikeAuthResult | null>(null);
  const [storageResult, setStorageResult] = useState<SpikeStorageResult | null>(null);

  const currentUid = authResult?.uid ?? null;

  if (!__DEV__) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-center text-base text-slate-900">
          Firebase spike is available only in development builds.
        </Text>
      </View>
    );
  }

  async function runAuthProbe() {
    setStatus({ kind: 'loading', message: 'Signing in or creating spike user...' });
    setStorageResult(null);

    try {
      const { signInOrCreateSpikeUser } = await loadFirebaseRiskSpike();
      const result = await signInOrCreateSpikeUser(email, password);
      setAuthResult(result);
      setStatus({ kind: 'success', message: 'Auth sign-in/create succeeded.' });
    } catch (error) {
      setStatus({ kind: 'error', message: formatError(error) });
    }
  }

  async function runPersistenceProbe() {
    setStatus({ kind: 'loading', message: 'Reading persisted Firebase Auth state...' });

    try {
      const { waitForAuthState } = await loadFirebaseRiskSpike();
      const user = await waitForAuthState();
      const result: SpikeAuthResult = {
        uid: user?.uid ?? null,
        email: user?.email ?? null,
        isAuthenticated: Boolean(user),
        operation: user ? 'current-session' : 'none',
      };
      setAuthResult(result);
      setStatus({
        kind: result.isAuthenticated ? 'success' : 'error',
        message: result.isAuthenticated
          ? 'Persisted session was restored.'
          : 'No persisted session found.',
      });
    } catch (error) {
      setStatus({ kind: 'error', message: formatError(error) });
    }
  }

  async function runStorageProbe() {
    if (!currentUid) {
      setStatus({ kind: 'error', message: 'Sign in before running the Storage probe.' });
      return;
    }

    setStatus({
      kind: 'loading',
      message: 'Uploading, reading metadata, and deleting spike file...',
    });

    try {
      const { runStorageUploadDeleteSpike } = await loadFirebaseRiskSpike();
      const result = await runStorageUploadDeleteSpike(currentUid);
      setStorageResult(result);
      setStatus({ kind: 'success', message: 'Storage upload/delete succeeded.' });
    } catch (error) {
      setStatus({ kind: 'error', message: formatError(error) });
    }
  }

  async function runSignOut() {
    setStatus({ kind: 'loading', message: 'Signing out...' });

    try {
      const { getCurrentSpikeSession, signOutSpikeUser } = await loadFirebaseRiskSpike();
      await signOutSpikeUser();
      const result = getCurrentSpikeSession();
      setAuthResult(result);
      setStorageResult(null);
      setStatus({ kind: 'success', message: 'Signed out.' });
    } catch (error) {
      setStatus({ kind: 'error', message: formatError(error) });
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white">
      <ScrollView contentContainerClassName="gap-4 p-5">
        <Text className="text-2xl font-bold text-slate-950">Firebase Risk Spike</Text>
        <Text className="text-sm text-slate-600">
          Use a disposable Firebase Auth user. Do not commit credentials.
        </Text>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-slate-800">Email</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            className="rounded border border-slate-300 px-3 py-2 text-base text-slate-950"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="spike-user@example.com"
            value={email}
          />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-slate-800">Password</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            className="rounded border border-slate-300 px-3 py-2 text-base text-slate-950"
            onChangeText={setPassword}
            placeholder="Minimum 6 characters"
            secureTextEntry
            value={password}
          />
        </View>

        <View className="gap-3">
          <Pressable
            className="items-center rounded bg-slate-950 px-4 py-3"
            disabled={status.kind === 'loading'}
            onPress={runAuthProbe}>
            <Text className="font-semibold text-white">Sign in or create user</Text>
          </Pressable>

          <Pressable
            className="items-center rounded bg-slate-800 px-4 py-3"
            disabled={status.kind === 'loading'}
            onPress={runPersistenceProbe}>
            <Text className="font-semibold text-white">Check persisted session</Text>
          </Pressable>

          <Pressable
            className="items-center rounded bg-emerald-700 px-4 py-3"
            disabled={status.kind === 'loading'}
            onPress={runStorageProbe}>
            <Text className="font-semibold text-white">Upload and delete Storage file</Text>
          </Pressable>

          <Pressable
            className="items-center rounded border border-slate-300 px-4 py-3"
            disabled={status.kind === 'loading'}
            onPress={runSignOut}>
            <Text className="font-semibold text-slate-950">Sign out</Text>
          </Pressable>
        </View>

        <View className="rounded border border-slate-200 bg-slate-50 p-4">
          <View className="flex-row items-center gap-2">
            {status.kind === 'loading' ? <ActivityIndicator /> : null}
            <Text className="font-semibold text-slate-950">Status</Text>
          </View>
          <Text className="mt-2 text-sm text-slate-700">{status.message}</Text>
        </View>

        {authResult ? (
          <View className="rounded border border-slate-200 bg-slate-50 p-4">
            <Text className="font-semibold text-slate-950">Auth result</Text>
            <Text className="mt-2 text-xs text-slate-700">{formatAuthResult(authResult)}</Text>
          </View>
        ) : null}

        {storageResult ? (
          <View className="rounded border border-slate-200 bg-slate-50 p-4">
            <Text className="font-semibold text-slate-950">Storage result</Text>
            <Text className="mt-2 text-xs text-slate-700">
              {formatStorageResult(storageResult)}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

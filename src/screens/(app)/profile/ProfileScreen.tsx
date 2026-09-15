import { useRouter } from 'expo-router';
import { Mail, User } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthFormError } from '@/src/components/features/auth/AuthFormError';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Text } from '@/src/components/ui/Text';
import { useAuth } from '@/src/contexts/AuthContext';
import { mapAuthError } from '@/src/services/auth.errors';
import { useTheme, type Theme } from '@/src/theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const name = user?.displayName?.trim() || 'Sua conta';
  const email = user?.email ?? '—';

  const handleSignOut = async () => {
    setError(null);
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/login');
    } catch (signOutError) {
      setError(mapAuthError(signOutError));
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no">
            <Text variant="h2" style={styles.avatarText}>
              {getInitials(name)}
            </Text>
          </View>
          <Text variant="h2" accessibilityRole="header">
            {name}
          </Text>
          <Text color="textSecondary">{email}</Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.row}>
            <User size={20} color={theme.colors.iconSecondary} />
            <View style={styles.rowText}>
              <Text variant="caption" color="textSecondary">
                Nome
              </Text>
              <Text>{name}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <Mail size={20} color={theme.colors.iconSecondary} />
            <View style={styles.rowText}>
              <Text variant="caption" color="textSecondary">
                E-mail
              </Text>
              <Text>{email}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.footer}>
          {error ? <AuthFormError message={error} testID="profile-signout-error" /> : null}

          <Button
            title="Sair da conta"
            variant="secondary"
            onPress={handleSignOut}
            loading={signingOut}
            accessibilityLabel="Sair da conta"
            testID="profile-signout"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    content: { flexGrow: 1, padding: theme.spacing.xl, gap: theme.spacing.xl },
    header: { alignItems: 'center', gap: theme.spacing.xs },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    avatarText: { color: theme.colors.textInverse },
    card: { padding: theme.spacing.lg, gap: theme.spacing.md },
    row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    rowText: { flex: 1, gap: 2 },
    separator: { height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border },
    footer: { marginTop: 'auto', gap: theme.spacing.md },
  });
}

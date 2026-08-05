import { useMemo, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/src/components/ui/Text';
import { useTheme, type Theme } from '@/src/theme';

export interface AuthScreenLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  testID?: string;
}

export function AuthScreenLayout({ title, subtitle, children, testID }: AuthScreenLayoutProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safeArea} testID={testID}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.select({ ios: 'padding', default: undefined })}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text variant="caption" color="primary" style={styles.brand}>
              BYTEBANK
            </Text>
            <Text variant="h1" accessibilityRole="header">
              {title}
            </Text>
            <Text color="textSecondary">{subtitle}</Text>
          </View>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    fill: { flex: 1 },
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: theme.spacing.xl,
      gap: theme.spacing.xl,
    },
    header: { gap: theme.spacing.xs },
    brand: { fontWeight: '700', letterSpacing: 1.5 },
  });
}

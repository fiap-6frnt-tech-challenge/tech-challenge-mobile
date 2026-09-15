import { CircleAlert } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/src/components/ui/Text';
import { useTheme, type Theme } from '@/src/theme';

export interface AuthFormErrorProps {
  message: string;
  testID?: string;
}

export function AuthFormError({ message, testID }: AuthFormErrorProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      testID={testID}>
      <CircleAlert size={18} color={theme.colors.danger} />
      <Text variant="caption" style={styles.message}>
        {message}
      </Text>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.radius.default,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.danger,
      backgroundColor: theme.colors.badgeWithdrawBg,
    },
    message: { flex: 1, color: theme.colors.danger },
  });
}

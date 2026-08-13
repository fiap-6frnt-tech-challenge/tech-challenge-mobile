import { ChartNoAxesCombined, TriangleAlert } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/ui/Button';
import { Text } from '@/src/components/ui/Text';
import { useTheme, type Theme } from '@/src/theme';

export interface DashboardFeedbackProps {
  variant: 'empty' | 'error';
  onAction: () => void;
}

const feedback = {
  empty: {
    title: 'Seu dashboard começa aqui',
    message: 'Adicione sua primeira transação para ver seus gráficos.',
    action: 'Adicionar transação',
    accessibilityLabel: 'Dashboard vazio. Adicione sua primeira transação para ver seus gráficos.',
  },
  error: {
    title: 'Não foi possível carregar o dashboard',
    message: 'Verifique sua conexão e tente novamente.',
    action: 'Tentar novamente',
    accessibilityLabel: 'Erro ao carregar o dashboard. Verifique sua conexão e tente novamente.',
  },
} as const;

export function DashboardFeedback({ variant, onAction }: DashboardFeedbackProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const content = feedback[variant];
  const Icon = variant === 'empty' ? ChartNoAxesCombined : TriangleAlert;

  return (
    <View
      testID={`dashboard-${variant}`}
      accessible
      accessibilityLabel={content.accessibilityLabel}
      accessibilityRole={variant === 'error' ? 'alert' : 'text'}
      accessibilityLiveRegion={variant === 'error' ? 'assertive' : 'polite'}
      style={styles.root}>
      <Icon
        accessible={false}
        size={40}
        color={variant === 'error' ? theme.colors.danger : theme.colors.primary}
        strokeWidth={1.75}
      />
      <Text variant="h2" style={styles.title}>
        {content.title}
      </Text>
      <Text color="textSecondary" style={styles.message}>
        {content.message}
      </Text>
      <Button title={content.action} onPress={onAction} style={styles.action} />
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    root: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing['2xl'],
    },
    title: {
      marginTop: theme.spacing.md,
      textAlign: 'center',
    },
    message: {
      marginTop: theme.spacing.xs,
      textAlign: 'center',
    },
    action: {
      alignSelf: 'stretch',
      marginTop: theme.spacing.lg,
    },
  });
}

import { ScrollText, SearchX, TriangleAlert } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/ui/Button';
import { Text } from '@/src/components/ui/Text';
import { useTheme, type Theme } from '@/src/theme';

export type TransactionListFeedbackVariant = 'empty' | 'error' | 'no-results';

export interface TransactionListFeedbackProps {
  variant: TransactionListFeedbackVariant;
  onAction: () => void;
}

const feedback = {
  empty: {
    icon: ScrollText,
    title: 'Nenhuma transação ainda',
    message: 'Adicione sua primeira transação para acompanhar suas finanças.',
    action: 'Adicionar transação',
    accessibilityLabel:
      'Nenhuma transação ainda. Adicione sua primeira transação para acompanhar suas finanças.',
  },
  error: {
    icon: TriangleAlert,
    title: 'Não foi possível carregar as transações',
    message: 'Verifique sua conexão e tente novamente.',
    action: 'Tentar novamente',
    accessibilityLabel: 'Erro ao carregar as transações. Verifique sua conexão e tente novamente.',
  },
  'no-results': {
    icon: SearchX,
    title: 'Nenhuma transação encontrada',
    message: 'Ajuste a busca ou limpe os filtros para tentar novamente.',
    action: 'Limpar filtros',
    accessibilityLabel:
      'Nenhuma transação encontrada. Ajuste a busca ou limpe os filtros para tentar novamente.',
  },
} as const;

export function TransactionListFeedback({ variant, onAction }: TransactionListFeedbackProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const content = feedback[variant];
  const Icon = content.icon;

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(content.accessibilityLabel);
    }
  }, [content.accessibilityLabel]);

  return (
    <View testID={`transactions-${variant}`} style={styles.root}>
      <View
        testID={`transactions-${variant}-announcement`}
        accessible
        accessibilityLabel={content.accessibilityLabel}
        accessibilityRole={variant === 'error' ? 'alert' : 'text'}
        accessibilityLiveRegion={variant === 'error' ? 'assertive' : 'polite'}
        style={styles.announcement}>
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
      </View>
      <Button
        title={content.action}
        onPress={onAction}
        variant={variant === 'empty' ? 'primary' : 'secondary'}
        style={styles.action}
        testID={`transactions-${variant}-action`}
      />
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    root: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing['2xl'],
    },
    announcement: {
      alignItems: 'center',
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

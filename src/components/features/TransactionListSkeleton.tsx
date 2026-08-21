import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/ui/Card';
import { useTheme, type Theme } from '@/src/theme';

export interface TransactionListSkeletonProps {
  count?: number;
  testID?: string;
}

export function TransactionListSkeleton({
  count = 8,
  testID = 'transactions-skeleton',
}: TransactionListSkeletonProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Carregando transações"
      accessibilityState={{ busy: true }}
      accessibilityLiveRegion="polite">
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        {Array.from({ length: count }, (_, index) => (
          <Card key={index} style={styles.card}>
            <View style={styles.leftSection}>
              <View style={[styles.iconCircle, styles.block]} />
              <View style={styles.details}>
                <View style={[styles.badge, styles.block]} />
                <View style={[styles.description, styles.block]} />
                <View style={[styles.date, styles.block]} />
              </View>
            </View>
            <View style={[styles.amount, styles.block]} />
          </Card>
        ))}
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.md,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: theme.spacing.sm,
    },
    details: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    block: {
      backgroundColor: theme.colors.border,
      opacity: 0.4,
    },
    badge: {
      width: 60,
      height: 16,
      borderRadius: 4,
    },
    description: {
      width: 120,
      height: 18,
      borderRadius: 4,
    },
    date: {
      width: 80,
      height: 12,
      borderRadius: 4,
    },
    amount: {
      width: 70,
      height: 20,
      borderRadius: 4,
    },
  });
}

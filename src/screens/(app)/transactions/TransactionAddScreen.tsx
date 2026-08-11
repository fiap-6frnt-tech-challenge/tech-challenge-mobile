import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TransactionForm } from '@/src/components/features/TransactionForm';
import { useTransactions } from '@/src/contexts/TransactionContext';
import type { TransactionFormValues } from '@/src/domain';
import { useTheme, type Theme } from '@/src/theme';

export default function TransactionAddScreen() {
  const router = useRouter();
  const { create } = useTransactions();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleSubmit = async ({
    type,
    category,
    amount,
    date,
    description,
  }: TransactionFormValues) => {
    await create({ type, category, amount, date, description });
    if (router.canGoBack()) router.back();
    else router.replace('/transactions');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <TransactionForm
        submitLabel="Adicionar transação"
        onSubmit={handleSubmit}
        testID="transaction-add-form"
      />
    </SafeAreaView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
  });
}

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TransactionForm } from '@/src/components/features/TransactionForm';
import { Button } from '@/src/components/ui/Button';
import { Text } from '@/src/components/ui/Text';
import { useTransactions } from '@/src/contexts/TransactionContext';
import type { TransactionFormValues } from '@/src/domain';
import { useTheme, type Theme } from '@/src/theme';

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { items, loading, update, remove } = useTransactions();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const transaction = items.find((item) => item.id === id);

  const goBackToList = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/transactions');
  };

  const handleSubmit = async ({
    type,
    category,
    amount,
    date,
    description,
  }: TransactionFormValues) => {
    if (!transaction) return;
    await update(transaction.id, { type, category, amount, date, description });
    goBackToList();
  };

  const handleDelete = async () => {
    if (!transaction) return;
    setDeleteError(null);
    setDeleting(true);
    try {
      await remove(transaction.id);
      goBackToList();
    } catch {
      setDeleteError('Não foi possível excluir a transação. Tente novamente.');
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert('Excluir transação', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: handleDelete },
    ]);
  };

  if (!transaction) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <View style={styles.centerContainer}>
          {loading || deleting ? (
            <ActivityIndicator color={theme.colors.primary} accessibilityLabel="Carregando" />
          ) : (
            <>
              <Text color="textSecondary" style={styles.emptyText}>
                Transação não encontrada
              </Text>
              <Button title="Voltar para a lista" onPress={goBackToList} variant="secondary" />
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <TransactionForm
        key={transaction.id}
        initialValues={{
          type: transaction.type,
          category: transaction.category,
          amount: transaction.amount,
          date: transaction.date,
          description: transaction.description,
        }}
        submitLabel="Salvar alterações"
        onSubmit={handleSubmit}
        footer={
          <View style={styles.footer}>
            <Button
              title="Excluir transação"
              onPress={confirmDelete}
              variant="secondary"
              loading={deleting}
              accessibilityLabel="Excluir transação"
              testID="transaction-delete"
            />
            {deleteError ? (
              <Text
                color="danger"
                accessibilityLiveRegion="polite"
                accessibilityRole="alert"
                testID="transaction-delete-error">
                {deleteError}
              </Text>
            ) : null}
          </View>
        }
        testID="transaction-details-form"
      />
    </SafeAreaView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    emptyText: { fontSize: 16, textAlign: 'center' },
    footer: { gap: theme.spacing.xs },
  });
}

import { useRouter } from 'expo-router';
import { useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TransactionForm } from '@/src/components/features/TransactionForm';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTransactions } from '@/src/contexts/TransactionContext';
import type { TransactionFormValues } from '@/src/domain';
import { useAttachments } from '@/src/hooks/useAttachments';
import { useTheme, type Theme } from '@/src/theme';

export default function TransactionAddScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { create, update } = useTransactions();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const createdIdRef = useRef<string | null>(null);

  const attachments = useAttachments({
    uid: user?.uid,
    onPersist: (txId, list) => update(txId, { attachments: list }),
  });

  const handleSubmit = async ({
    type,
    category,
    amount,
    date,
    description,
  }: TransactionFormValues) => {
    const payload = { type, category, amount, date, description };

    if (createdIdRef.current) await update(createdIdRef.current, payload);
    else createdIdRef.current = await create(payload);

    try {
      await attachments.commit(createdIdRef.current);
    } catch {
      return;
    }

    if (router.canGoBack()) router.back();
    else router.replace('/transactions');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <TransactionForm
        submitLabel="Adicionar transação"
        onSubmit={handleSubmit}
        attachments={attachments.items}
        onPickAttachment={attachments.add}
        onRemoveAttachment={attachments.remove}
        onAttachmentError={attachments.setError}
        attachmentError={attachments.error}
        canAddAttachment={attachments.canAdd}
        attachmentsBusy={attachments.busy}
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

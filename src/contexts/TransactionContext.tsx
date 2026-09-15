import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { Transaction } from '../domain';
import { transactionsService } from '../services/transactions.service';
import { useAuth } from './AuthContext';
import { storageService } from '../services/storage.service';

interface TransactionState {
  items: Transaction[];
  loading: boolean;
  error: string | null;
}

interface TransactionsContext extends TransactionState {
  create: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
  update: (id: string, patch: Partial<Transaction>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  removeAttachment: (txId: string, attachmentId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

type TransactionAction =
  { type: 'LOADING' } | { type: 'LOADED'; items: Transaction[] } | { type: 'ERROR'; error: string };

export function reducer(state: TransactionState, action: TransactionAction): TransactionState {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'LOADED':
      return { ...state, items: action.items, loading: false, error: null };
    case 'ERROR':
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
}

export const initialState: TransactionState = {
  items: [],
  loading: false,
  error: null,
};

const TransactionContext = createContext<TransactionsContext | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  const [subscriptionAttempt, setSubscriptionAttempt] = useState(0);
  const refreshWaitersRef = useRef<(() => void)[]>([]);

  const settleRefreshWaiters = useCallback(() => {
    const waiters = refreshWaitersRef.current;
    refreshWaitersRef.current = [];
    waiters.forEach((resolve) => resolve());
  }, []);

  const refresh = useCallback(
    () =>
      new Promise<void>((resolve) => {
        refreshWaitersRef.current.push(resolve);
        setSubscriptionAttempt((attempt) => attempt + 1);
      }),
    []
  );

  const create = useCallback(
    async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
      if (!user) throw new Error('Usuário não autenticado');
      try {
        return await transactionsService.create(user.uid, data);
      } catch (e) {
        dispatch({ type: 'ERROR', error: 'Falha ao criar transação' });
        throw e;
      }
    },
    [user]
  );

  const update = useCallback(
    async (id: string, patch: Partial<Transaction>) => {
      if (!user) throw new Error('Usuário não autenticado');
      try {
        await transactionsService.update(user.uid, id, patch);
      } catch (e) {
        dispatch({ type: 'ERROR', error: 'Falha ao atualizar transação' });
        throw e;
      }
    },
    [user]
  );

  const remove = useCallback(
    async (id: string) => {
      if (!user) throw new Error('Usuário não autenticado');
      try {
        await transactionsService.remove(user.uid, id);
      } catch (e) {
        dispatch({ type: 'ERROR', error: 'Falha ao remover transação' });
        throw e;
      }
    },
    [user]
  );

  const removeAttachment = useCallback(
    async (id: string, attachmentId: string) => {
      if (!user) throw new Error('Usuário não autenticado');
      const transaction = state.items.find((item) => item.id === id);
      if (!transaction) throw new Error('Transação não encontrada');
      const attachment = transaction.attachments?.find((item) => item.id === attachmentId);
      if (!attachment) throw new Error('Anexo não encontrado');
      const remainingAttachments = transaction.attachments?.filter(
        (item) => item.id !== attachmentId
      );
      try {
        await storageService.deleteReceipt(attachment.path);
        await transactionsService.update(user.uid, id, {
          attachments: remainingAttachments,
        });
      } catch (e) {
        dispatch({ type: 'ERROR', error: 'Falha ao remover anexo' });
        throw e;
      }
    },
    [state.items, user]
  );

  useEffect(() => {
    if (!user) {
      dispatch({ type: 'LOADED', items: [] });
      settleRefreshWaiters();
      return;
    }

    dispatch({ type: 'LOADING' });

    return transactionsService.subscribe(
      user.uid,
      (items) => {
        dispatch({ type: 'LOADED', items });
        settleRefreshWaiters();
      },
      (error) => {
        console.error('[TransactionContext] transaction subscription failed', error);
        dispatch({ type: 'ERROR', error: 'Falha ao carregar transações' });
        settleRefreshWaiters();
      }
    );
  }, [user, subscriptionAttempt, settleRefreshWaiters]);

  const value = useMemo<TransactionsContext>(
    () => ({ ...state, create, update, remove, removeAttachment, refresh }),
    [create, refresh, remove, removeAttachment, state, update]
  );

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}

export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactions must be used within TransactionProvider');
  return ctx;
}

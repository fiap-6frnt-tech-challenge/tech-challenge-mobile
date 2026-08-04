import { createContext, ReactNode, useCallback, useContext, useEffect, useReducer } from 'react';
import { Transaction } from '../domain';
import { transactionsService } from '../services/transactions.service';
import { useAuth } from './AuthContext';

interface TransactionState {
  items: Transaction[];
  loading: boolean;
  error: string | null;
}

interface TransactionsContext extends TransactionState {
  create: (data: Omit<Transaction, 'id' | 'userId'>) => Promise<void>;
  update: (id: string, patch: Partial<Transaction>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

type TransactionAction =
  | { type: 'LOADING' }
  | { type: 'LOADED'; items: Transaction[] }
  | { type: 'ERROR'; error: string };

function reducer(state: TransactionState, action: TransactionAction): TransactionState {
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

const initialState: TransactionState = {
  items: [],
  loading: false,
  error: null,
};

const TransactionContext = createContext<TransactionsContext | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  const refresh = useCallback(async () => {
    if (!user) {dispatch({ type: 'LOADED', items: [] }); return; }
    dispatch({ type: 'LOADING' });
    try { dispatch({ type: 'LOADED', items: await transactionsService.list(user.uid) }); }
    catch (e) { dispatch({ type: 'ERROR', error: 'Falha ao carregar transações' }); }
  }, [user]);
  
  const create = async (data: Omit<Transaction, 'id' | 'userId'>) => {
    if (!user) throw new Error('Usuário não autenticado');
    try {
      await transactionsService.create(user.uid, data);
      await refresh();
    } catch (e) {
      dispatch({ type: 'ERROR', error: 'Falha ao criar transação' });
      throw e;
    }
  };

  const update = async (id: string, patch: Partial<Transaction>) => {
    if (!user) throw new Error('Usuário não autenticado');
    try {
      await transactionsService.update(user.uid, id, patch);
      await refresh();
    } catch (e) {
      dispatch({ type: 'ERROR', error: 'Falha ao atualizar transação' });
      throw e;
    }
  };

  const remove = async (id: string) => {
    if (!user) throw new Error('Usuário não autenticado');
    try {
      await transactionsService.remove(user.uid, id);
      await refresh();
    } catch (e) {
      dispatch({ type: 'ERROR', error: 'Falha ao remover transação' });
      throw e;
    }
  };

  useEffect(() => { refresh() }, [user, refresh]);

  const value: TransactionsContext = {
    ...state,
    create,
    update,
    remove,
    refresh,
  };

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}

export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactions must be used within TransactionProvider');
  return ctx;
}

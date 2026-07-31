import { createContext, ReactNode, useContext, useReducer } from "react";
import { Transaction } from "../domain";

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

interface TransactionsContext extends TransactionState {
  create: (email: string, password: string) => Promise<void>;
  update: (email: string, password: string, name: string) => Promise<void>;
  remove: () => Promise<void>;
  refresh: () => Promise<void>;
}

type TransactionAction =
  | { type: 'LOADING' }
  | { type: 'LOADED'; transactions: Transaction[] }
  | { type: 'ERROR'; error: string };

function reducer(state: TransactionState, action: TransactionAction): TransactionState {
  switch (action.type) {
    case 'LOADING': return { ...state, loading: true, error: null };
    case 'LOADED': return { ...state, transactions: action.transactions, loading: false, error: null };
    case 'ERROR': return { ...state, loading: false, error: action.error };
    default: return state;
  }
}

const initialState: TransactionState = {
  transactions: [],
  loading: false,
  error: null,
};

const TransactionContext = createContext<TransactionsContext | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refresh = async () => {
    dispatch({ type: 'LOADING' });
    try {
      dispatch({ type: 'LOADED', transactions: [] });
    } catch {
      dispatch({ type: 'ERROR', error: 'Falha ao carregar transações' });
    }
  };

  const create = async () => {};
  const update = async () => {};
  const remove = async () => {};

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

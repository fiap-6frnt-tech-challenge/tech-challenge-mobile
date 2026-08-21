import { act, createElement, useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TRANSACTION_TYPE, type Transaction } from '@/src/domain';
import type { UseInfiniteTransactionsResult } from '@/src/hooks/useInfiniteTransactions';
import TransactionsScreen from './TransactionsScreen';

const routerMocks = vi.hoisted(() => ({ push: vi.fn() }));
const hookMocks = vi.hoisted(() => ({ loadMore: vi.fn(), refresh: vi.fn() }));
const hookStore = vi.hoisted(() => ({ listeners: new Set<() => void>() }));
const focusMocks = vi.hoisted(() => ({
  callback: null as null | (() => void | (() => void)),
}));

interface MockFlatListProps {
  data: Transaction[];
  renderItem: (info: { item: Transaction; index: number }) => ReactNode;
  keyExtractor: (item: Transaction) => string;
  ListHeaderComponent?: ReactNode;
  ListEmptyComponent?: ReactNode;
  ListFooterComponent?: ReactNode;
  [prop: string]: unknown;
}

vi.mock('expo-router', () => ({
  useRouter: () => ({ push: routerMocks.push }),
  useFocusEffect: (callback: () => void | (() => void)) => {
    focusMocks.callback = callback;
    useEffect(callback, [callback]);
  },
}));

vi.mock('react-native', () => ({
  ActivityIndicator: 'ActivityIndicator',
  FlatList: ({
    data,
    renderItem,
    keyExtractor,
    ListHeaderComponent,
    ListEmptyComponent,
    ListFooterComponent,
    ...props
  }: MockFlatListProps) =>
    createElement(
      'FlatList',
      props,
      ListHeaderComponent,
      data.length === 0
        ? ListEmptyComponent
        : data.map((item, index) =>
            createElement('Cell', { key: keyExtractor(item) }, renderItem({ item, index }))
          ),
      ListFooterComponent
    ),
  Pressable: 'Pressable',
  RefreshControl: 'RefreshControl',
  StyleSheet: { create: <T,>(styles: T) => styles, hairlineWidth: 1 },
  View: 'View',
}));

vi.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));

vi.mock('lucide-react-native', () => ({ ListFilter: 'ListFilter', Plus: 'Plus' }));

vi.mock('@/src/components/features/TransactionItem', () => ({
  TransactionItem: ({
    transaction,
    onPress,
  }: {
    transaction: Transaction;
    onPress: (id: string) => void;
  }) =>
    createElement('TransactionItem', {
      testID: `transaction-${transaction.id}`,
      onPress: () => onPress(transaction.id),
    }),
}));

vi.mock('@/src/components/features/TransactionListFeedback', () => ({
  TransactionListFeedback: ({ variant, onAction }: { variant: string; onAction: () => void }) =>
    createElement('TransactionListFeedback', {
      testID: `transactions-${variant}`,
      variant,
      onAction,
    }),
}));

vi.mock('@/src/components/features/TransactionListSkeleton', () => ({
  TransactionListSkeleton: () =>
    createElement('TransactionListSkeleton', { testID: 'transactions-skeleton' }),
}));

vi.mock('@/src/components/ui/Button', () => ({
  Button: ({ title, onPress }: { title: string; onPress?: () => void }) =>
    createElement('Button', { title, onPress }),
}));

vi.mock('@/src/components/ui/Text', () => ({
  Text: ({ children, ...props }: { children?: ReactNode }) =>
    createElement('Text', props, children),
}));

vi.mock('@/src/hooks/useInfiniteTransactions', () => ({
  useInfiniteTransactions: () =>
    useSyncExternalStore(
      (listener: () => void) => {
        hookStore.listeners.add(listener);
        return () => hookStore.listeners.delete(listener);
      },
      () => hookValue
    ),
}));

vi.mock('@/src/theme', () => ({
  useTheme: () => ({
    colors: {
      background: '#f3f3f3',
      badgeWithdrawBg: '#fee',
      border: '#c2c2c2',
      primary: '#6841f2',
      surface: '#fff',
      textInverse: '#fff',
    },
    radius: { default: 8 },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 },
  }),
}));

let hookValue: UseInfiniteTransactionsResult;
let renderer: ReactTestRenderer | undefined;

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const transaction = (id: string): Transaction => ({
  id,
  userId: 'user-1',
  type: TRANSACTION_TYPE.WITHDRAWAL,
  category: 'food',
  amount: 42,
  date: '2026-08-19',
  description: `Transação ${id}`,
  createdAt: '2026-08-19T12:00:00.000Z',
});

function createHookValue(
  overrides: Partial<UseInfiniteTransactionsResult> = {}
): UseInfiniteTransactionsResult {
  return {
    items: [],
    loading: false,
    refreshing: false,
    hasMore: false,
    error: null,
    loadMore: hookMocks.loadMore,
    refresh: hookMocks.refresh,
    ...overrides,
  };
}

function renderScreen(): ReactTestRenderer {
  act(() => {
    renderer = create(<TransactionsScreen />);
  });

  if (!renderer) throw new Error('Transactions screen did not render');
  return renderer;
}

function updateHookValue(overrides: Partial<UseInfiniteTransactionsResult>) {
  hookValue = { ...hookValue, ...overrides };
  act(() => {
    hookStore.listeners.forEach((listener) => listener());
  });
}

function findByTestId(tree: ReactTestRenderer, testID: string) {
  return tree.root.findByProps({ testID });
}

function queryByTestId(tree: ReactTestRenderer, testID: string) {
  return tree.root.findAllByProps({ testID })[0];
}

function list(tree: ReactTestRenderer) {
  return findByTestId(tree, 'transactions-list');
}

beforeEach(() => {
  hookValue = createHookValue();
  hookStore.listeners.clear();
  focusMocks.callback = null;
  vi.clearAllMocks();
});

afterEach(() => {
  if (renderer) {
    act(() => renderer?.unmount());
    renderer = undefined;
  }
});

describe('TransactionsScreen', () => {
  it('mostra o skeleton enquanto carrega a primeira página', () => {
    hookValue = createHookValue({ loading: true, hasMore: true });
    const tree = renderScreen();

    expect(queryByTestId(tree, 'transactions-skeleton')).toBeDefined();
    expect(queryByTestId(tree, 'transactions-empty')).toBeUndefined();
  });

  it('renderiza os itens carregados e abre o detalhe ao tocar', () => {
    hookValue = createHookValue({ items: [transaction('t1'), transaction('t2')] });
    const tree = renderScreen();

    expect(queryByTestId(tree, 'transaction-t1')).toBeDefined();
    expect(queryByTestId(tree, 'transaction-t2')).toBeDefined();

    act(() => findByTestId(tree, 'transaction-t1').props.onPress());

    expect(routerMocks.push).toHaveBeenCalledWith({
      pathname: '/transactionDetails',
      params: { id: 't1' },
    });
  });

  it('carrega a próxima página ao chegar no fim e mostra o spinner no rodapé', () => {
    hookValue = createHookValue({ items: [transaction('t1')], hasMore: true });
    const tree = renderScreen();

    act(() => list(tree).props.onEndReached());
    expect(hookMocks.loadMore).toHaveBeenCalledTimes(1);

    updateHookValue({ loading: true });
    expect(queryByTestId(tree, 'transactions-footer-spinner')).toBeDefined();
  });

  it('para de buscar quando não há mais páginas', () => {
    hookValue = createHookValue({ items: [transaction('t1')], hasMore: false });
    const tree = renderScreen();

    expect(list(tree).props.onEndReached).toBeUndefined();
    expect(list(tree).props.onEndReachedThreshold).toBe(0.5);
    expect(queryByTestId(tree, 'transactions-footer-end')).toBeDefined();
    expect(hookMocks.loadMore).not.toHaveBeenCalled();
  });

  it('reinicia a lista no pull-to-refresh', () => {
    hookValue = createHookValue({ items: [transaction('t1')] });
    const tree = renderScreen();

    act(() => list(tree).props.refreshControl.props.onRefresh());

    expect(hookMocks.refresh).toHaveBeenCalledTimes(1);

    updateHookValue({ refreshing: true });
    expect(list(tree).props.refreshControl.props.refreshing).toBe(true);
  });

  it('mostra o estado vazio quando não há transações', () => {
    const tree = renderScreen();

    expect(findByTestId(tree, 'transactions-empty').props.variant).toBe('empty');

    act(() => findByTestId(tree, 'transactions-empty').props.onAction());
    expect(routerMocks.push).toHaveBeenCalledWith('/transactionAdd');
  });

  it('mostra erro no rodapé com nova tentativa quando a paginação falha', () => {
    hookValue = createHookValue({
      items: [transaction('t1')],
      hasMore: true,
      error: 'Falha ao carregar transações',
    });
    const tree = renderScreen();

    const footer = findByTestId(tree, 'transactions-footer-error');
    expect(footer).toBeDefined();

    act(() => tree.root.findByProps({ title: 'Tentar novamente' }).props.onPress());
    expect(hookMocks.loadMore).toHaveBeenCalledTimes(1);
  });

  it('mostra o erro em tela cheia quando a lista está vazia', () => {
    hookValue = createHookValue({ error: 'Falha ao carregar transações' });
    const tree = renderScreen();

    expect(findByTestId(tree, 'transactions-error').props.variant).toBe('error');

    act(() => findByTestId(tree, 'transactions-error').props.onAction());
    expect(hookMocks.refresh).toHaveBeenCalledTimes(1);
  });

  it('atualiza a lista ao voltar o foco, sem duplicar a carga inicial', () => {
    renderScreen();

    expect(hookMocks.refresh).not.toHaveBeenCalled();

    act(() => {
      focusMocks.callback?.();
    });

    expect(hookMocks.refresh).toHaveBeenCalledTimes(1);
  });
});

import {
  act,
  createElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TRANSACTION_TYPE, type Transaction } from '@/src/domain';
import type { UseInfiniteTransactionsResult } from '@/src/hooks/useInfiniteTransactions';
import type { TxFilter } from '@/src/services/transactions.service';
import TransactionsScreen from './TransactionsScreen';

const routerMocks = vi.hoisted(() => ({ push: vi.fn() }));
const hookMocks = vi.hoisted(() => ({ loadMore: vi.fn(), refresh: vi.fn() }));
const hookStore = vi.hoisted(() => ({ listeners: new Set<() => void>() }));
const filterMocks = vi.hoisted(() => ({
  current: {} as TxFilter,
  scrollToOffset: vi.fn(),
}));
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
}

interface LayoutEvent {
  nativeEvent: { layout: { height: number } };
}

const layoutEvent = (height: number): LayoutEvent => ({ nativeEvent: { layout: { height } } });

vi.mock('expo-router', () => ({
  useRouter: () => ({ push: routerMocks.push }),
  useFocusEffect: (callback: () => void | (() => void)) => {
    focusMocks.callback = callback;
    useEffect(callback, [callback]);
  },
}));

vi.mock('react-native', () => ({
  ActivityIndicator: 'ActivityIndicator',
  FlatList: forwardRef<unknown, MockFlatListProps>(
    (
      {
        data,
        renderItem,
        keyExtractor,
        ListHeaderComponent,
        ListEmptyComponent,
        ListFooterComponent,
        ...props
      },
      ref
    ) => {
      useImperativeHandle(ref, () => ({ scrollToOffset: filterMocks.scrollToOffset }));

      return createElement(
        'FlatList',
        props,
        ListHeaderComponent,
        data.length === 0
          ? ListEmptyComponent
          : data.map((item, index) =>
              createElement('Cell', { key: keyExtractor(item) }, renderItem({ item, index }))
            ),
        ListFooterComponent
      );
    }
  ),
  Platform: { OS: 'android' },
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
    onLayout,
  }: {
    transaction: Transaction;
    onPress: (id: string) => void;
    onLayout?: (event: LayoutEvent) => void;
  }) =>
    createElement('TransactionItem', {
      testID: `transaction-${transaction.id}`,
      onPress: () => onPress(transaction.id),
      onLayout,
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

vi.mock('@/src/components/ui/SearchInput', () => ({
  SearchInput: (props: Record<string, unknown>) => createElement('SearchInput', props),
}));

vi.mock('@/src/components/ui/FilterSheet', () => ({
  FilterSheet: (props: Record<string, unknown>) => createElement('FilterSheet', props),
}));

vi.mock('@/src/components/ui/Chip', () => ({
  Chip: (props: Record<string, unknown>) => createElement('Chip', props),
}));

vi.mock('@/src/components/ui/Text', () => ({
  Text: ({ children, ...props }: { children?: ReactNode }) =>
    createElement('Text', props, children),
}));

vi.mock('@/src/hooks/useInfiniteTransactions', () => ({
  useInfiniteTransactions: (filter: TxFilter) => {
    useEffect(() => {
      filterMocks.current = filter;
    }, [filter]);

    return useSyncExternalStore(
      (listener: () => void) => {
        hookStore.listeners.add(listener);
        return () => hookStore.listeners.delete(listener);
      },
      () => hookValue
    );
  },
}));

vi.mock('@/src/theme', () => ({
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 },
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
  filterMocks.current = {};
  filterMocks.scrollToOffset.mockReset();
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
    expect(findByTestId(tree, 'transactions-search').props.resultCount).toBeUndefined();
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

  it('só fornece getItemLayout depois de medir a linha e o cabeçalho', () => {
    hookValue = createHookValue({ items: [transaction('t1'), transaction('t2')] });
    const tree = renderScreen();

    expect(list(tree).props.getItemLayout).toBeUndefined();
    expect(findByTestId(tree, 'transaction-t2').props.onLayout).toBeUndefined();

    act(() => findByTestId(tree, 'transactions-filters-header').props.onLayout(layoutEvent(96)));
    expect(list(tree).props.getItemLayout).toBeUndefined();

    act(() => findByTestId(tree, 'transaction-t1').props.onLayout(layoutEvent(76.4)));
    expect(list(tree).props.getItemLayout).toBeDefined();
  });

  it('soma o padding do conteúdo e a altura do cabeçalho ao offset de cada item', () => {
    hookValue = createHookValue({ items: [transaction('t1'), transaction('t2')] });
    const tree = renderScreen();

    act(() => findByTestId(tree, 'transactions-filters-header').props.onLayout(layoutEvent(96)));
    act(() => findByTestId(tree, 'transaction-t1').props.onLayout(layoutEvent(76)));

    const getItemLayout = list(tree).props.getItemLayout;
    expect(getItemLayout(hookValue.items, 0)).toEqual({ length: 76, offset: 108, index: 0 });
    expect(getItemLayout(hookValue.items, 2)).toEqual({ length: 76, offset: 260, index: 2 });
  });

  it('recalcula os offsets quando os chips mudam a altura do cabeçalho', () => {
    hookValue = createHookValue({ items: [transaction('t1')] });
    const tree = renderScreen();

    act(() => findByTestId(tree, 'transactions-filters-header').props.onLayout(layoutEvent(96)));
    act(() => findByTestId(tree, 'transaction-t1').props.onLayout(layoutEvent(76)));
    act(() => findByTestId(tree, 'transactions-filters-header').props.onLayout(layoutEvent(140)));

    expect(list(tree).props.getItemLayout(hookValue.items, 1)).toEqual({
      length: 76,
      offset: 228,
      index: 1,
    });
  });

  it('descarta as views fora da tela no Android', () => {
    const tree = renderScreen();

    expect(list(tree).props.removeClippedSubviews).toBe(true);
  });

  it('carrega a próxima página ao chegar no fim e mostra o spinner no rodapé', () => {
    hookValue = createHookValue({ items: [transaction('t1')], hasMore: true });
    const tree = renderScreen();

    expect(findByTestId(tree, 'transactions-search').props.resultCount).toBe(1);

    act(() => list(tree).props.onEndReached());
    expect(hookMocks.loadMore).toHaveBeenCalledTimes(1);

    updateHookValue({ loading: true });
    expect(queryByTestId(tree, 'transactions-footer-spinner')).toBeDefined();
    expect(findByTestId(tree, 'transactions-search').props.resultCount).toBe(1);
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
    const announcement = footer.find((node) => node.props.accessibilityLiveRegion === 'polite');
    expect(announcement.props.accessibilityRole).toBe('alert');

    act(() => tree.root.findByProps({ title: 'Tentar novamente' }).props.onPress());
    expect(hookMocks.loadMore).toHaveBeenCalledTimes(1);
  });

  it('mostra o erro em tela cheia quando a lista está vazia', () => {
    hookValue = createHookValue({ error: 'Falha ao carregar transações' });
    const tree = renderScreen();

    expect(findByTestId(tree, 'transactions-error').props.variant).toBe('error');
    expect(findByTestId(tree, 'transactions-search').props.resultCount).toBeUndefined();

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

  it('aplica busca com debounce de 300 ms e anuncia os itens carregados', () => {
    hookValue = createHookValue({ items: [transaction('t1'), transaction('t2')] });
    const tree = renderScreen();
    const search = findByTestId(tree, 'transactions-search');

    expect(search.props.debounceMs).toBe(300);
    expect(search.props.resultCount).toBe(2);

    act(() => search.props.onSearch('  mercado  '));

    expect(filterMocks.current).toEqual({ search: 'mercado' });
    expect(filterMocks.scrollToOffset).toHaveBeenCalledWith({ offset: 0, animated: false });
  });

  it('mantém o botão de filtros quadrado e alinhado à altura do campo de busca', () => {
    const tree = renderScreen();
    const filterButton = findByTestId(tree, 'transactions-filter-button');

    expect(filterButton.props.style).toMatchObject({ width: 44, height: 44 });
  });

  it('aplica filtros estruturados preservando a busca ativa', () => {
    const tree = renderScreen();
    act(() => findByTestId(tree, 'transactions-search').props.onSearch('mercado'));
    act(() => findByTestId(tree, 'transactions-filter-button').props.onPress());

    const sheet = findByTestId(tree, 'transactions-filter-sheet');
    expect(sheet.props.visible).toBe(true);

    act(() =>
      sheet.props.onApply({
        type: TRANSACTION_TYPE.WITHDRAWAL,
        categories: ['food', 'transport'],
        dateFrom: '2026-08-01',
        dateTo: '2026-08-31',
      })
    );

    expect(filterMocks.current).toEqual({
      search: 'mercado',
      type: TRANSACTION_TYPE.WITHDRAWAL,
      categories: ['food', 'transport'],
      dateFrom: '2026-08-01',
      dateTo: '2026-08-31',
    });
    expect(findByTestId(tree, 'transactions-filter-button').props.accessibilityLabel).toBe(
      'Abrir filtros, 5 ativos'
    );
    expect(filterMocks.scrollToOffset).toHaveBeenCalledTimes(2);
    expect(filterMocks.scrollToOffset).toHaveBeenLastCalledWith({ offset: 0, animated: false });
  });

  it('usa singular no rótulo de um filtro ativo', () => {
    const tree = renderScreen();
    act(() => findByTestId(tree, 'transactions-filter-button').props.onPress());
    act(() =>
      findByTestId(tree, 'transactions-filter-sheet').props.onApply({
        type: TRANSACTION_TYPE.WITHDRAWAL,
      })
    );

    expect(findByTestId(tree, 'transactions-filter-button').props.accessibilityLabel).toBe(
      'Abrir filtros, 1 ativo'
    );
  });

  it('renderiza chips ativos e remove somente o filtro escolhido', () => {
    const tree = renderScreen();
    act(() => findByTestId(tree, 'transactions-filter-button').props.onPress());
    act(() =>
      findByTestId(tree, 'transactions-filter-sheet').props.onApply({
        type: TRANSACTION_TYPE.WITHDRAWAL,
        categories: ['food', 'transport'],
        dateFrom: '2026-08-01',
      })
    );

    expect(findByTestId(tree, 'transactions-filter-type').props.label).toBe('Saque');
    expect(findByTestId(tree, 'transactions-filter-category:food').props.label).toBe('Alimentação');

    act(() => findByTestId(tree, 'transactions-filter-category:food').props.onRemove());

    expect(filterMocks.current).toEqual({
      type: TRANSACTION_TYPE.WITHDRAWAL,
      categories: ['transport'],
      dateFrom: '2026-08-01',
    });
    expect(filterMocks.scrollToOffset).toHaveBeenCalledTimes(2);
    expect(filterMocks.scrollToOffset).toHaveBeenLastCalledWith({ offset: 0, animated: false });
  });

  it('mostra nenhum resultado para filtro vazio e limpa todos os filtros', () => {
    const tree = renderScreen();
    act(() => findByTestId(tree, 'transactions-search').props.onSearch('inexistente'));

    expect(findByTestId(tree, 'transactions-no-results').props.variant).toBe('no-results');

    act(() => findByTestId(tree, 'transactions-no-results').props.onAction());

    expect(filterMocks.current).toEqual({});
    expect(findByTestId(tree, 'transactions-search').props.defaultValue).toBe('');
    expect(findByTestId(tree, 'transactions-empty').props.variant).toBe('empty');
    expect(filterMocks.scrollToOffset).toHaveBeenCalledTimes(2);
    expect(filterMocks.scrollToOffset).toHaveBeenLastCalledWith({ offset: 0, animated: false });
  });
});

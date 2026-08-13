import {
  createElement,
  forwardRef,
  useImperativeHandle,
  useSyncExternalStore,
  type ElementType,
  type ReactNode,
} from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AnimatedSectionGroupHandle } from '@/src/components/ui/motion';
import type { useDashboardData } from '@/src/hooks/useDashboardData';
import DashboardScreen from './DashboardScreen';

type DashboardData = ReturnType<typeof useDashboardData>;

const routerMocks = vi.hoisted(() => ({ push: vi.fn() }));
const motionMocks = vi.hoisted(() => ({ replay: vi.fn() }));
const dashboardStore = vi.hoisted(() => ({ listeners: new Set<() => void>() }));

vi.mock('expo-router', () => ({
  useRouter: () => ({ push: routerMocks.push }),
}));

vi.mock('react-native', () => ({
  RefreshControl: 'RefreshControl',
  ScrollView: 'ScrollView',
  StyleSheet: { create: <T,>(styles: T) => styles },
  View: 'View',
}));

vi.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
}));

vi.mock('lucide-react-native', () => ({
  ArrowDownLeft: 'ArrowDownLeft',
  ArrowUpRight: 'ArrowUpRight',
  Lightbulb: 'Lightbulb',
  Wallet: 'Wallet',
}));

vi.mock('@/src/components/features/dashboard/DashboardFeedback', () => ({
  DashboardFeedback: ({
    variant,
    onAction,
  }: {
    variant: 'empty' | 'error';
    onAction: () => void;
  }) =>
    createElement(
      'DashboardFeedback',
      { testID: `dashboard-${variant}`, variant },
      createElement('Button', {
        title: variant === 'empty' ? 'Adicionar transação' : 'Tentar novamente',
        onPress: onAction,
      })
    ),
}));

vi.mock('@/src/components/features/dashboard/DashboardSkeleton', () => ({
  DashboardSkeleton: () => createElement('DashboardSkeleton', { testID: 'dashboard-skeleton' }),
}));

vi.mock('@/src/components/ui/Button', () => ({
  Button: ({ title, onPress, ...props }: { title: string; onPress?: () => void }) =>
    createElement('Button', { title, onPress, ...props }),
}));

vi.mock('@/src/components/ui/Card', () => ({
  Card: ({ children, ...props }: { children?: ReactNode }) =>
    createElement('Card', props, children),
}));

vi.mock('@/src/components/ui/KpiCard', () => ({
  KpiCard: ({ testID, ...props }: { testID?: string }) =>
    createElement('KpiCard', { testID, ...props }),
}));

vi.mock('@/src/components/ui/SummaryTile', () => ({
  SummaryTile: ({ testID, ...props }: { testID?: string }) =>
    createElement('SummaryTile', { testID, ...props }),
}));

vi.mock('@/src/components/ui/Text', () => ({
  Text: ({ children, ...props }: { children?: ReactNode }) =>
    createElement('Text', props, children),
}));

vi.mock('@/src/components/ui/charts', () => ({
  BalanceLineChart: ({ testID, ...props }: { testID?: string }) =>
    createElement('BalanceLineChart', { testID, ...props }),
  CategoryPieChart: ({ testID, ...props }: { testID?: string }) =>
    createElement('CategoryPieChart', { testID, ...props }),
  ExpenseBarChart: ({ testID, ...props }: { testID?: string }) =>
    createElement('ExpenseBarChart', { testID, ...props }),
}));

vi.mock('@/src/components/ui/motion', () => ({
  AnimatedSection: ({ children, ...props }: { children?: ReactNode }) =>
    createElement('AnimatedSection', props, children),
  AnimatedSectionGroup: forwardRef<AnimatedSectionGroupHandle, { children: ReactNode }>(
    ({ children }, ref) => {
      useImperativeHandle(ref, () => ({ replay: motionMocks.replay }), []);
      return createElement('AnimatedSectionGroup', null, children);
    }
  ),
}));

vi.mock('@/src/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { displayName: 'Ana Silva', email: 'ana@example.com' } }),
}));

vi.mock('@/src/hooks/useDashboardData', () => ({
  useDashboardData: () =>
    useSyncExternalStore(
      (listener) => {
        dashboardStore.listeners.add(listener);
        return () => dashboardStore.listeners.delete(listener);
      },
      () => dashboardData
    ),
}));

vi.mock('@/src/theme', () => ({
  spacing: { md: 12, lg: 16 },
  useTheme: () => ({
    colors: {
      background: '#fff',
      badgeTransferBg: '#eee',
      badgeWithdrawBg: '#fee',
      primary: '#6841f2',
      text: '#111',
    },
    radius: { default: 8 },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 },
  }),
}));

let dashboardData: DashboardData;
let renderer: ReactTestRenderer | undefined;
const scrollViewType = 'ScrollView' as unknown as ElementType;

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

function createDashboardData(overrides: Partial<DashboardData> = {}): DashboardData {
  return {
    totals: { income: 1600, expense: 400, balance: 1200 },
    byMonth: [
      { month: '2026-07', income: 1000, expense: 300 },
      { month: '2026-08', income: 1600, expense: 400 },
    ],
    byCategory: [{ category: 'food', total: 400 }],
    balanceOverTime: [
      { date: '2026-08-01', balance: 1000 },
      { date: '2026-08-02', balance: 1200 },
    ],
    topCategory: { category: 'food', total: 400 },
    loading: false,
    error: null,
    isEmpty: false,
    refresh: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function renderScreen(): ReactTestRenderer {
  act(() => {
    renderer = create(<DashboardScreen />);
  });

  if (!renderer) throw new Error('Dashboard screen did not render');
  return renderer;
}

function findByTestId(tree: ReactTestRenderer, testID: string) {
  return tree.root.findByProps({ testID });
}

function findAllByTestId(tree: ReactTestRenderer, testID: string) {
  return tree.root.findAllByProps({ testID });
}

function refreshControl(tree: ReactTestRenderer) {
  return tree.root.findByType(scrollViewType).props.refreshControl;
}

function updateDashboardData(overrides: Partial<DashboardData>) {
  dashboardData = { ...dashboardData, ...overrides };
  dashboardStore.listeners.forEach((listener) => listener());
}

function expectDashboardContent(tree: ReactTestRenderer) {
  expect(findByTestId(tree, 'dashboard-balance')).toBeDefined();
  expect(findByTestId(tree, 'dashboard-income')).toBeDefined();
  expect(findByTestId(tree, 'dashboard-expense')).toBeDefined();
  expect(findByTestId(tree, 'dashboard-bar-chart')).toBeDefined();
  expect(findByTestId(tree, 'dashboard-pie-chart')).toBeDefined();
  expect(findByTestId(tree, 'dashboard-line-chart')).toBeDefined();
}

function deferred() {
  let resolve!: () => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<void>((done, fail) => {
    resolve = done;
    reject = fail;
  });

  return { promise, resolve, reject };
}

beforeEach(() => {
  dashboardData = createDashboardData();
  dashboardStore.listeners.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  if (renderer) {
    act(() => renderer?.unmount());
    renderer = undefined;
  }
});

describe('DashboardScreen', () => {
  it('shows only the initial-load skeleton while empty dashboard data is loading', () => {
    dashboardData = createDashboardData({ loading: true, isEmpty: true });

    const tree = renderScreen();

    expect(findByTestId(tree, 'dashboard-skeleton')).toBeDefined();
    expect(findAllByTestId(tree, 'dashboard-balance')).toHaveLength(0);
  });

  it('routes the empty-state action to transaction creation', () => {
    dashboardData = createDashboardData({ isEmpty: true });

    const tree = renderScreen();
    const action = tree.root.findByProps({ title: 'Adicionar transação' });

    act(() => action.props.onPress());

    expect(findByTestId(tree, 'dashboard-empty')).toBeDefined();
    expect(routerMocks.push).toHaveBeenCalledWith('/transactionAdd');
  });

  it('keeps full error feedback mounted while an empty retry clears the context error', async () => {
    const retry = deferred();
    const refresh = vi.fn(() => {
      updateDashboardData({ loading: true, error: null, isEmpty: true });
      return retry.promise;
    });
    dashboardData = createDashboardData({ error: 'Sem conexão', isEmpty: true, refresh });

    const tree = renderScreen();
    const action = tree.root.findByProps({ title: 'Tentar novamente' });
    let result: unknown;

    act(() => {
      result = action.props.onPress();
    });

    try {
      expect(refresh).toHaveBeenCalledOnce();
      expect(findByTestId(tree, 'dashboard-error')).toBeDefined();
      expect(findAllByTestId(tree, 'dashboard-empty')).toHaveLength(0);
    } finally {
      await act(async () => {
        updateDashboardData({ loading: false, error: null, isEmpty: false });
        retry.resolve();
        await retry.promise;
        await result;
        await Promise.resolve();
      });
    }

    expect(result).toBeUndefined();
    expectDashboardContent(tree);
    expect(findAllByTestId(tree, 'dashboard-error')).toHaveLength(0);
  });

  it('returns to full error feedback when an empty retry completes with an error', async () => {
    const retry = deferred();
    const refresh = vi.fn(() => {
      updateDashboardData({ loading: true, error: null, isEmpty: true });
      return retry.promise;
    });
    dashboardData = createDashboardData({ error: 'Sem conexão', isEmpty: true, refresh });

    const tree = renderScreen();
    const action = tree.root.findByProps({ title: 'Tentar novamente' });
    let result: unknown;

    act(() => {
      result = action.props.onPress();
    });

    try {
      expect(findByTestId(tree, 'dashboard-error')).toBeDefined();
      expect(findAllByTestId(tree, 'dashboard-empty')).toHaveLength(0);
    } finally {
      await act(async () => {
        updateDashboardData({ loading: false, error: 'Sem conexão', isEmpty: true });
        retry.resolve();
        await retry.promise;
        await result;
        await Promise.resolve();
      });
    }

    expect(findByTestId(tree, 'dashboard-error')).toBeDefined();
    expect(findAllByTestId(tree, 'dashboard-empty')).toHaveLength(0);
  });

  it('keeps full error feedback mounted when pull refresh clears an empty context error', async () => {
    const refresh = deferred();
    const request = vi.fn(() => {
      updateDashboardData({ loading: true, error: null, isEmpty: true });
      return refresh.promise;
    });
    dashboardData = createDashboardData({ error: 'Sem conexão', isEmpty: true, refresh: request });

    const tree = renderScreen();

    act(() => refreshControl(tree).props.onRefresh());

    try {
      expect(request).toHaveBeenCalledOnce();
      expect(findByTestId(tree, 'dashboard-error')).toBeDefined();
      expect(findAllByTestId(tree, 'dashboard-empty')).toHaveLength(0);
    } finally {
      await act(async () => {
        updateDashboardData({ loading: false, error: 'Sem conexão', isEmpty: true });
        refresh.resolve();
        await refresh.promise;
        await Promise.resolve();
      });
    }

    expect(findByTestId(tree, 'dashboard-error')).toBeDefined();
  });

  it('deduplicates rapid full-error retries until the shared request settles', async () => {
    const retry = deferred();
    const refresh = vi.fn(() => {
      updateDashboardData({ loading: true, error: null, isEmpty: true });
      return retry.promise;
    });
    dashboardData = createDashboardData({ error: 'Sem conexão', isEmpty: true, refresh });

    const tree = renderScreen();
    const action = tree.root.findByProps({ title: 'Tentar novamente' });

    act(() => {
      action.props.onPress();
      action.props.onPress();
    });

    try {
      expect(refresh).toHaveBeenCalledOnce();
      expect(findByTestId(tree, 'dashboard-error')).toBeDefined();
      expect(refreshControl(tree).props.refreshing).toBe(true);
      expect(motionMocks.replay).not.toHaveBeenCalled();
    } finally {
      await act(async () => {
        updateDashboardData({ loading: false, error: 'Sem conexão', isEmpty: true });
        retry.resolve();
        await retry.promise;
        await Promise.resolve();
      });
    }

    expect(refreshControl(tree).props.refreshing).toBe(false);
    expect(motionMocks.replay).toHaveBeenCalledOnce();
  });

  it('retains the S2-06 KPI and chart content for non-empty data', () => {
    const tree = renderScreen();

    expectDashboardContent(tree);
  });

  it('keeps content visible behind the pull-to-refresh spinner until refresh resolves', async () => {
    const refresh = deferred();
    dashboardData = createDashboardData({ refresh: vi.fn(() => refresh.promise) });

    const tree = renderScreen();
    const control = refreshControl(tree);

    act(() => {
      void control.props.onRefresh();
    });

    expect(dashboardData.refresh).toHaveBeenCalledOnce();
    expect(refreshControl(tree).props.refreshing).toBe(true);
    expect(findAllByTestId(tree, 'dashboard-skeleton')).toHaveLength(0);
    expectDashboardContent(tree);
    expect(motionMocks.replay).not.toHaveBeenCalled();

    await act(async () => {
      refresh.resolve();
      await refresh.promise;
    });

    expect(refreshControl(tree).props.refreshing).toBe(false);
    expect(motionMocks.replay).toHaveBeenCalledOnce();
  });

  it('keeps content visible and announces a failed refresh with a separately focusable retry', () => {
    dashboardData = createDashboardData({ error: 'Não foi possível atualizar os dados' });

    const tree = renderScreen();
    const errorRoot = findByTestId(tree, 'dashboard-refresh-error');
    const announcement = findByTestId(tree, 'dashboard-refresh-error-announcement');
    const action = errorRoot.findByProps({ title: 'Tentar novamente' });

    expectDashboardContent(tree);
    expect(errorRoot.props.accessible).not.toBe(true);
    expect(announcement.parent).toBe(errorRoot);
    expect(action.parent).toBe(errorRoot);
    expect(announcement.props.accessibilityRole).toBe('alert');
    expect(announcement.props.accessibilityLiveRegion).toBe('assertive');
    expect(announcement.props.accessibilityLabel).toBe(
      'Não foi possível atualizar os dados. Dados anteriores continuam visíveis.'
    );
  });

  it('invokes inline stale-data retry through a void event handler', async () => {
    dashboardData = createDashboardData({ error: 'Não foi possível atualizar os dados' });

    const tree = renderScreen();
    const action = findByTestId(tree, 'dashboard-refresh-error').findByProps({
      title: 'Tentar novamente',
    });
    let result: unknown;

    await act(async () => {
      result = action.props.onPress();
      await Promise.resolve();
    });

    expect(result).toBeUndefined();
    expect(dashboardData.refresh).toHaveBeenCalledOnce();
    expect(motionMocks.replay).toHaveBeenCalledOnce();
  });

  it('consumes rejected pull refreshes after cleanup and replay at the event boundary', async () => {
    const refresh = deferred();
    dashboardData = createDashboardData({ refresh: vi.fn(() => refresh.promise) });

    const tree = renderScreen();
    const control = refreshControl(tree);
    let result: unknown;

    act(() => {
      result = control.props.onRefresh();
    });

    try {
      expect(result).toBeUndefined();
      expect(refreshControl(tree).props.refreshing).toBe(true);
    } finally {
      await act(async () => {
        refresh.reject(new Error('offline'));
        await Promise.resolve();
        await Promise.resolve();
        await (result instanceof Promise ? result.catch(() => undefined) : undefined);
      });
    }

    expect(refreshControl(tree).props.refreshing).toBe(false);
    expect(motionMocks.replay).toHaveBeenCalledOnce();
  });
});

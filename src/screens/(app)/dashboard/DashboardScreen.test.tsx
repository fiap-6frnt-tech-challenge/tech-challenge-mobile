import {
  createElement,
  forwardRef,
  useImperativeHandle,
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
  useDashboardData: () => dashboardData,
}));

vi.mock('@/src/theme', () => ({
  spacing: { md: 12, lg: 16 },
  useTheme: () => ({
    colors: {
      background: '#fff',
      badgeTransferBg: '#eee',
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

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });

  return { promise, resolve };
}

beforeEach(() => {
  dashboardData = createDashboardData();
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

  it('retries a full dashboard error before replaying the animated sections', async () => {
    const events: string[] = [];
    dashboardData = createDashboardData({
      error: 'Sem conexão',
      isEmpty: true,
      refresh: vi.fn(async () => {
        events.push('refresh');
      }),
    });
    motionMocks.replay.mockImplementation(() => events.push('replay'));

    const tree = renderScreen();
    const action = tree.root.findByProps({ title: 'Tentar novamente' });

    await act(async () => {
      await action.props.onPress();
    });

    expect(findByTestId(tree, 'dashboard-error')).toBeDefined();
    expect(events).toEqual(['refresh', 'replay']);
  });

  it('retains the S2-06 KPI and chart content for non-empty data', () => {
    const tree = renderScreen();

    expect(findByTestId(tree, 'dashboard-balance')).toBeDefined();
    expect(findByTestId(tree, 'dashboard-bar-chart')).toBeDefined();
    expect(findByTestId(tree, 'dashboard-pie-chart')).toBeDefined();
    expect(findByTestId(tree, 'dashboard-line-chart')).toBeDefined();
  });

  it('keeps content visible behind the pull-to-refresh spinner until refresh resolves', async () => {
    const refresh = deferred();
    dashboardData = createDashboardData({ refresh: vi.fn(() => refresh.promise) });

    const tree = renderScreen();
    const control = refreshControl(tree);

    act(() => {
      void control.props.onRefresh();
    });

    expect(refreshControl(tree).props.refreshing).toBe(true);
    expect(findAllByTestId(tree, 'dashboard-skeleton')).toHaveLength(0);

    await act(async () => {
      refresh.resolve();
      await refresh.promise;
    });

    expect(refreshControl(tree).props.refreshing).toBe(false);
    expect(motionMocks.replay).toHaveBeenCalledOnce();
  });

  it('keeps content visible and announces a failed refresh inline', () => {
    dashboardData = createDashboardData({ error: 'Não foi possível atualizar os dados' });

    const tree = renderScreen();
    const error = findByTestId(tree, 'dashboard-refresh-error');

    expect(findByTestId(tree, 'dashboard-balance')).toBeDefined();
    expect(findByTestId(tree, 'dashboard-bar-chart')).toBeDefined();
    expect(findByTestId(tree, 'dashboard-pie-chart')).toBeDefined();
    expect(findByTestId(tree, 'dashboard-line-chart')).toBeDefined();
    expect(error.props.accessibilityRole).toBe('alert');
    expect(error.props.accessibilityLiveRegion).toBe('assertive');
    expect(error.props.accessibilityLabel).toBe(
      'Não foi possível atualizar os dados. Dados anteriores continuam visíveis.'
    );
  });
});

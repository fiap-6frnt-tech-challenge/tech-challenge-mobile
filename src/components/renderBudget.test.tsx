import {
  createElement,
  createRef,
  forwardRef,
  useImperativeHandle,
  useState,
  type ReactNode,
} from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TransactionItem } from '@/src/components/features/TransactionItem';
import { KpiCard } from '@/src/components/ui/KpiCard';
import { SearchInput } from '@/src/components/ui/SearchInput';
import { SummaryTile } from '@/src/components/ui/SummaryTile';
import { BalanceLineChart, CategoryPieChart, ExpenseBarChart } from '@/src/components/ui/charts';
import {
  balanceFixture,
  categoryShortFixture,
  monthlyFixture,
} from '@/src/components/ui/charts/fixtures';
import { TRANSACTION_TYPE, type Transaction } from '@/src/domain';
import { ThemeProvider } from '@/src/theme';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const renderCounts = vi.hoisted(() => ({
  kpiIcon: 0,
  barChart: 0,
  pieChart: 0,
  lineChart: 0,
  transactionIcon: 0,
}));

vi.mock('react-native', () => ({
  Platform: {
    select: <T,>(obj: { ios?: T; android?: T; default?: T }): T | undefined =>
      obj.android || obj.default,
  },
  Pressable: 'Pressable',
  StyleSheet: { create: <T,>(styles: T) => styles, hairlineWidth: 1 },
  Text: 'Text',
  TextInput: 'TextInput',
  View: 'View',
  useWindowDimensions: () => ({ width: 375, height: 812 }),
}));

vi.mock('react-native-gifted-charts', () => ({
  BarChart: () => {
    renderCounts.barChart += 1;
    return createElement('View', { testID: 'bar-chart' });
  },
  PieChart: () => {
    renderCounts.pieChart += 1;
    return createElement('View', { testID: 'pie-chart' });
  },
  LineChart: () => {
    renderCounts.lineChart += 1;
    return createElement('View', { testID: 'line-chart' });
  },
}));

vi.mock('lucide-react-native', () => ({
  Car: 'Car',
  CircleEllipsis: 'CircleEllipsis',
  GraduationCap: 'GraduationCap',
  HeartPulse: 'HeartPulse',
  Home: 'Home',
  Minus: 'Minus',
  Repeat: 'Repeat',
  Search: 'Search',
  Ticket: 'Ticket',
  TrendingDown: 'TrendingDown',
  TrendingUp: 'TrendingUp',
  Utensils: () => {
    renderCounts.transactionIcon += 1;
    return createElement('View', { testID: 'category-icon' });
  },
  Wallet: 'Wallet',
  X: 'X',
}));

const KpiIcon = function KpiIcon() {
  renderCounts.kpiIcon += 1;
  return createElement('View', { testID: 'kpi-icon' });
} as unknown as LucideIcon;

const transaction: Transaction = {
  id: 't1',
  userId: 'user-1',
  type: TRANSACTION_TYPE.WITHDRAWAL,
  category: 'food',
  amount: 42.9,
  date: '2026-08-19',
  description: 'Mercado',
  createdAt: '2026-08-19T12:00:00.000Z',
};

const onPress = () => {};

const DEBOUNCE_MS = 300;

interface HarnessHandle {
  rerender: () => void;
}

const Harness = forwardRef<HarnessHandle, { children: (tick: number) => ReactNode }>(
  function Harness({ children }, ref) {
    const [tick, setTick] = useState(0);
    useImperativeHandle(ref, () => ({ rerender: () => setTick((current) => current + 1) }), []);
    return <ThemeProvider>{children(tick)}</ThemeProvider>;
  }
);

const harnessRef = createRef<HarnessHandle>();

function rerender() {
  act(() => harnessRef.current?.rerender());
}

let renderer: ReactTestRenderer | undefined;

function renderHarness(children: (tick: number) => ReactNode) {
  act(() => {
    renderer = create(<Harness ref={harnessRef}>{children}</Harness>);
  });
}

beforeEach(() => {
  renderCounts.kpiIcon = 0;
  renderCounts.barChart = 0;
  renderCounts.pieChart = 0;
  renderCounts.lineChart = 0;
  renderCounts.transactionIcon = 0;
});

afterEach(() => {
  if (renderer) {
    act(() => renderer?.unmount());
    renderer = undefined;
  }
  vi.useRealTimers();
});

describe('orçamento de re-render', () => {
  it('não re-renderiza KPIs e gráficos quando o dashboard troca de estado sem novos dados', () => {
    renderHarness(() => (
      <>
        <KpiCard
          label="Saldo atual"
          value={2550}
          tone="primary"
          icon={KpiIcon}
          trend="up"
          trendLabel="R$ 1.000,00 neste mês"
        />
        <SummaryTile
          label="Entradas do mês"
          value={3000}
          tone="positive"
          icon={KpiIcon}
          trend="up"
          trendLabel="+10% vs. mês anterior"
        />
        <ExpenseBarChart data={monthlyFixture} title="Receita × Despesa" />
        <CategoryPieChart data={categoryShortFixture} title="Gastos por categoria" />
        <BalanceLineChart data={balanceFixture} title="Evolução do saldo" />
      </>
    ));

    expect(renderCounts).toMatchObject({
      kpiIcon: 2,
      barChart: 1,
      pieChart: 1,
      lineChart: 1,
    });

    rerender();
    rerender();

    expect(renderCounts).toMatchObject({
      kpiIcon: 2,
      barChart: 1,
      pieChart: 1,
      lineChart: 1,
    });
  });

  it('re-renderiza os KPIs quando o valor exibido muda', () => {
    renderHarness((tick) => (
      <KpiCard label="Saldo atual" value={2550 + tick} tone="primary" icon={KpiIcon} />
    ));

    expect(renderCounts.kpiIcon).toBe(1);

    rerender();

    expect(renderCounts.kpiIcon).toBe(2);
  });

  it('não re-renderiza a linha da lista quando a tela re-renderiza com a mesma transação', () => {
    renderHarness(() => <TransactionItem transaction={transaction} onPress={onPress} />);

    expect(renderCounts.transactionIcon).toBe(1);

    rerender();
    rerender();

    expect(renderCounts.transactionIcon).toBe(1);
  });

  it('digitar na busca não re-renderiza a tela nem a lista antes do debounce', () => {
    vi.useFakeTimers();

    let screenRenders = 0;

    function SearchScreen() {
      const [, setSearch] = useState('');
      screenRenders += 1;

      return (
        <>
          <SearchInput onSearch={setSearch} debounceMs={DEBOUNCE_MS} />
          <TransactionItem transaction={transaction} onPress={onPress} />
        </>
      );
    }

    act(() => {
      renderer = create(
        <ThemeProvider>
          <SearchScreen />
        </ThemeProvider>
      );
    });

    expect(screenRenders).toBe(1);
    expect(renderCounts.transactionIcon).toBe(1);

    const input = renderer!.root.find((node) => typeof node.props.onChangeText === 'function');
    const typed = 'mercado';
    for (let length = 1; length <= typed.length; length += 1) {
      act(() => input.props.onChangeText(typed.slice(0, length)));
    }

    expect(screenRenders).toBe(1);
    expect(renderCounts.transactionIcon).toBe(1);

    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_MS);
    });

    expect(screenRenders).toBe(2);
    expect(renderCounts.transactionIcon).toBe(1);
  });
});

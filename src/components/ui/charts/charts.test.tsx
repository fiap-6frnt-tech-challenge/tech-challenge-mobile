import { createElement, type ReactElement } from 'react';
import { Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { BalancePoint } from '@/src/domain';
import { ThemeProvider } from '@/src/theme';
import { BalanceLineChart } from './BalanceLineChart';
import { CategoryPieChart } from './CategoryPieChart';
import { ExpenseBarChart } from './ExpenseBarChart';
import { balanceFixture, categoryShortFixture, monthlyFixture } from './fixtures';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

vi.mock('react-native', () => ({
  StyleSheet: { create: <T,>(styles: T) => styles },
  View: 'View',
  Text: 'Text',
  Platform: {
    select: <T,>(obj: { ios?: T; android?: T; default?: T }): T | undefined =>
      obj.android || obj.default,
  },
  useWindowDimensions: () => ({ width: 375, height: 812 }),
}));

let reducedMotion = false;

vi.mock('@/src/hooks/useReduceMotion', () => ({
  useReduceMotion: () => reducedMotion,
}));

vi.mock('react-native-gifted-charts', () => ({
  BarChart: ({ data, isAnimated }: { data: unknown[]; isAnimated?: boolean }) =>
    createElement('View', {
      testID: 'mock-bar-chart',
      accessibilityLabel: `bar chart: ${data.length} bars`,
      isAnimated,
    }),
  LineChart: ({ data, isAnimated }: { data: unknown[]; isAnimated?: boolean }) =>
    createElement('View', {
      testID: 'mock-line-chart',
      accessibilityLabel: `line chart: ${data.length} points`,
      points: data,
      isAnimated,
    }),
  PieChart: ({ data, isAnimated }: { data: unknown[]; isAnimated?: boolean }) =>
    createElement('View', {
      testID: 'mock-pie-chart',
      accessibilityLabel: `pie chart: ${data.length} slices`,
      isAnimated,
    }),
}));

let renderer: ReactTestRenderer | undefined;

function renderChart(element: ReactElement) {
  act(() => {
    renderer = create(<ThemeProvider>{element}</ThemeProvider>);
  });
  return renderer!;
}

describe('dashboard charts', () => {
  beforeEach(() => {
    reducedMotion = false;
  });

  it('animates all chart primitives by default', () => {
    const tree = renderChart(
      <>
        <ExpenseBarChart data={monthlyFixture} />
        <CategoryPieChart data={categoryShortFixture} />
        <BalanceLineChart data={balanceFixture} />
      </>
    );

    expect(tree.root.findByProps({ testID: 'mock-bar-chart' }).props.isAnimated).toBe(true);
    expect(tree.root.findByProps({ testID: 'mock-pie-chart' }).props.isAnimated).toBe(true);
    expect(tree.root.findByProps({ testID: 'mock-line-chart' }).props.isAnimated).toBe(true);
  });

  it('disables every chart animation when reduced motion is enabled', () => {
    reducedMotion = true;
    const tree = renderChart(
      <>
        <ExpenseBarChart data={monthlyFixture} />
        <CategoryPieChart data={categoryShortFixture} />
        <BalanceLineChart data={balanceFixture} />
      </>
    );

    expect(tree.root.findByProps({ testID: 'mock-bar-chart' }).props.isAnimated).toBe(false);
    expect(tree.root.findByProps({ testID: 'mock-pie-chart' }).props.isAnimated).toBe(false);
    expect(tree.root.findByProps({ testID: 'mock-line-chart' }).props.isAnimated).toBe(false);
  });

  it('exposes chart titles as headers and detailed image summaries', () => {
    const tree = renderChart(
      <>
        <ExpenseBarChart data={monthlyFixture} title="Receita x Despesa" />
        <CategoryPieChart data={categoryShortFixture} title="Gastos por categoria" />
        <BalanceLineChart data={balanceFixture} title="Evolução do saldo" />
      </>
    );

    const headers = tree.root.findAll(
      (node) => node.type === Text && node.props.accessibilityRole === 'header'
    );
    expect(headers).toHaveLength(3);

    const summaries = tree.root.findAllByProps({ accessibilityRole: 'image' });
    expect(summaries).toHaveLength(3);
    expect(summaries[0].props.accessibilityLabel).toMatch(/receitas.+despesas.+R\$/i);
    expect(summaries[1].props.accessibilityLabel).toMatch(/total.+Alimentação.+%/i);
    expect(summaries[2].props.accessibilityLabel).toMatch(/saldo inicial.+saldo final.+tendência/i);
  });
  it('mounts the income versus expense bar chart with a fixture', () => {
    const tree = renderChart(
      <ExpenseBarChart data={monthlyFixture} title="Receita × Despesa" testID="bar-chart" />
    );

    expect(tree.root.findByProps({ testID: 'bar-chart' })).toBeTruthy();
    expect(tree.root.findByProps({ testID: 'mock-bar-chart' })).toBeTruthy();

    const a11yNode = tree.root.find(
      (node) =>
        node.props.accessibilityLabel &&
        /receitas e despesas em 6 meses/i.test(node.props.accessibilityLabel)
    );
    expect(a11yNode).toBeTruthy();
  });

  it('mounts the category pie chart with a fixture', () => {
    const tree = renderChart(
      <CategoryPieChart
        data={categoryShortFixture}
        title="Gastos por categoria"
        testID="pie-chart"
      />
    );

    expect(tree.root.findByProps({ testID: 'pie-chart' })).toBeTruthy();
    expect(tree.root.findByProps({ testID: 'mock-pie-chart' })).toBeTruthy();

    const textNode = tree.root.find(
      (node) =>
        node.type === Text &&
        (Array.isArray(node.props.children)
          ? node.props.children.join('').includes('Alimentação')
          : String(node.props.children).includes('Alimentação'))
    );
    expect(textNode).toBeTruthy();
  });

  it('mounts the balance line chart with a fixture', () => {
    const tree = renderChart(
      <BalanceLineChart data={balanceFixture} title="Evolução do saldo" testID="line-chart" />
    );

    expect(tree.root.findByProps({ testID: 'line-chart' })).toBeTruthy();
    expect(tree.root.findByProps({ testID: 'mock-line-chart' })).toBeTruthy();

    const a11yNode = tree.root.find(
      (node) =>
        node.props.accessibilityLabel &&
        /evolução do saldo em 9 pontos/i.test(node.props.accessibilityLabel)
    );
    expect(a11yNode).toBeTruthy();
  });

  it('reamostra a linha do saldo acima do limite de pontos plotados', () => {
    const longSeries: BalancePoint[] = Array.from({ length: 320 }, (_, index) => ({
      date: `2026-03-${String((index % 28) + 1).padStart(2, '0')}`,
      balance: 1000 + index * 7,
    }));

    const tree = renderChart(<BalanceLineChart data={longSeries} testID="long-line-chart" />);
    const chart = tree.root.findByProps({ testID: 'mock-line-chart' });
    const plotted = chart.props.points as { value: number }[];

    expect(plotted).toHaveLength(60);
    expect(plotted[0].value).toBe(longSeries[0].balance);
    expect(plotted.at(-1)?.value).toBe(longSeries.at(-1)?.balance);

    const a11yNode = tree.root.find(
      (node) =>
        node.props.accessibilityLabel &&
        /evolução do saldo em 320 pontos/i.test(node.props.accessibilityLabel)
    );
    expect(a11yNode).toBeTruthy();
  });

  it('mantém todos os pontos quando a série cabe no limite', () => {
    const tree = renderChart(<BalanceLineChart data={balanceFixture} testID="short-line-chart" />);
    const chart = tree.root.findByProps({ testID: 'mock-line-chart' });

    expect(chart.props.points).toHaveLength(balanceFixture.length);
  });

  it('renders chart empty states instead of chart primitives', () => {
    const tree = renderChart(
      <>
        <ExpenseBarChart data={[]} testID="empty-bar-chart" />
        <CategoryPieChart data={[]} testID="empty-pie-chart" />
        <BalanceLineChart data={[]} testID="empty-line-chart" />
      </>
    );

    const findText = (text: string) => {
      return tree.root.find(
        (node) =>
          node.type === Text &&
          (Array.isArray(node.props.children)
            ? node.props.children.join('').includes(text)
            : String(node.props.children).includes(text))
      );
    };

    expect(findText('Nenhuma movimentação no período.')).toBeTruthy();
    expect(findText('Nenhuma despesa categorizada no período.')).toBeTruthy();
    expect(
      findText('Ainda não há movimentações suficientes para traçar a evolução do saldo.')
    ).toBeTruthy();

    expect(tree.root.findAllByProps({ testID: 'mock-bar-chart' })).toHaveLength(0);
    expect(tree.root.findAllByProps({ testID: 'mock-pie-chart' })).toHaveLength(0);
    expect(tree.root.findAllByProps({ testID: 'mock-line-chart' })).toHaveLength(0);
  });
});

afterEach(() => {
  if (renderer) {
    act(() => renderer?.unmount());
    renderer = undefined;
  }
});

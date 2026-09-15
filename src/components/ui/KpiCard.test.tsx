import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Text } from 'react-native';

import { ThemeProvider } from '@/src/theme';
import { KpiCard } from './KpiCard';

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
}));

vi.mock('lucide-react-native', () => ({
  Minus: 'Minus',
  TrendingDown: 'TrendingDown',
  TrendingUp: 'TrendingUp',
}));

let renderer: ReactTestRenderer | undefined;

function renderKpiCard(props: React.ComponentProps<typeof KpiCard>) {
  act(() => {
    renderer = create(
      <ThemeProvider>
        <KpiCard {...props} />
      </ThemeProvider>
    );
  });
  return renderer!;
}

describe('KpiCard', () => {
  it('renders a formatted BRL value', () => {
    const tree = renderKpiCard({
      label: 'Saldo atual',
      value: 1234.56,
      tone: 'primary',
      testID: 'kpi-card',
    });

    const card = tree.root.findByProps({ testID: 'kpi-card' });
    expect(card).toBeTruthy();

    const textNodes = tree.root.findAllByType(Text);
    const hasValue = textNodes.some((node) =>
      Array.isArray(node.props.children)
        ? node.props.children.join('').includes('R$ 1.234,56')
        : String(node.props.children).includes('R$ 1.234,56')
    );
    expect(hasValue).toBe(true);
  });

  it('exposes the label and trend for accessibility', () => {
    const tree = renderKpiCard({
      label: 'Saldo atual',
      value: -80,
      tone: 'negative',
      trend: 'down',
      trendLabel: '-10% vs. mês anterior',
    });

    const card = tree.root.findByProps({
      accessibilityLabel: 'Saldo atual: -R$ 80,00, -10% vs. mês anterior',
    });
    expect(card).toBeTruthy();
  });
});

afterEach(() => {
  if (renderer) {
    act(() => renderer?.unmount());
    renderer = undefined;
  }
});

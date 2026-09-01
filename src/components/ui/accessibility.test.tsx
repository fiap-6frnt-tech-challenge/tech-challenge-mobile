import { createElement, type ElementType, type ReactElement, type ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthFooterLink } from '@/src/components/features/auth/AuthFooterLink';
import { ThemeProvider } from '@/src/theme';

import { Button } from './Button';
import { Chip } from './Chip';
import { CurrencyInput } from './CurrencyInput';
import { SearchInput } from './SearchInput';
import { SegmentedControl } from './SegmentedControl';
import { TextField } from './TextField';

vi.mock('react-native', () => ({
  ActivityIndicator: 'ActivityIndicator',
  Animated: {
    Value: class {
      setValue = vi.fn();
    },
    View: 'AnimatedView',
  },
  Easing: {
    cubic: 'cubic',
    quad: 'quad',
    in: <T,>(value: T) => value,
    out: <T,>(value: T) => value,
  },
  Pressable: 'Pressable',
  StyleSheet: { create: <T,>(styles: T) => styles, hairlineWidth: 1 },
  Text: 'Text',
  TextInput: 'TextInput',
  View: 'View',
}));

vi.mock('lucide-react-native', () => ({ Search: 'Search', X: 'X' }));

vi.mock('expo-router', () => ({
  Link: ({ children }: { children: ReactNode }) => createElement('Link', null, children),
}));

vi.mock('@/src/hooks/useReduceMotion', () => ({ useReduceMotion: () => false }));

const pressableType = 'Pressable' as unknown as ElementType;
const textInputType = 'TextInput' as unknown as ElementType;

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

let renderer: ReactTestRenderer | undefined;

function render(element: ReactElement): ReactTestRenderer {
  act(() => {
    renderer = create(<ThemeProvider>{element}</ThemeProvider>);
  });

  if (!renderer) throw new Error('Component did not render');
  return renderer;
}

function flattenStyle(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) {
    return style.reduce<Record<string, unknown>>(
      (flattened, entry) => ({ ...flattened, ...flattenStyle(entry) }),
      {}
    );
  }

  return style && typeof style === 'object' ? (style as Record<string, unknown>) : {};
}

function effectiveTarget(visualSize: number, hitSlop: unknown): number {
  const inset = typeof hitSlop === 'number' ? hitSlop : 0;
  return visualSize + inset * 2;
}

afterEach(() => {
  if (renderer) {
    act(() => renderer?.unmount());
    renderer = undefined;
  }
});

describe('shared control accessibility', () => {
  it('exposes Button semantics and a 44-point target', () => {
    const tree = render(<Button title="Salvar" loading testID="save-button" />);
    const button = tree.root.findByType(pressableType);

    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityLabel).toBe('Salvar');
    expect(button.props.accessibilityState).toEqual({ disabled: true, busy: true });
    expect(flattenStyle(button.props.style).minHeight).toBeGreaterThanOrEqual(44);
  });

  it('exposes TextField and CurrencyInput labels and polite errors', () => {
    const tree = render(
      <>
        <TextField
          label="E-mail"
          value=""
          onChangeText={vi.fn()}
          error="Informe seu e-mail"
          testID="email"
        />
        <CurrencyInput
          label="Valor"
          value={0}
          onChangeValue={vi.fn()}
          error="Informe um valor"
          testID="amount"
        />
      </>
    );
    const inputs = tree.root.findAllByType(textInputType);
    const emailError = tree.root.findByProps({ testID: 'email-error' });
    const amountError = tree.root.findByProps({ testID: 'amount-error' });

    expect(inputs.map((input) => input.props.accessibilityLabel)).toEqual(['E-mail', 'Valor']);
    expect(emailError.props.accessibilityRole).toBe('alert');
    expect(emailError.props.accessibilityLiveRegion).toBe('polite');
    expect(amountError.props.accessibilityRole).toBe('alert');
    expect(amountError.props.accessibilityLiveRegion).toBe('polite');
  });

  it('exposes SearchInput semantics and a 44-point clear target', () => {
    const tree = render(
      <SearchInput defaultValue="pix" onSearch={vi.fn()} debounceMs={0} testID="search" />
    );
    const input = tree.root.findByType(textInputType);
    const clear = tree.root.findByProps({ testID: 'search-clear' });

    expect(input.props.accessibilityRole).toBe('search');
    expect(clear.props.accessibilityLabel).toBe('Limpar busca');
    expect(effectiveTarget(16, clear.props.hitSlop)).toBeGreaterThanOrEqual(44);
  });

  it('exposes SegmentedControl tab states and 44-point targets', () => {
    const tree = render(
      <SegmentedControl
        options={[
          { label: 'Receitas', value: 'income' },
          { label: 'Despesas', value: 'expense' },
        ]}
        value="income"
        onChange={vi.fn()}
        testID="segments"
      />
    );
    const tabs = tree.root.findAllByType(pressableType);

    expect(tabs).toHaveLength(2);
    expect(tabs.map((tab) => tab.props.accessibilityRole)).toEqual(['tab', 'tab']);
    expect(tabs.map((tab) => tab.props.accessibilityState.selected)).toEqual([true, false]);
    tabs.forEach((tab) => {
      expect(flattenStyle(tab.props.style).minHeight).toBeGreaterThanOrEqual(44);
    });
  });

  it('exposes interactive Chip state and 44-point chip and remove targets', () => {
    const tree = render(
      <>
        <Chip
          label="Pix"
          onPress={vi.fn()}
          selected
          accessibilityRole="checkbox"
          testID="pix-chip"
        />
        <Chip label="Cartão" onRemove={vi.fn()} testID="card-chip" />
      </>
    );
    const [chip, remove] = tree.root.findAllByType(pressableType);

    expect(chip.props.accessibilityRole).toBe('checkbox');
    expect(chip.props.accessibilityState).toEqual({
      disabled: false,
      selected: true,
      checked: true,
    });
    expect(flattenStyle(chip.props.style).minHeight).toBeGreaterThanOrEqual(44);
    expect(effectiveTarget(14, remove.props.hitSlop)).toBeGreaterThanOrEqual(44);
  });

  it('exposes AuthFooterLink semantics and a 44-point target', () => {
    const tree = render(
      <AuthFooterLink
        prompt="Já tem uma conta?"
        label="Entrar"
        href="/login"
        testID="auth-footer-link"
      />
    );
    const link = tree.root.findByType(pressableType);

    expect(link.props.accessibilityRole).toBe('link');
    expect(link.props.accessibilityLabel).toBe('Entrar');
    expect(flattenStyle(link.props.style).minHeight).toBeGreaterThanOrEqual(44);
  });
});

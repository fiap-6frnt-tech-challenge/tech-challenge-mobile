import {
  createElement,
  type ElementType,
  type ReactElement,
  type ReactNode,
  type ReactTestInstance,
} from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthFooterLink } from '@/src/components/features/auth/AuthFooterLink';
import { ThemeProvider } from '@/src/theme';

import { AttachmentList } from './AttachmentList';
import { AttachmentPicker } from './AttachmentPicker';
import { Button } from './Button';
import { Chip } from './Chip';
import { CurrencyInput } from './CurrencyInput';
import { DatePicker } from './DatePicker';
import { FilterSheet } from './FilterSheet';
import { SearchInput } from './SearchInput';
import { SegmentedControl } from './SegmentedControl';
import { Select } from './Select';
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
  FlatList: ({
    data = [],
    renderItem,
    ...props
  }: {
    data?: unknown[];
    renderItem?: (info: { item: unknown; index: number }) => ReactNode;
  }) =>
    createElement(
      'FlatList',
      props,
      data.map((item, index) =>
        createElement('Cell', { key: index }, renderItem?.({ item, index }))
      )
    ),
  Linking: { openURL: vi.fn() },
  Modal: ({
    visible,
    children,
    ...props
  }: {
    visible?: boolean;
    children?: ReactNode;
    [key: string]: unknown;
  }) => (visible ? createElement('Modal', props, children) : null),
  Platform: { OS: 'ios' },
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  StyleSheet: {
    absoluteFill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
    create: <T,>(styles: T) => styles,
    hairlineWidth: 1,
  },
  Text: 'Text',
  TextInput: 'TextInput',
  View: 'View',
}));

vi.mock('lucide-react-native', () => ({
  Calendar: 'Calendar',
  Camera: 'Camera',
  Check: 'Check',
  ChevronDown: 'ChevronDown',
  FileText: 'FileText',
  ImageIcon: 'ImageIcon',
  Paperclip: 'Paperclip',
  Search: 'Search',
  Trash2: 'Trash2',
  X: 'X',
}));

vi.mock('@react-native-community/datetimepicker', () => ({ default: 'DateTimePicker' }));

vi.mock('expo-image', () => ({ Image: 'Image' }));

vi.mock('./AttachmentPicker.source', () => ({
  expoAttachmentSource: {
    pickDocument: vi.fn(),
    pickFromCamera: vi.fn(),
    pickFromLibrary: vi.fn(),
  },
}));

vi.mock('expo-router', () => ({
  Link: ({ children }: { children: ReactNode }) => createElement('Link', null, children),
}));

vi.mock('@/src/hooks/useReduceMotion', () => ({ useReduceMotion: () => false }));

const pressableType = 'Pressable' as unknown as ElementType;
const textInputType = 'TextInput' as unknown as ElementType;
const viewType = 'View' as unknown as ElementType;

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

function nativePressable(tree: ReactTestRenderer, testID: string): ReactTestInstance {
  const node = tree.root
    .findAllByType(pressableType)
    .find((pressable) => pressable.props.testID === testID);

  if (!node) throw new Error(`Missing Pressable ${testID}`);
  return node;
}

function clippedTargetLength(
  parentLength: number,
  targetStart: number,
  targetLength: number,
  hitSlop: unknown
): number {
  const inset = typeof hitSlop === 'number' ? hitSlop : 0;
  const start = Math.max(0, targetStart - inset);
  const end = Math.min(parentLength, targetStart + targetLength + inset);

  return end - start;
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

  it('exposes TextField and CurrencyInput labels, targets, and polite errors', () => {
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
    inputs.forEach((input) => {
      expect(flattenStyle(input.props.style).minHeight).toBeGreaterThanOrEqual(44);
    });
    expect(emailError.props.accessibilityRole).toBe('alert');
    expect(emailError.props.accessibilityLiveRegion).toBe('polite');
    expect(amountError.props.accessibilityRole).toBe('alert');
    expect(amountError.props.accessibilityLiveRegion).toBe('polite');
  });

  it('exposes SearchInput semantics and its clear-action hit slop', () => {
    const tree = render(
      <SearchInput defaultValue="pix" onSearch={vi.fn()} debounceMs={0} testID="search" />
    );
    const input = tree.root.findByType(textInputType);
    const clear = tree.root.findByProps({ testID: 'search-clear' });

    expect(input.props.accessibilityRole).toBe('search');
    expect(clear.props.accessibilityLabel).toBe('Limpar busca');
    expect(clear.props.hitSlop).toBeGreaterThanOrEqual(14);
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

  it('keeps the Chip remove action compact while its clipped target reaches 44 points', () => {
    const tree = render(<Chip label="Cartão" onRemove={vi.fn()} testID="card-chip" />);
    const chip = tree.root
      .findAllByType(viewType)
      .find((view) => view.props.testID === 'card-chip');
    const remove = nativePressable(tree, 'card-chip-remove');

    if (!chip) throw new Error('Missing Chip container');

    const chipStyle = flattenStyle(chip.props.style);
    const removeStyle = flattenStyle(remove.props.style);
    const rightPadding = Number(chipStyle.paddingHorizontal);
    const removeWidth = Number(removeStyle.width);
    const removeHeight = Number(removeStyle.height);
    const chipHeight = Number(chipStyle.minHeight);
    const verticalPadding = Number(chipStyle.paddingVertical);
    const verticalMargin = Number(removeStyle.marginVertical);

    expect(removeWidth).toBeGreaterThanOrEqual(32);
    expect(removeHeight).toBeGreaterThanOrEqual(32);
    expect(removeWidth).toBeLessThan(44);
    expect(removeHeight).toBeLessThan(44);
    expect(removeHeight + verticalMargin * 2 + verticalPadding * 2).toBeLessThanOrEqual(chipHeight);
    expect(
      clippedTargetLength(removeWidth + rightPadding, 0, removeWidth, remove.props.hitSlop)
    ).toBeGreaterThanOrEqual(44);
    expect(
      clippedTargetLength(
        chipHeight,
        (chipHeight - removeHeight) / 2,
        removeHeight,
        remove.props.hitSlop
      )
    ).toBeGreaterThanOrEqual(44);
  });

  it('enforces 44-point targets for select, date, attachment, and attachment-list actions', async () => {
    const tree = render(
      <>
        <Select
          label="Categoria"
          options={[{ label: 'Alimentação', value: 'food' }]}
          onChange={vi.fn()}
          testID="category-select"
        />
        <DatePicker label="Data" onChange={vi.fn()} testID="date-picker" />
        <AttachmentPicker onPick={vi.fn()} testID="attachment-picker" />
        <AttachmentList
          attachments={[
            {
              id: 'att-1',
              name: 'comprovante.jpg',
              size: 1024,
              mimeType: 'image/jpeg',
              url: 'https://example.com/comprovante.jpg',
            },
          ]}
          onRemove={vi.fn()}
          testID="attachments"
        />
      </>
    );
    const select = nativePressable(tree, 'category-select');
    const date = nativePressable(tree, 'date-picker');
    const picker = nativePressable(tree, 'attachment-picker');
    const remove = nativePressable(tree, 'attachments-att-1-remove');

    expect(flattenStyle(select.props.style).minHeight).toBeGreaterThanOrEqual(44);
    expect(flattenStyle(date.props.style).minHeight).toBeGreaterThanOrEqual(44);
    expect(flattenStyle(picker.props.style).minHeight).toBeGreaterThanOrEqual(44);
    expect(flattenStyle(remove.props.style).minWidth).toBeGreaterThanOrEqual(44);
    expect(flattenStyle(remove.props.style).minHeight).toBeGreaterThanOrEqual(44);

    act(() => select.props.onPress());

    const option = tree.root
      .findAllByType(pressableType)
      .find((pressable) => pressable.props.accessibilityRole === 'radio');

    if (!option) throw new Error('Missing Select option');
    expect(flattenStyle(option.props.style).minHeight).toBeGreaterThanOrEqual(44);

    act(() => picker.props.onPress());

    expect(
      flattenStyle(nativePressable(tree, 'attachment-picker-camera').props.style).minHeight
    ).toBeGreaterThanOrEqual(44);

    await act(async () => {
      await nativePressable(tree, 'attachments-att-1-open').props.onPress();
    });

    const previewClose = nativePressable(tree, 'attachments-preview-close');
    const previewCloseStyle = flattenStyle(previewClose.props.style);

    expect(previewCloseStyle.minWidth).toBeGreaterThanOrEqual(44);
    expect(previewCloseStyle.minHeight).toBeGreaterThanOrEqual(44);
    expect(previewCloseStyle.alignItems).toBe('center');
    expect(previewCloseStyle.justifyContent).toBe('center');
  });

  it('isolates visible sheets from background focus and keeps close actions readable', () => {
    const tree = render(
      <>
        <Select
          label="Categoria"
          options={[{ label: 'Alimentação', value: 'food' }]}
          onChange={vi.fn()}
          testID="modal-select"
        />
        <DatePicker label="Data" onChange={vi.fn()} testID="modal-date" />
        <AttachmentPicker onPick={vi.fn()} testID="modal-attachment" />
        <FilterSheet visible onApply={vi.fn()} onClose={vi.fn()} testID="modal-filters" />
      </>
    );

    act(() => nativePressable(tree, 'modal-select').props.onPress());
    act(() => nativePressable(tree, 'modal-date').props.onPress());
    act(() => nativePressable(tree, 'modal-attachment').props.onPress());

    const modalViews = tree.root.findAll(
      (node) => node.type === viewType && node.props.accessibilityViewIsModal === true
    );
    expect(modalViews).toHaveLength(4);

    const closeLabels = tree.root
      .findAllByType(pressableType)
      .map((pressable) => pressable.props.accessibilityLabel)
      .filter((label) => typeof label === 'string' && label.startsWith('Fechar'));

    expect(closeLabels).toEqual(
      expect.arrayContaining([
        'Fechar seleção',
        'Fechar seletor de data',
        'Fechar opções de anexo',
        'Fechar filtros',
      ])
    );
  });

  it('exposes interactive Chip state', () => {
    const tree = render(
      <Chip label="Pix" onPress={vi.fn()} selected accessibilityRole="checkbox" testID="pix-chip" />
    );
    const chip = nativePressable(tree, 'pix-chip');

    expect(chip.props.accessibilityRole).toBe('checkbox');
    expect(chip.props.accessibilityState).toEqual({
      disabled: false,
      selected: true,
      checked: true,
    });
    expect(flattenStyle(chip.props.style).minHeight).toBeGreaterThanOrEqual(44);
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

import { createElement, type ElementType, type ReactElement, type ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AppLayout from '../../app/(app)/_layout';
import TabLayout from '../../app/(app)/(tabs)/_layout';

vi.mock('expo-router', () => {
  const Stack = ({ children }: { children?: ReactNode }) => createElement('Stack', null, children);
  Stack.Screen = (props: Record<string, unknown>) => createElement('StackScreen', props);

  const Tabs = ({ children, ...props }: { children?: ReactNode }) =>
    createElement('Tabs', props, children);
  Tabs.Screen = (props: Record<string, unknown>) => createElement('TabsScreen', props);

  return { Stack, Tabs };
});

vi.mock('react-native', () => ({
  Pressable: 'Pressable',
  StyleSheet: { create: <T,>(styles: T) => styles },
  TouchableOpacity: 'TouchableOpacity',
}));

vi.mock('lucide-react-native', () => ({
  CircleUserRound: 'CircleUserRound',
  House: 'House',
  ScrollText: 'ScrollText',
}));

const stackScreenType = 'StackScreen' as unknown as ElementType;
const tabsScreenType = 'TabsScreen' as unknown as ElementType;
const pressableType = 'Pressable' as unknown as ElementType;
const houseType = 'House' as unknown as ElementType;
const scrollTextType = 'ScrollText' as unknown as ElementType;

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

let renderer: ReactTestRenderer | undefined;

function render(element: ReactElement): ReactTestRenderer {
  act(() => {
    renderer = create(element);
  });

  if (!renderer) throw new Error('Component did not render');
  return renderer;
}

function flattenStyle(style: unknown): Record<string, unknown> {
  const resolved = typeof style === 'function' ? style({ pressed: false }) : style;

  if (Array.isArray(resolved)) {
    return resolved.reduce<Record<string, unknown>>(
      (flattened, entry) => ({ ...flattened, ...flattenStyle(entry) }),
      {}
    );
  }

  return resolved && typeof resolved === 'object' ? (resolved as Record<string, unknown>) : {};
}

afterEach(() => {
  if (renderer) {
    act(() => renderer?.unmount());
    renderer = undefined;
  }
});

describe('navigation accessibility', () => {
  it('exposes the profile action as a labelled 44-point button with stable navigation', () => {
    const navigate = vi.fn();
    const tree = render(<AppLayout />);
    const screen = tree.root.findAllByType(stackScreenType)[0];
    const options = screen.props.options({ navigation: { navigate } });
    const header = render(options.headerRight());
    const profileButton = header.root.findByType(pressableType);
    const style = flattenStyle(profileButton.props.style);

    expect(profileButton.props.accessibilityRole).toBe('button');
    expect(profileButton.props.accessibilityLabel).toBe('Abrir perfil');
    expect(style.minWidth).toBeGreaterThanOrEqual(44);
    expect(style.minHeight).toBeGreaterThanOrEqual(44);

    act(() => profileButton.props.onPress());
    expect(navigate).toHaveBeenCalledWith('profile');
  });

  it('gives both tabs stable accessible names and decorative icons', () => {
    const tree = render(<TabLayout />);
    const [dashboard, transactions] = tree.root.findAllByType(tabsScreenType);

    expect(dashboard.props.options.title).toBe('Início');
    expect(dashboard.props.options.tabBarAccessibilityLabel).toBe('Início');
    expect(transactions.props.options.title).toBe('Transações');
    expect(transactions.props.options.tabBarAccessibilityLabel).toBe('Transações');

    const dashboardIcon = render(dashboard.props.options.tabBarIcon({ focused: true }));
    expect(dashboardIcon.root.findByType(houseType).props.accessible).toBe(false);

    const transactionsIcon = render(transactions.props.options.tabBarIcon({ focused: false }));
    expect(transactionsIcon.root.findByType(scrollTextType).props.accessible).toBe(false);
  });
});

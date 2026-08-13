import { createElement, type ElementType, type ReactElement, type ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DashboardFeedback } from './DashboardFeedback';
import { DashboardSkeleton } from './DashboardSkeleton';

const nativeMocks = vi.hoisted(() => {
  const loopStart = vi.fn();
  const loopStop = vi.fn();
  const loop = vi.fn(() => ({ start: loopStart, stop: loopStop }));

  class AnimatedValue {
    interpolate = vi.fn(() => 0);

    setValue = vi.fn();
  }

  return { loop, loopStart, loopStop, AnimatedValue };
});

const motionMocks = vi.hoisted(() => ({ reducedMotion: false }));

vi.mock('react-native', () => ({
  Animated: {
    Value: nativeMocks.AnimatedValue,
    View: 'AnimatedView',
    loop: nativeMocks.loop,
    timing: vi.fn(() => ({ start: vi.fn(), stop: vi.fn() })),
  },
  StyleSheet: { create: <T,>(styles: T) => styles },
  View: 'View',
}));

vi.mock('lucide-react-native', () => ({
  ChartNoAxesCombined: 'ChartNoAxesCombined',
  TriangleAlert: 'TriangleAlert',
}));

vi.mock('@/src/theme', () => ({
  useTheme: () => ({
    colors: {
      background: '#fff',
      border: '#ccc',
      danger: '#b53418',
      primary: '#6841f2',
      surface: '#fff',
      surfaceHover: '#f8f8f8',
      textSecondary: '#5c6070',
    },
    radius: { default: 8 },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 },
  }),
}));

vi.mock('@/src/hooks/useReduceMotion', () => ({
  useReduceMotion: () => motionMocks.reducedMotion,
}));

vi.mock('@/src/components/ui/Button', () => ({
  Button: ({ children, ...props }: { children?: ReactNode }) =>
    createElement('Button', props, children),
}));

vi.mock('@/src/components/ui/Card', () => ({
  Card: ({ children, ...props }: { children?: ReactNode }) =>
    createElement('Card', props, children),
}));

vi.mock('@/src/components/ui/Text', () => ({
  Text: ({ children, ...props }: { children?: ReactNode }) =>
    createElement('Text', props, children),
}));

let renderer: ReactTestRenderer | undefined;
const buttonType = 'Button' as unknown as ElementType;

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

function render(element: ReactElement): ReactTestRenderer {
  act(() => {
    renderer = create(element);
  });

  if (!renderer) throw new Error('Component did not render');
  return renderer;
}

afterEach(() => {
  if (renderer) {
    act(() => renderer?.unmount());
    renderer = undefined;
  }
});

describe('DashboardFeedback', () => {
  it('announces the empty dashboard and exposes its primary action', () => {
    const onAction = vi.fn();
    const tree = render(<DashboardFeedback variant="empty" onAction={onAction} />);
    const emptyRoot = tree.root.findByProps({ testID: 'dashboard-empty' });
    const emptyAnnouncement = tree.root.findByProps({
      testID: 'dashboard-empty-announcement',
    });
    const emptyButton = tree.root.findByType(buttonType);

    expect(emptyRoot.props.accessible).not.toBe(true);
    expect(emptyAnnouncement.props.accessibilityLiveRegion).toBe('polite');
    expect(emptyAnnouncement.props.accessibilityLabel).toBe(
      'Dashboard vazio. Adicione sua primeira transação para ver seus gráficos.'
    );
    expect(emptyButton.props.title).toBe('Adicionar transação');

    act(() => emptyButton.props.onPress());

    expect(onAction).toHaveBeenCalledOnce();
  });

  it('announces dashboard errors urgently and exposes retry', () => {
    const onAction = vi.fn();
    const tree = render(<DashboardFeedback variant="error" onAction={onAction} />);
    const errorRoot = tree.root.findByProps({ testID: 'dashboard-error' });
    const errorAnnouncement = tree.root.findByProps({
      testID: 'dashboard-error-announcement',
    });
    const errorButton = tree.root.findByType(buttonType);

    expect(errorRoot.props.accessible).not.toBe(true);
    expect(errorAnnouncement.props.accessibilityRole).toBe('alert');
    expect(errorAnnouncement.props.accessibilityLiveRegion).toBe('assertive');
    expect(errorButton.props.title).toBe('Tentar novamente');

    act(() => errorButton.props.onPress());

    expect(onAction).toHaveBeenCalledOnce();
  });
});

describe('DashboardSkeleton', () => {
  beforeEach(() => {
    motionMocks.reducedMotion = false;
    vi.clearAllMocks();
  });

  it('announces loading and stops its shared shimmer when unmounted', () => {
    const tree = render(<DashboardSkeleton />);
    const skeletonRoot = tree.root.findByProps({ testID: 'dashboard-skeleton' });

    expect(skeletonRoot.props.testID).toBe('dashboard-skeleton');
    expect(skeletonRoot.props.accessibilityRole).toBe('progressbar');
    expect(skeletonRoot.props.accessibilityState).toEqual({ busy: true });
    expect(nativeMocks.loopStart).toHaveBeenCalledOnce();
    expect(nativeMocks.loop).toHaveBeenCalledWith(expect.anything(), {
      resetBeforeIteration: true,
    });

    act(() => tree.unmount());
    renderer = undefined;

    expect(nativeMocks.loopStop).toHaveBeenCalledOnce();
  });

  it('keeps skeleton blocks static when reduced motion is enabled', () => {
    motionMocks.reducedMotion = true;

    render(<DashboardSkeleton />);

    expect(nativeMocks.loopStart).not.toHaveBeenCalled();
  });
});

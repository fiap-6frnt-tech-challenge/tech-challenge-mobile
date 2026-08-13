import { describe, expect, it, vi } from 'vitest';

import { getDashboardViewState, runDashboardRefresh } from './dashboardState';

describe('getDashboardViewState', () => {
  it.each([
    [{ loading: true, refreshing: false, error: null, isEmpty: true }, 'loading'],
    [{ loading: false, refreshing: false, error: 'Falha', isEmpty: true }, 'error'],
    [{ loading: false, refreshing: false, error: null, isEmpty: true }, 'empty'],
    [{ loading: false, refreshing: false, error: null, isEmpty: false }, 'content'],
    [{ loading: true, refreshing: false, error: null, isEmpty: false }, 'content'],
    [{ loading: true, refreshing: true, error: null, isEmpty: false }, 'content'],
    [{ loading: false, refreshing: false, error: 'Falha', isEmpty: false }, 'content'],
  ] as const)('maps %o to %s', (input, expected) => {
    expect(getDashboardViewState(input)).toBe(expected);
  });
});

describe('runDashboardRefresh', () => {
  it('shows the refresh spinner until data is loaded, then replays sections', async () => {
    const calls: string[] = [];

    await runDashboardRefresh({
      refresh: async () => {
        calls.push('refresh');
      },
      setRefreshing: (value) => calls.push(`refreshing:${value}`),
      replay: () => calls.push('replay'),
    });

    expect(calls).toEqual(['refreshing:true', 'refresh', 'refreshing:false', 'replay']);
  });

  it('clears the spinner and replays sections when refresh rejects', async () => {
    const setRefreshing = vi.fn();
    const replay = vi.fn();

    await expect(
      runDashboardRefresh({
        refresh: async () => {
          throw new Error('offline');
        },
        setRefreshing,
        replay,
      })
    ).rejects.toThrow('offline');

    expect(setRefreshing.mock.calls).toEqual([[true], [false]]);
    expect(replay).toHaveBeenCalledOnce();
  });
});

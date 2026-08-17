export type DashboardViewState = 'loading' | 'error' | 'empty' | 'content';

interface DashboardViewStateInput {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isEmpty: boolean;
}

export function getDashboardViewState({
  loading,
  refreshing,
  error,
  isEmpty,
}: DashboardViewStateInput): DashboardViewState {
  if (loading && isEmpty && !refreshing) return 'loading';
  if (error && isEmpty) return 'error';
  if (isEmpty) return 'empty';
  return 'content';
}

interface DashboardRefreshCallbacks {
  refresh: () => Promise<void>;
  setRefreshing: (value: boolean) => void;
  replay: () => void;
}

export async function runDashboardRefresh({
  refresh,
  setRefreshing,
  replay,
}: DashboardRefreshCallbacks): Promise<void> {
  setRefreshing(true);
  try {
    await refresh();
  } finally {
    setRefreshing(false);
    replay();
  }
}

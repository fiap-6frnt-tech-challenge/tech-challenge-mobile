import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TRANSACTION_TYPE, type Transaction } from '../domain';
import type { TransactionPage, TxFilter } from '../services/transactions.service';
import { useInfiniteTransactions } from './useInfiniteTransactions';

const authMocks = vi.hoisted(() => ({ useAuth: vi.fn() }));
const serviceMocks = vi.hoisted(() => ({ listPaged: vi.fn() }));

vi.mock('../contexts/AuthContext', () => ({ useAuth: authMocks.useAuth }));
vi.mock('../services/transactions.service', () => ({
  transactionsService: { listPaged: serviceMocks.listPaged },
}));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

type HookValue = ReturnType<typeof useInfiniteTransactions>;

const cursorOne = { id: 'cursor-1' } as QueryDocumentSnapshot;
const cursorTwo = { id: 'cursor-2' } as QueryDocumentSnapshot;
const salaryFilter: TxFilter = { type: TRANSACTION_TYPE.DEPOSIT, categories: ['salary'] };
const foodFilter: TxFilter = { type: TRANSACTION_TYPE.WITHDRAWAL, categories: ['food'] };

const transaction = (id: string, description = id): Transaction => ({
  id,
  userId: 'user-1',
  type: TRANSACTION_TYPE.DEPOSIT,
  category: 'salary',
  amount: 100,
  date: '2026-08-19',
  description,
  createdAt: '2026-08-19T12:00:00.000Z',
});

const page = (
  items: Transaction[],
  cursor: QueryDocumentSnapshot | null,
  hasMore: boolean
): TransactionPage => ({ items, cursor, hasMore });

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

let renderer: ReactTestRenderer | undefined;
let latest: HookValue | undefined;

function Probe({ filter }: { filter: TxFilter }) {
  const result = useInfiniteTransactions(filter);

  useEffect(() => {
    latest = result;
  }, [result]);

  return null;
}

function current(): HookValue {
  if (!latest) throw new Error('Hook has not rendered');
  return latest;
}

async function mount(filter: TxFilter = {}) {
  await act(async () => {
    renderer = create(<Probe filter={filter} />);
  });
}

async function rerender(filter: TxFilter) {
  await act(async () => {
    renderer?.update(<Probe filter={filter} />);
  });
}

describe('useInfiniteTransactions', () => {
  beforeEach(() => {
    latest = undefined;
    authMocks.useAuth.mockReturnValue({ user: { uid: 'user-1' }, loading: false });
  });

  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = undefined;
    vi.clearAllMocks();
  });

  it('stays idle and does not query when there is no authenticated user', async () => {
    authMocks.useAuth.mockReturnValue({ user: null, loading: false });

    await mount();

    expect(serviceMocks.listPaged).not.toHaveBeenCalled();
    expect(current()).toMatchObject({
      items: [],
      loading: false,
      refreshing: false,
      hasMore: false,
      error: null,
    });
  });

  it('loads page one with the authenticated uid, filter, page size and null cursor', async () => {
    serviceMocks.listPaged.mockResolvedValue(page([transaction('one')], cursorOne, true));

    await mount(salaryFilter);

    expect(serviceMocks.listPaged).toHaveBeenCalledWith('user-1', salaryFilter, 20, null);
    expect(current()).toMatchObject({
      items: [transaction('one')],
      loading: false,
      refreshing: false,
      hasMore: true,
      error: null,
    });
  });

  it('loads the next cursor once and appends without duplicate ids', async () => {
    serviceMocks.listPaged
      .mockResolvedValueOnce(page([transaction('one'), transaction('two')], cursorOne, true))
      .mockResolvedValueOnce(
        page([transaction('two', 'newer copy'), transaction('three')], cursorTwo, false)
      );
    await mount();

    await act(async () => {
      await Promise.all([current().loadMore(), current().loadMore()]);
    });

    expect(serviceMocks.listPaged).toHaveBeenCalledTimes(2);
    expect(serviceMocks.listPaged).toHaveBeenLastCalledWith('user-1', {}, 20, cursorOne);
    expect(current().items.map(({ id }) => id)).toEqual(['one', 'two', 'three']);
    expect(current().items[1].description).toBe('newer copy');
    expect(current().hasMore).toBe(false);

    await act(async () => current().loadMore());
    expect(serviceMocks.listPaged).toHaveBeenCalledTimes(2);
  });

  it('keeps current items visible while refresh replaces them from page one', async () => {
    const refreshPage = deferred<TransactionPage>();
    serviceMocks.listPaged
      .mockResolvedValueOnce(page([transaction('old')], cursorOne, true))
      .mockReturnValueOnce(refreshPage.promise);
    await mount();

    let refreshPromise!: Promise<void>;
    act(() => {
      refreshPromise = current().refresh();
    });

    expect(current().items.map(({ id }) => id)).toEqual(['old']);
    expect(current().loading).toBe(false);
    expect(current().refreshing).toBe(true);
    expect(serviceMocks.listPaged).toHaveBeenLastCalledWith('user-1', {}, 20, null);

    await act(async () => {
      refreshPage.resolve(page([transaction('fresh')], null, false));
      await refreshPromise;
    });

    expect(current()).toMatchObject({
      items: [transaction('fresh')],
      loading: false,
      refreshing: false,
      hasMore: false,
      error: null,
    });
  });

  it('coalesces concurrent refresh calls into one request and shared completion', async () => {
    const refreshPage = deferred<TransactionPage>();
    serviceMocks.listPaged
      .mockResolvedValueOnce(page([transaction('old')], cursorOne, true))
      .mockReturnValueOnce(refreshPage.promise);
    await mount();

    let firstRefresh!: Promise<void>;
    let secondRefresh!: Promise<void>;
    act(() => {
      firstRefresh = current().refresh();
      secondRefresh = current().refresh();
    });

    expect(firstRefresh).toBe(secondRefresh);
    expect(serviceMocks.listPaged).toHaveBeenCalledTimes(2);
    expect(current().refreshing).toBe(true);

    await act(async () => {
      refreshPage.resolve(page([transaction('fresh')], null, false));
      await Promise.all([firstRefresh, secondRefresh]);
    });

    expect(serviceMocks.listPaged).toHaveBeenCalledTimes(2);
    expect(current()).toMatchObject({
      items: [transaction('fresh')],
      refreshing: false,
      hasMore: false,
      error: null,
    });
  });

  it('resets on a meaningful filter change and ignores the stale response', async () => {
    const stalePage = deferred<TransactionPage>();
    const currentPage = deferred<TransactionPage>();
    serviceMocks.listPaged
      .mockReturnValueOnce(stalePage.promise)
      .mockReturnValueOnce(currentPage.promise);

    await mount(salaryFilter);
    await rerender(foodFilter);

    expect(current().items).toEqual([]);
    expect(serviceMocks.listPaged).toHaveBeenNthCalledWith(2, 'user-1', foodFilter, 20, null);

    await act(async () => {
      currentPage.resolve(page([transaction('food')], null, false));
      await currentPage.promise;
    });
    await act(async () => {
      stalePage.resolve(page([transaction('stale')], cursorOne, true));
      await stalePage.promise;
    });

    expect(current().items.map(({ id }) => id)).toEqual(['food']);
    expect(current().hasMore).toBe(false);
  });

  it('does not allow loadMore to append stale items during a filter transition', async () => {
    serviceMocks.listPaged
      .mockResolvedValueOnce(page([transaction('salary')], cursorOne, true))
      .mockResolvedValueOnce(page([transaction('food')], null, false));
    await mount(salaryFilter);

    act(() => {
      renderer?.update(<Probe filter={foodFilter} />);
    });

    await act(async () => current().loadMore());

    expect(current().items.map(({ id }) => id)).toEqual(['food']);
    expect(current().hasMore).toBe(false);
  });

  it('does not reload for an equivalent category filter in another order', async () => {
    serviceMocks.listPaged.mockResolvedValue(page([], null, false));
    await mount({ categories: ['food', 'salary'] });

    await rerender({ categories: ['salary', 'food'] });

    expect(serviceMocks.listPaged).toHaveBeenCalledTimes(1);
  });

  it('clears loading and exposes an error after the initial request fails', async () => {
    serviceMocks.listPaged.mockRejectedValue(new Error('offline'));

    await mount();

    expect(current()).toMatchObject({
      items: [],
      loading: false,
      refreshing: false,
      hasMore: false,
      error: 'Falha ao carregar transações',
    });
  });

  it('preserves items and clears refreshing when refresh fails', async () => {
    serviceMocks.listPaged
      .mockResolvedValueOnce(page([transaction('one')], cursorOne, true))
      .mockRejectedValueOnce(new Error('offline'));
    await mount();

    await act(async () => current().refresh());

    expect(current()).toMatchObject({
      items: [transaction('one')],
      loading: false,
      refreshing: false,
      hasMore: true,
      error: 'Falha ao carregar transações',
    });
  });

  it('keeps pagination state after a failed loadMore and retries from the same cursor', async () => {
    serviceMocks.listPaged
      .mockResolvedValueOnce(page([transaction('one')], cursorOne, true))
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(page([transaction('two')], cursorTwo, false));
    await mount();

    await act(async () => current().loadMore());

    expect(serviceMocks.listPaged).toHaveBeenNthCalledWith(2, 'user-1', {}, 20, cursorOne);
    expect(current()).toMatchObject({
      items: [transaction('one')],
      loading: false,
      refreshing: false,
      hasMore: true,
      error: 'Falha ao carregar transações',
    });

    await act(async () => current().loadMore());

    expect(serviceMocks.listPaged).toHaveBeenNthCalledWith(3, 'user-1', {}, 20, cursorOne);
    expect(current()).toMatchObject({
      items: [transaction('one'), transaction('two')],
      loading: false,
      refreshing: false,
      hasMore: false,
      error: null,
    });
  });
});

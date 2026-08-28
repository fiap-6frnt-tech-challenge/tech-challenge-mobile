import { useEffect } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Transaction } from '../domain';
import { TransactionProvider, useTransactions, reducer, initialState } from './TransactionContext';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const authMocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock('./AuthContext', () => ({
  useAuth: authMocks.useAuth,
}));

const transactionsServiceMocks = vi.hoisted(() => ({
  subscribe: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

const storageServiceMocks = vi.hoisted(() => ({
  deleteReceipt: vi.fn(),
}));

vi.mock('../services/transactions.service', () => ({
  transactionsService: transactionsServiceMocks,
}));

vi.mock('../services/storage.service', () => ({
  storageService: storageServiceMocks,
}));

type TransactionsValue = ReturnType<typeof useTransactions>;
let currentTransactionsValue: TransactionsValue | undefined;
let renderer: ReactTestRenderer | undefined;

function TransactionsProbe() {
  const value = useTransactions();

  useEffect(() => {
    currentTransactionsValue = value;
  }, [value]);

  return null;
}

function currentTransactions(): TransactionsValue {
  if (!currentTransactionsValue) throw new Error('TransactionProvider has not rendered');
  return currentTransactionsValue;
}

function renderProvider(): void {
  act(() => {
    renderer = create(
      <TransactionProvider>
        <TransactionsProbe />
      </TransactionProvider>
    );
  });
}

const unsubscribe = vi.fn();

function mockSubscription() {
  let emitItems: (items: Transaction[]) => void = () => undefined;
  let emitError: (error: unknown) => void = () => undefined;

  transactionsServiceMocks.subscribe.mockImplementation(
    (_uid: string, onItems: (items: Transaction[]) => void, onError: (error: unknown) => void) => {
      emitItems = onItems;
      emitError = onError;
      return unsubscribe;
    }
  );

  return {
    items: (items: Transaction[]) => act(() => emitItems(items)),
    fail: (error: unknown) => act(() => emitError(error)),
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  currentTransactionsValue = undefined;
  renderer = undefined;
});

describe('TransactionContext reducer', () => {
  it('should return the initial state', () => {
    expect(initialState).toEqual({
      items: [],
      loading: false,
      error: null,
    });
  });

  it('should handle LOADING action', () => {
    const state = reducer(
      { items: [], loading: false, error: 'previous error' },
      { type: 'LOADING' }
    );
    expect(state).toEqual({
      items: [],
      loading: true,
      error: null,
    });
  });

  it('should handle LOADED action', () => {
    const mockItems: Transaction[] = [
      {
        id: '1',
        userId: 'user-123',
        type: 'deposit',
        description: 'Test',
        amount: 10,
        category: 'food',
        date: '2026-08-12',
        createdAt: '2026-08-12T00:00:00.000Z',
      },
    ];
    const state = reducer(
      { items: [], loading: true, error: 'some error' },
      { type: 'LOADED', items: mockItems }
    );
    expect(state).toEqual({
      items: mockItems,
      loading: false,
      error: null,
    });
  });

  it('should handle ERROR action', () => {
    const state = reducer(
      { items: [], loading: true, error: null },
      { type: 'ERROR', error: 'Failed' }
    );
    expect(state).toEqual({
      items: [],
      loading: false,
      error: 'Failed',
    });
  });
});

describe('TransactionProvider integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    renderer = undefined;
  });

  afterEach(() => {
    if (renderer) {
      act(() => renderer?.unmount());
      renderer = undefined;
    }
  });

  it('loads transactions automatically on mount for logged-in user', async () => {
    authMocks.useAuth.mockReturnValue({ user: { uid: 'user-123' }, loading: false });
    const mockItems: Transaction[] = [
      {
        id: '1',
        userId: 'user-123',
        type: 'deposit',
        description: 'Test',
        amount: 10,
        category: 'food',
        date: '2026-08-12',
        createdAt: '2026-08-12T00:00:00.000Z',
      },
    ];
    const subscription = mockSubscription();

    await act(async () => {
      renderProvider();
    });

    expect(transactionsServiceMocks.subscribe).toHaveBeenCalledWith(
      'user-123',
      expect.any(Function),
      expect.any(Function)
    );

    subscription.items(mockItems);

    expect(currentTransactions().items).toEqual(mockItems);
    expect(currentTransactions().loading).toBe(false);
    expect(currentTransactions().error).toBeNull();
  });

  it('drops the listener when the provider unmounts', async () => {
    authMocks.useAuth.mockReturnValue({ user: { uid: 'user-123' }, loading: false });
    mockSubscription();

    await act(async () => {
      renderProvider();
    });
    act(() => renderer?.unmount());
    renderer = undefined;

    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it('sets error state when the subscription fails', async () => {
    authMocks.useAuth.mockReturnValue({ user: { uid: 'user-123' }, loading: false });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const subscription = mockSubscription();

    await act(async () => {
      renderProvider();
    });
    subscription.fail(new Error('Fetch failed'));

    expect(currentTransactions().error).toBe('Falha ao carregar transações');
    expect(currentTransactions().loading).toBe(false);
  });

  it('re-subscribes and settles when refresh is called after a failure', async () => {
    authMocks.useAuth.mockReturnValue({ user: { uid: 'user-123' }, loading: false });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const subscription = mockSubscription();

    await act(async () => {
      renderProvider();
    });
    subscription.fail(new Error('Fetch failed'));

    let settled = false;
    await act(async () => {
      const pending = currentTransactions()
        .refresh()
        .then(() => {
          settled = true;
        });
      subscription.items([]);
      await pending;
    });

    expect(transactionsServiceMocks.subscribe).toHaveBeenCalledTimes(2);
    expect(settled).toBe(true);
    expect(currentTransactions().error).toBeNull();
  });

  it('clears transaction items when user is logged out', async () => {
    authMocks.useAuth.mockReturnValue({ user: null, loading: false });

    await act(async () => {
      renderProvider();
    });

    expect(transactionsServiceMocks.subscribe).not.toHaveBeenCalled();
    expect(currentTransactions().items).toEqual([]);
    expect(currentTransactions().loading).toBe(false);
  });

  it('delegates transaction creation and lets the listener publish it', async () => {
    authMocks.useAuth.mockReturnValue({ user: { uid: 'user-123' }, loading: false });
    const subscription = mockSubscription();

    await act(async () => {
      renderProvider();
    });
    subscription.items([]);

    transactionsServiceMocks.create.mockResolvedValue('2');

    await act(async () => {
      await currentTransactions().create({
        type: 'withdrawal',
        description: 'New',
        amount: 20,
        category: 'housing',
        date: '2026-08-12',
      });
    });

    expect(transactionsServiceMocks.create).toHaveBeenCalledWith('user-123', {
      type: 'withdrawal',
      description: 'New',
      amount: 20,
      category: 'housing',
      date: '2026-08-12',
    });
    expect(transactionsServiceMocks.subscribe).toHaveBeenCalledOnce();

    subscription.items([
      {
        id: '2',
        userId: 'user-123',
        type: 'withdrawal',
        description: 'New',
        amount: 20,
        category: 'housing',
        date: '2026-08-12',
        createdAt: '2026-08-12T00:00:00.000Z',
      },
    ]);

    expect(currentTransactions().items[0].description).toBe('New');
  });

  it('delegates transaction update and refreshes state', async () => {
    authMocks.useAuth.mockReturnValue({ user: { uid: 'user-123' }, loading: false });
    const initialItem: Transaction = {
      id: '1',
      userId: 'user-123',
      type: 'withdrawal',
      description: 'Old',
      amount: 10,
      category: 'food',
      date: '2026-08-12',
      createdAt: '2026-08-12T00:00:00.000Z',
    };
    const subscription = mockSubscription();

    await act(async () => {
      renderProvider();
    });
    subscription.items([initialItem]);

    transactionsServiceMocks.update.mockResolvedValue(undefined);

    await act(async () => {
      await currentTransactions().update('1', { description: 'Updated' });
    });

    expect(transactionsServiceMocks.update).toHaveBeenCalledWith('user-123', '1', {
      description: 'Updated',
    });
    expect(transactionsServiceMocks.subscribe).toHaveBeenCalledOnce();

    subscription.items([{ ...initialItem, description: 'Updated' }]);

    expect(currentTransactions().items[0].description).toBe('Updated');
  });

  it('delegates transaction removal and refreshes state', async () => {
    authMocks.useAuth.mockReturnValue({ user: { uid: 'user-123' }, loading: false });
    const initialItem: Transaction = {
      id: '1',
      userId: 'user-123',
      type: 'withdrawal',
      description: 'Old',
      amount: 10,
      category: 'food',
      date: '2026-08-12',
      createdAt: '2026-08-12T00:00:00.000Z',
    };
    const subscription = mockSubscription();

    await act(async () => {
      renderProvider();
    });
    subscription.items([initialItem]);

    transactionsServiceMocks.remove.mockResolvedValue(undefined);

    await act(async () => {
      await currentTransactions().remove('1');
    });

    expect(transactionsServiceMocks.remove).toHaveBeenCalledWith('user-123', '1');
    expect(transactionsServiceMocks.subscribe).toHaveBeenCalledOnce();

    subscription.items([]);

    expect(currentTransactions().items).toEqual([]);
  });
});

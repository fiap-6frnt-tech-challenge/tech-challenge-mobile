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
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('../services/transactions.service', () => ({
  transactionsService: transactionsServiceMocks,
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
    transactionsServiceMocks.list.mockResolvedValue(mockItems);

    await act(async () => {
      renderProvider();
    });

    expect(transactionsServiceMocks.list).toHaveBeenCalledWith('user-123');
    expect(currentTransactions().items).toEqual(mockItems);
    expect(currentTransactions().loading).toBe(false);
    expect(currentTransactions().error).toBeNull();
  });

  it('sets error state when loading transactions fails', async () => {
    authMocks.useAuth.mockReturnValue({ user: { uid: 'user-123' }, loading: false });
    transactionsServiceMocks.list.mockRejectedValue(new Error('Fetch failed'));

    await act(async () => {
      renderProvider();
    });

    expect(currentTransactions().error).toBe('Falha ao carregar transações');
    expect(currentTransactions().loading).toBe(false);
  });

  it('clears transaction items when user is logged out', async () => {
    authMocks.useAuth.mockReturnValue({ user: null, loading: false });

    await act(async () => {
      renderProvider();
    });

    expect(transactionsServiceMocks.list).not.toHaveBeenCalled();
    expect(currentTransactions().items).toEqual([]);
    expect(currentTransactions().loading).toBe(false);
  });

  it('delegates transaction creation and refreshes state', async () => {
    authMocks.useAuth.mockReturnValue({ user: { uid: 'user-123' }, loading: false });
    transactionsServiceMocks.list.mockResolvedValue([]);

    await act(async () => {
      renderProvider();
    });

    transactionsServiceMocks.create.mockResolvedValue({ id: '2' });
    transactionsServiceMocks.list.mockResolvedValue([
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
    transactionsServiceMocks.list.mockResolvedValue([initialItem]);

    await act(async () => {
      renderProvider();
    });

    transactionsServiceMocks.update.mockResolvedValue(undefined);
    transactionsServiceMocks.list.mockResolvedValue([{ ...initialItem, description: 'Updated' }]);

    await act(async () => {
      await currentTransactions().update('1', { description: 'Updated' });
    });

    expect(transactionsServiceMocks.update).toHaveBeenCalledWith('user-123', '1', {
      description: 'Updated',
    });
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
    transactionsServiceMocks.list.mockResolvedValue([initialItem]);

    await act(async () => {
      renderProvider();
    });

    transactionsServiceMocks.remove.mockResolvedValue(undefined);
    transactionsServiceMocks.list.mockResolvedValue([]);

    await act(async () => {
      await currentTransactions().remove('1');
    });

    expect(transactionsServiceMocks.remove).toHaveBeenCalledWith('user-123', '1');
    expect(currentTransactions().items).toEqual([]);
  });
});

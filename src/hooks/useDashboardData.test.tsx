import { useEffect } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Transaction } from '../domain';
import { TRANSACTION_TYPE } from '../domain';
import { useDashboardData } from './useDashboardData';

const transactionContextMock = vi.hoisted(() => ({
  useTransactions: vi.fn(),
}));

vi.mock('../contexts/TransactionContext', () => ({
  useTransactions: transactionContextMock.useTransactions,
}));

const transactions: Transaction[] = [
  {
    id: 'income',
    userId: 'user-1',
    type: TRANSACTION_TYPE.DEPOSIT,
    category: 'salary',
    amount: 3000,
    date: '2026-08-01',
    description: 'Salário',
    createdAt: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'food',
    userId: 'user-1',
    type: TRANSACTION_TYPE.WITHDRAWAL,
    category: 'food',
    amount: 450,
    date: '2026-08-05',
    description: 'Mercado',
    createdAt: '2026-08-05T10:00:00.000Z',
  },
  {
    id: 'transfer',
    userId: 'user-1',
    type: TRANSACTION_TYPE.TRANSFER,
    category: 'transfer',
    amount: 200,
    date: '2026-08-06',
    description: 'Transferência',
    createdAt: '2026-08-06T10:00:00.000Z',
  },
];

let currentValue: ReturnType<typeof useDashboardData> | undefined;
let renderer: ReactTestRenderer | undefined;

function DashboardDataProbe() {
  const value = useDashboardData();

  useEffect(() => {
    currentValue = value;
  }, [value]);

  return null;
}

function renderProbe() {
  act(() => {
    renderer = create(<DashboardDataProbe />);
  });
}

describe('useDashboardData', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-17T12:00:00.000Z'));
    currentValue = undefined;
    renderer = undefined;
    transactionContextMock.useTransactions.mockReset();
  });

  afterEach(() => {
    renderer?.unmount();
    renderer = undefined;
    vi.useRealTimers();
  });

  it('returns all dashboard series from the transactions context', () => {
    const refresh = vi.fn();
    transactionContextMock.useTransactions.mockReturnValue({
      items: transactions,
      loading: false,
      error: null,
      refresh,
    });

    renderProbe();

    expect(currentValue).toMatchObject({
      totals: { income: 3000, expense: 450, balance: 2550 },
      byCategory: [{ category: 'food', total: 450 }],
      topCategory: { category: 'food', total: 450 },
      loading: false,
      error: null,
      refresh,
      isEmpty: false,
    });
    expect(currentValue?.byMonth.at(-1)).toEqual({
      month: '2026-08',
      income: 3000,
      expense: 450,
    });
    expect(currentValue?.balanceOverTime.at(-1)).toEqual({
      date: '2026-08-06',
      balance: 2550,
    });
  });

  it('exposes the empty state and context status for an empty list', () => {
    const refresh = vi.fn();
    transactionContextMock.useTransactions.mockReturnValue({
      items: [],
      loading: true,
      error: 'Falha ao carregar transações',
      refresh,
    });

    renderProbe();

    expect(currentValue).toMatchObject({
      totals: { income: 0, expense: 0, balance: 0 },
      byMonth: expect.any(Array),
      byCategory: [],
      balanceOverTime: [],
      topCategory: null,
      loading: true,
      error: 'Falha ao carregar transações',
      refresh,
      isEmpty: true,
    });
  });
});

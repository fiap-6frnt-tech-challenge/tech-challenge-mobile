import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TRANSACTION_TYPE, type Transaction } from './index';
import { balance, balanceOverTime, byCategory, byMonth, topCategory, totals } from './aggregations';

const transactions: Transaction[] = [
  {
    id: 'deposit-january',
    userId: 'joana',
    type: TRANSACTION_TYPE.DEPOSIT,
    category: 'salary',
    amount: 1000,
    date: '2026-01-10',
    description: 'Salary',
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'food-january',
    userId: 'joana',
    type: TRANSACTION_TYPE.WITHDRAWAL,
    category: 'food',
    amount: 210,
    date: '2026-01-20',
    description: 'Groceries',
    createdAt: '2026-01-20T10:00:00.000Z',
  },
  {
    id: 'transport-february',
    userId: 'joana',
    type: TRANSACTION_TYPE.WITHDRAWAL,
    category: 'transport',
    amount: 150,
    date: '2026-02-05',
    description: 'Fuel',
    createdAt: '2026-02-05T10:00:00.000Z',
  },
  {
    id: 'food-february',
    userId: 'joana',
    type: TRANSACTION_TYPE.WITHDRAWAL,
    category: 'food',
    amount: 50,
    date: '2026-02-25',
    description: 'Restaurant',
    createdAt: '2026-02-25T10:00:00.000Z',
  },
  {
    id: 'transfer-february',
    userId: 'joana',
    type: TRANSACTION_TYPE.TRANSFER,
    category: 'transfer',
    amount: 300,
    date: '2026-02-28',
    description: 'Transfer',
    createdAt: '2026-02-28T10:00:00.000Z',
  },
];

describe('dashboard aggregations', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates balance while keeping transfers neutral', () => {
    expect(balance(transactions)).toBe(590);
  });

  it('returns zero balance for an empty list', () => {
    expect(balance([])).toBe(0);
  });

  it('returns income, expense, and balance totals', () => {
    expect(totals(transactions)).toEqual({ income: 1000, expense: 410, balance: 590 });
  });

  it('returns zero totals for an empty list', () => {
    expect(totals([])).toEqual({ income: 0, expense: 0, balance: 0 });
  });

  it('groups withdrawals by category and sorts largest totals first', () => {
    expect(byCategory(transactions)).toEqual([
      { category: 'food', total: 260 },
      { category: 'transport', total: 150 },
    ]);
  });

  it('returns no category aggregates when there are no withdrawals', () => {
    expect(byCategory([transactions[0], transactions[4]])).toEqual([]);
  });

  it('returns exactly the requested UTC month buckets and fills gaps', () => {
    expect(byMonth(transactions, 3)).toEqual([
      { month: '2026-01', income: 1000, expense: 210 },
      { month: '2026-02', income: 0, expense: 200 },
      { month: '2026-03', income: 0, expense: 0 },
    ]);
  });

  it('ignores transactions outside the requested month range', () => {
    expect(byMonth(transactions, 1)).toEqual([{ month: '2026-03', income: 0, expense: 0 }]);
  });

  it('returns an empty list when zero months are requested', () => {
    expect(byMonth(transactions, 0)).toEqual([]);
  });

  it('returns running balances in chronological order', () => {
    expect(balanceOverTime(transactions)).toEqual([
      { date: '2026-01-10', balance: 1000 },
      { date: '2026-01-20', balance: 790 },
      { date: '2026-02-05', balance: 640 },
      { date: '2026-02-25', balance: 590 },
      { date: '2026-02-28', balance: 590 },
    ]);
  });

  it('returns the largest current-month expense category', () => {
    const currentMonthTransactions = [
      ...transactions,
      { ...transactions[1], id: 'food-march', amount: 90, date: '2026-03-02' },
      { ...transactions[2], id: 'transport-march', amount: 120, date: '2026-03-03' },
    ];

    expect(topCategory(currentMonthTransactions)).toEqual({ category: 'transport', total: 120 });
  });

  it('returns null when the current month has no withdrawals', () => {
    expect(topCategory(transactions)).toBeNull();
  });
});

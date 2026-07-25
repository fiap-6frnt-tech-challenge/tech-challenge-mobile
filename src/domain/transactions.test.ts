import { describe, expect, it } from 'vitest';

import {
  aggregateByMonth,
  calculateBalance,
  cumulativeBalance,
  getAll,
  getRecent,
  groupByCategory,
  TRANSACTION_TYPE,
  type Transaction,
} from './index';

const transactions: Transaction[] = [
  {
    id: '2',
    userId: 'joana',
    type: TRANSACTION_TYPE.WITHDRAWAL,
    category: 'food',
    amount: 25,
    date: '2026-01-02',
    description: 'Withdrawal',
    createdAt: '2026-01-02T10:00:00.000Z',
  },
  {
    id: '1',
    userId: 'joana',
    type: TRANSACTION_TYPE.DEPOSIT,
    category: 'salary',
    amount: 100,
    date: '2026-01-03',
    description: 'Deposit',
    createdAt: '2026-01-03T10:00:00.000Z',
  },
  {
    id: '3',
    userId: 'joana',
    type: TRANSACTION_TYPE.TRANSFER,
    category: 'transfer',
    amount: 40,
    date: '2026-01-01',
    description: 'Transfer',
    createdAt: '2026-01-01T10:00:00.000Z',
  },
];

describe('transaction utilities', () => {
  it('calculates balance from deposits and withdrawals while transfers stay neutral', () => {
    expect(calculateBalance(transactions)).toBe(75);
  });

  it('sorts transactions by descending ISO date without mutating the source list', () => {
    const sorted = getAll(transactions);

    expect(sorted.map((transaction) => transaction.id)).toEqual(['1', '2', '3']);
    expect(transactions.map((transaction) => transaction.id)).toEqual(['2', '1', '3']);
  });

  it('returns the most recent transactions respecting the requested limit', () => {
    expect(getRecent(transactions, 2).map((transaction) => transaction.id)).toEqual(['1', '2']);
  });
});

const aggregated: Transaction[] = [
  {
    id: 'a1',
    userId: 'joana',
    type: TRANSACTION_TYPE.DEPOSIT,
    category: 'salary',
    amount: 5000,
    date: '2026-01-05',
    description: 'Salary',
    createdAt: '2026-01-05T10:00:00.000Z',
  },
  {
    id: 'a2',
    userId: 'joana',
    type: TRANSACTION_TYPE.WITHDRAWAL,
    category: 'food',
    amount: 120,
    date: '2026-01-10',
    description: 'Groceries',
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'a3',
    userId: 'joana',
    type: TRANSACTION_TYPE.WITHDRAWAL,
    category: 'food',
    amount: 80,
    date: '2026-01-20',
    description: 'Restaurant',
    createdAt: '2026-01-20T10:00:00.000Z',
  },
  {
    id: 'a4',
    userId: 'joana',
    type: TRANSACTION_TYPE.WITHDRAWAL,
    category: 'transport',
    amount: 50,
    date: '2026-01-22',
    description: 'Fuel',
    createdAt: '2026-01-22T10:00:00.000Z',
  },
  {
    id: 'a5',
    userId: 'joana',
    type: TRANSACTION_TYPE.TRANSFER,
    category: 'transfer',
    amount: 800,
    date: '2026-02-10',
    description: 'Transfer only month',
    createdAt: '2026-02-10T10:00:00.000Z',
  },
];

describe('aggregateByMonth', () => {
  it('returns an empty array for no transactions', () => {
    expect(aggregateByMonth([])).toEqual([]);
  });

  it('sums income and expense per month, ignoring transfers', () => {
    expect(aggregateByMonth(aggregated)).toEqual([
      { month: '2026-01', income: 5000, expense: 250 },
      { month: '2026-02', income: 0, expense: 0 },
    ]);
  });
});

describe('cumulativeBalance', () => {
  it('accumulates the running balance chronologically, treating transfers as neutral', () => {
    expect(cumulativeBalance(aggregated)).toEqual([
      { date: '2026-01-05', balance: 5000 },
      { date: '2026-01-10', balance: 4880 },
      { date: '2026-01-20', balance: 4800 },
      { date: '2026-01-22', balance: 4750 },
      { date: '2026-02-10', balance: 4750 },
    ]);
  });
});

describe('groupByCategory', () => {
  it('totals only withdrawals per category, sorted by largest total first', () => {
    expect(groupByCategory(aggregated)).toEqual([
      { category: 'food', total: 200 },
      { category: 'transport', total: 50 },
    ]);
  });
});

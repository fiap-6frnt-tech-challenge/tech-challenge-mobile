import type { CategoryId } from './categories';
import { TRANSACTION_TYPE } from './constants';
import type { Transaction } from './transaction';

export interface MonthlyAggregate {
  month: string;
  income: number;
  expense: number;
}

export interface BalancePoint {
  date: string;
  balance: number;
}

export interface CategoryAggregate {
  category: CategoryId;
  total: number;
}

export function getAll(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((acc, transaction) => {
    if (transaction.type === TRANSACTION_TYPE.DEPOSIT) return acc + transaction.amount;
    if (transaction.type === TRANSACTION_TYPE.WITHDRAWAL) return acc - transaction.amount;
    return acc;
  }, 0);
}

export function getRecent(transactions: Transaction[], limit = 5): Transaction[] {
  return getAll(transactions).slice(0, limit);
}

export function aggregateByMonth(transactions: Transaction[]): MonthlyAggregate[] {
  const map = new Map<string, MonthlyAggregate>();

  for (const transaction of transactions) {
    const month = transaction.date.slice(0, 7);
    const entry = map.get(month) ?? { month, income: 0, expense: 0 };

    if (transaction.type === TRANSACTION_TYPE.DEPOSIT) entry.income += transaction.amount;
    else if (transaction.type === TRANSACTION_TYPE.WITHDRAWAL) entry.expense += transaction.amount;

    map.set(month, entry);
  }

  return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export function cumulativeBalance(transactions: Transaction[]): BalancePoint[] {
  const ordered = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  let running = 0;

  return ordered.map((transaction) => {
    if (transaction.type === TRANSACTION_TYPE.DEPOSIT) running += transaction.amount;
    else if (transaction.type === TRANSACTION_TYPE.WITHDRAWAL) running -= transaction.amount;

    return { date: transaction.date, balance: running };
  });
}

export function groupByCategory(transactions: Transaction[]): CategoryAggregate[] {
  const map = new Map<CategoryId, number>();

  for (const transaction of transactions) {
    if (transaction.type !== TRANSACTION_TYPE.WITHDRAWAL) continue;
    map.set(transaction.category, (map.get(transaction.category) ?? 0) + transaction.amount);
  }

  return [...map.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

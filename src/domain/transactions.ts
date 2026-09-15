import { balance, balanceOverTime, byCategory, type MonthlyAggregate } from './aggregations';
import { TRANSACTION_TYPE } from './constants';
import type { Transaction } from './transaction';

export type { BalancePoint, CategoryAggregate, MonthlyAggregate } from './aggregations';

export function getAll(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const calculateBalance = balance;

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

export const cumulativeBalance = balanceOverTime;

export const groupByCategory = byCategory;

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

export interface Totals {
  income: number;
  expense: number;
  balance: number;
}

export type TopCategory = CategoryAggregate;

function transactionMonth(date: string): string {
  const parsedDate = new Date(`${date.slice(0, 10)}T00:00:00.000Z`);
  return `${parsedDate.getUTCFullYear()}-${String(parsedDate.getUTCMonth() + 1).padStart(2, '0')}`;
}

function currentMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function balance(transactions: Transaction[]): number {
  return transactions.reduce((currentBalance, transaction) => {
    if (transaction.type === TRANSACTION_TYPE.DEPOSIT) return currentBalance + transaction.amount;
    if (transaction.type === TRANSACTION_TYPE.WITHDRAWAL)
      return currentBalance - transaction.amount;
    return currentBalance;
  }, 0);
}

export function totals(transactions: Transaction[]): Totals {
  const { income, expense } = transactions.reduce(
    (currentTotals, transaction) => {
      if (transaction.type === TRANSACTION_TYPE.DEPOSIT) currentTotals.income += transaction.amount;
      if (transaction.type === TRANSACTION_TYPE.WITHDRAWAL)
        currentTotals.expense += transaction.amount;
      return currentTotals;
    },
    { income: 0, expense: 0 }
  );

  return { income, expense, balance: income - expense };
}

export function byCategory(transactions: Transaction[]): CategoryAggregate[] {
  const categories = new Map<CategoryId, number>();

  for (const transaction of transactions) {
    if (transaction.type !== TRANSACTION_TYPE.WITHDRAWAL) continue;
    categories.set(
      transaction.category,
      (categories.get(transaction.category) ?? 0) + transaction.amount
    );
  }

  return [...categories.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((left, right) => right.total - left.total);
}

export function byMonth(transactions: Transaction[], months = 6): MonthlyAggregate[] {
  const bucketCount = Math.max(0, Math.floor(months));
  if (bucketCount === 0) return [];

  const now = new Date();
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - bucketCount + index + 1, 1)
    );
    return {
      month: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`,
      income: 0,
      expense: 0,
    };
  });
  const bucketsByMonth = new Map(buckets.map((bucket) => [bucket.month, bucket]));

  for (const transaction of transactions) {
    const bucket = bucketsByMonth.get(transactionMonth(transaction.date));
    if (!bucket) continue;
    if (transaction.type === TRANSACTION_TYPE.DEPOSIT) bucket.income += transaction.amount;
    if (transaction.type === TRANSACTION_TYPE.WITHDRAWAL) bucket.expense += transaction.amount;
  }

  return buckets;
}

export function balanceOverTime(transactions: Transaction[]): BalancePoint[] {
  let runningBalance = 0;

  return [...transactions]
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((transaction) => {
      if (transaction.type === TRANSACTION_TYPE.DEPOSIT) runningBalance += transaction.amount;
      if (transaction.type === TRANSACTION_TYPE.WITHDRAWAL) runningBalance -= transaction.amount;
      return { date: transaction.date, balance: runningBalance };
    });
}

export function topCategory(transactions: Transaction[]): TopCategory | null {
  const currentTransactions = transactions.filter(
    (transaction) =>
      transaction.type === TRANSACTION_TYPE.WITHDRAWAL &&
      transactionMonth(transaction.date) === currentMonth()
  );

  return byCategory(currentTransactions)[0] ?? null;
}

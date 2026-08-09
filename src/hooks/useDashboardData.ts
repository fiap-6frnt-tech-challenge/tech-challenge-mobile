import { useMemo } from "react";
import { useTransactions } from "../contexts/TransactionContext";
import { balanceOverTime, byCategory, byMonth, topCategory, totals } from "../domain";

export function useDashboardData() {
  const { items, loading, error, refresh } = useTransactions();

  const data = useMemo(() => ({
    totals: totals(items),
    byMonth: byMonth(items, 6),
    byCategory: byCategory(items),
    balanceOverTime: balanceOverTime(items),
    topCategory: topCategory(items),
  }), [items]);

  return { ...data, loading, error, refresh, isEmpty: items.length === 0 };
}
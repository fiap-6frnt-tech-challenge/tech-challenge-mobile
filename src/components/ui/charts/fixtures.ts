import type { BalancePoint, CategoryAggregate, MonthlyAggregate } from '@/src/domain';

export const monthlyFixture: MonthlyAggregate[] = [
  { month: '2026-02', income: 5200, expense: 3980 },
  { month: '2026-03', income: 5200, expense: 4610 },
  { month: '2026-04', income: 6100, expense: 3240 },
  { month: '2026-05', income: 5200, expense: 5890 },
  { month: '2026-06', income: 7350, expense: 4120 },
  { month: '2026-07', income: 5200, expense: 2870 },
];

export const monthlyWithGapFixture: MonthlyAggregate[] = [
  { month: '2026-05', income: 5200, expense: 4310 },
  { month: '2026-06', income: 0, expense: 0 },
  { month: '2026-07', income: 5200, expense: 1180 },
];

export const categoryFixture: CategoryAggregate[] = [
  { category: 'housing', total: 2100 },
  { category: 'food', total: 1340.75 },
  { category: 'transport', total: 620.4 },
  { category: 'health', total: 480 },
  { category: 'leisure', total: 310.9 },
  { category: 'education', total: 250 },
  { category: 'other', total: 98.6 },
];

export const categoryShortFixture: CategoryAggregate[] = [
  { category: 'food', total: 820.5 },
  { category: 'transport', total: 310 },
  { category: 'leisure', total: 145.9 },
];

export const balanceFixture: BalancePoint[] = [
  { date: '2026-07-01', balance: 1200 },
  { date: '2026-07-03', balance: 980.5 },
  { date: '2026-07-06', balance: 2480.5 },
  { date: '2026-07-09', balance: 2115.2 },
  { date: '2026-07-13', balance: 1890 },
  { date: '2026-07-17', balance: 3390 },
  { date: '2026-07-20', balance: 3012.4 },
  { date: '2026-07-24', balance: 2740.9 },
  { date: '2026-07-28', balance: 4190.9 },
];

export const balanceWithNegativeFixture: BalancePoint[] = [
  { date: '2026-07-01', balance: 640 },
  { date: '2026-07-05', balance: 120 },
  { date: '2026-07-09', balance: -430.5 },
  { date: '2026-07-14', balance: -910 },
  { date: '2026-07-19', balance: -215.4 },
  { date: '2026-07-25', balance: 380 },
  { date: '2026-07-30', balance: 1125.6 },
];

export const balanceDenseFixture: BalancePoint[] = Array.from({ length: 30 }, (_, index) => {
  const day = String(index + 1).padStart(2, '0');
  return {
    date: `2026-06-${day}`,
    balance: Math.round((1500 + index * 95 + Math.sin(index) * 480) * 100) / 100,
  };
});

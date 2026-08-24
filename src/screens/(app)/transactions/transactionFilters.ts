import { BADGE_LABEL_MAP, CATEGORIES, type CategoryId } from '@/src/domain';
import type { TxFilter } from '@/src/services/transactions.service';

export type StructuredTransactionFilter = Omit<TxFilter, 'search'>;
export type TransactionFilterChipKey =
  | 'type'
  | 'dateFrom'
  | 'dateTo'
  | `category:${CategoryId}`;

export interface ActiveTransactionFilterChip {
  key: TransactionFilterChipKey;
  label: string;
}

function compactTransactionFilter(filter: TxFilter): TxFilter {
  const next: TxFilter = {};
  if (filter.type) next.type = filter.type;
  if (filter.categories?.length) next.categories = filter.categories;
  if (filter.dateFrom) next.dateFrom = filter.dateFrom;
  if (filter.dateTo) next.dateTo = filter.dateTo;
  if (filter.search?.trim()) next.search = filter.search.trim();
  return next;
}

function formatDate(value: string): string {
  const [year, month, day] = value.split('-');
  return day && month && year ? `${day}/${month}/${year}` : value;
}

export function updateTransactionSearch(current: TxFilter, query: string): TxFilter {
  return compactTransactionFilter({ ...current, search: query });
}

export function replaceStructuredTransactionFilters(
  current: TxFilter,
  structured: StructuredTransactionFilter
): TxFilter {
  return compactTransactionFilter({ ...structured, search: current.search });
}

export function toStructuredTransactionFilter(
  filter: TxFilter
): StructuredTransactionFilter {
  const { type, categories, dateFrom, dateTo } = compactTransactionFilter(filter);
  return compactTransactionFilter({ type, categories, dateFrom, dateTo });
}

export function removeTransactionFilter(
  current: TxFilter,
  key: TransactionFilterChipKey
): TxFilter {
  if (key === 'type') return compactTransactionFilter({ ...current, type: undefined });
  if (key === 'dateFrom') return compactTransactionFilter({ ...current, dateFrom: undefined });
  if (key === 'dateTo') return compactTransactionFilter({ ...current, dateTo: undefined });

  const category = key.slice('category:'.length) as CategoryId;
  return compactTransactionFilter({
    ...current,
    categories: current.categories?.filter((item) => item !== category),
  });
}

export function getActiveTransactionFilterChips(
  filter: TxFilter
): ActiveTransactionFilterChip[] {
  const chips: ActiveTransactionFilterChip[] = [];

  if (filter.type) chips.push({ key: 'type', label: BADGE_LABEL_MAP[filter.type] });
  for (const categoryId of filter.categories ?? []) {
    const label = CATEGORIES.find(({ id }) => id === categoryId)?.label ?? categoryId;
    chips.push({ key: `category:${categoryId}`, label });
  }
  if (filter.dateFrom) {
    chips.push({ key: 'dateFrom', label: `De ${formatDate(filter.dateFrom)}` });
  }
  if (filter.dateTo) {
    chips.push({ key: 'dateTo', label: `Até ${formatDate(filter.dateTo)}` });
  }

  return chips;
}

export function hasAnyTransactionFilter(filter: TxFilter): boolean {
  return Object.keys(compactTransactionFilter(filter)).length > 0;
}

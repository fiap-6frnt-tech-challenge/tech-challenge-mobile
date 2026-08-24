import { describe, expect, it } from 'vitest';

import { TRANSACTION_TYPE } from '@/src/domain';
import {
  getActiveTransactionFilterChips,
  hasAnyTransactionFilter,
  removeTransactionFilter,
  replaceStructuredTransactionFilters,
  toStructuredTransactionFilter,
  updateTransactionSearch,
} from './transactionFilters';

describe('transactionFilters', () => {
  it('stores a trimmed search and removes an empty search', () => {
    expect(updateTransactionSearch({ type: TRANSACTION_TYPE.DEPOSIT }, '  mercado  ')).toEqual({
      type: TRANSACTION_TYPE.DEPOSIT,
      search: 'mercado',
    });
    expect(updateTransactionSearch({ search: 'mercado' }, '   ')).toEqual({});
  });

  it('replaces structured fields while preserving search', () => {
    expect(
      replaceStructuredTransactionFilters(
        { search: 'mercado', type: TRANSACTION_TYPE.DEPOSIT, categories: ['salary'] },
        {
          type: TRANSACTION_TYPE.WITHDRAWAL,
          categories: ['food', 'transport'],
          dateFrom: '2026-08-01',
          dateTo: '2026-08-31',
        }
      )
    ).toEqual({
      search: 'mercado',
      type: TRANSACTION_TYPE.WITHDRAWAL,
      categories: ['food', 'transport'],
      dateFrom: '2026-08-01',
      dateTo: '2026-08-31',
    });
  });

  it('projects only structured fields for FilterSheet', () => {
    expect(
      toStructuredTransactionFilter({
        search: 'mercado',
        type: TRANSACTION_TYPE.WITHDRAWAL,
        categories: ['food'],
      })
    ).toEqual({ type: TRANSACTION_TYPE.WITHDRAWAL, categories: ['food'] });
  });

  it('creates localized chips for type, categories, and dates', () => {
    expect(
      getActiveTransactionFilterChips({
        search: 'mercado',
        type: TRANSACTION_TYPE.WITHDRAWAL,
        categories: ['food', 'transport'],
        dateFrom: '2026-08-01',
        dateTo: '2026-08-31',
      })
    ).toEqual([
      { key: 'type', label: 'Saque' },
      { key: 'category:food', label: 'Alimentação' },
      { key: 'category:transport', label: 'Transporte' },
      { key: 'dateFrom', label: 'De 01/08/2026' },
      { key: 'dateTo', label: 'Até 31/08/2026' },
    ]);
  });

  it('removes only the selected field or category', () => {
    const filter = {
      search: 'mercado',
      type: TRANSACTION_TYPE.WITHDRAWAL,
      categories: ['food', 'transport'] as Array<'food' | 'transport'>,
      dateFrom: '2026-08-01',
    };

    expect(removeTransactionFilter(filter, 'category:food')).toEqual({
      search: 'mercado',
      type: TRANSACTION_TYPE.WITHDRAWAL,
      categories: ['transport'],
      dateFrom: '2026-08-01',
    });
    expect(removeTransactionFilter(filter, 'type')).toEqual({
      search: 'mercado',
      categories: ['food', 'transport'],
      dateFrom: '2026-08-01',
    });
  });

  it('reports whether search or structured filters are active', () => {
    expect(hasAnyTransactionFilter({})).toBe(false);
    expect(hasAnyTransactionFilter({ search: '   ' })).toBe(false);
    expect(hasAnyTransactionFilter({ categories: [] })).toBe(false);
    expect(hasAnyTransactionFilter({ search: 'mercado' })).toBe(true);
    expect(hasAnyTransactionFilter({ dateTo: '2026-08-31' })).toBe(true);
  });
});

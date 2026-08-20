import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import type { Transaction } from '../domain';
import { transactionsService, type TxFilter } from '../services/transactions.service';

const PAGE_SIZE = 20;
const LOAD_ERROR = 'Falha ao carregar transações';

type LoadMode = 'initial' | 'more' | 'refresh';

function serializeFilter(filter: TxFilter): string {
  return JSON.stringify([
    filter.type ?? null,
    [...(filter.categories ?? [])].sort(),
    filter.dateFrom ?? null,
    filter.dateTo ?? null,
    filter.search ?? null,
  ]);
}

function dedupeById(items: Transaction[]): Transaction[] {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

export interface UseInfiniteTransactionsResult {
  items: Transaction[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useInfiniteTransactions(filter: TxFilter): UseInfiniteTransactionsResult {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const filterKey = serializeFilter(filter);

  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterRef = useRef(filter);
  const cursorRef = useRef<QueryDocumentSnapshot | null>(null);
  const hasMoreRef = useRef(false);
  const requestGenerationRef = useRef(0);
  const activePromiseRef = useRef<Promise<void> | null>(null);
  const activeModeRef = useRef<LoadMode | null>(null);

  useEffect(() => {
    filterRef.current = filter;
  }, [filter, filterKey]);

  const runPage = useCallback(
    (mode: LoadMode): Promise<void> => {
      if (!uid) {
        if (mode === 'initial') {
          setItems([]);
          cursorRef.current = null;
          hasMoreRef.current = false;
          setLoading(false);
          setRefreshing(false);
          setHasMore(false);
          setError(null);
        }
        return Promise.resolve();
      }
      if (mode === 'more' && !hasMoreRef.current) return Promise.resolve();

      if (activePromiseRef.current) {
        if (mode === 'more' || activeModeRef.current === mode) {
          return activePromiseRef.current;
        }
      }

      const generation = ++requestGenerationRef.current;
      const requestCursor = mode === 'more' ? cursorRef.current : null;

      if (mode === 'initial') {
        setItems([]);
        cursorRef.current = null;
        hasMoreRef.current = true;
        setHasMore(true);
      }

      setError(null);
      setLoading(mode !== 'refresh');
      setRefreshing(mode === 'refresh');

      const request = (async () => {
        try {
          const nextPage = await transactionsService.listPaged(
            uid,
            filterRef.current,
            PAGE_SIZE,
            requestCursor
          );

          if (generation !== requestGenerationRef.current) return;

          setItems((currentItems) =>
            mode === 'more' ? dedupeById([...currentItems, ...nextPage.items]) : nextPage.items
          );
          cursorRef.current = nextPage.cursor;
          hasMoreRef.current = nextPage.hasMore;
          setHasMore(nextPage.hasMore);
        } catch {
          if (generation !== requestGenerationRef.current) return;

          if (mode === 'initial') {
            hasMoreRef.current = false;
            setHasMore(false);
          }
          setError(LOAD_ERROR);
        } finally {
          if (generation !== requestGenerationRef.current) return;

          setLoading(false);
          setRefreshing(false);
          activePromiseRef.current = null;
          activeModeRef.current = null;
        }
      })();

      activeModeRef.current = mode;
      activePromiseRef.current = request;
      return request;
    },
    [uid]
  );

  useEffect(() => {
    requestGenerationRef.current += 1;
    const effectGeneration = requestGenerationRef.current;
    activePromiseRef.current = null;
    activeModeRef.current = null;
    cursorRef.current = null;
    hasMoreRef.current = Boolean(uid);

    void Promise.resolve().then(() => {
      if (effectGeneration === requestGenerationRef.current) return runPage('initial');
    });

    return () => {
      requestGenerationRef.current += 1;
      activePromiseRef.current = null;
      activeModeRef.current = null;
    };
  }, [filterKey, runPage, uid]);

  const loadMore = useCallback(() => runPage('more'), [runPage]);
  const refresh = useCallback(() => runPage('refresh'), [runPage]);

  return { items, loading, refreshing, hasMore, error, loadMore, refresh };
}

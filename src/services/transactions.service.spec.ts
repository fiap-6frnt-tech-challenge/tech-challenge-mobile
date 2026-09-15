import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { QueryDocumentSnapshot } from 'firebase/firestore';

import { transactionsService } from './transactions.service';

const docs = [
  { id: 't1', data: () => ({ date: '2026-08-03', amount: 20 }) },
  { id: 't2', data: () => ({ date: '2026-08-02', amount: 10 }) },
  { id: 't3', data: () => ({ date: '2026-08-01', amount: 5 }) },
];

const firestore = vi.hoisted(() => ({
  addDoc: vi.fn(async () => ({ id: 'new-id' })),
  collection: vi.fn(() => ({ kind: 'collection' })),
  deleteDoc: vi.fn(async () => undefined),
  doc: vi.fn(() => ({ kind: 'document' })),
  getDocs: vi.fn(),
  limit: vi.fn((size: number) => ({ kind: 'limit', size })),
  onSnapshot: vi.fn(),
  orderBy: vi.fn((field: string, direction: string) => ({ kind: 'orderBy', field, direction })),
  query: vi.fn((...clauses: unknown[]) => ({ clauses })),
  serverTimestamp: vi.fn(() => 'SERVER_TS'),
  startAfter: vi.fn((cursor: unknown) => ({ kind: 'startAfter', cursor })),
  updateDoc: vi.fn(async () => undefined),
  where: vi.fn((field: string, operator: string, value: unknown) => ({
    kind: 'where',
    field,
    operator,
    value,
  })),
}));

vi.mock('firebase/firestore', () => firestore);

vi.mock('./firebase', () => ({
  db: { name: 'firestore-instance' },
}));

describe('transactionsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firestore.addDoc.mockResolvedValue({ id: 'new-id' });
    firestore.getDocs.mockResolvedValue({ docs: [] });
    firestore.onSnapshot.mockReturnValue(() => undefined);
  });

  function emitSnapshot(snapshot: { docs: unknown[] }) {
    firestore.onSnapshot.mock.calls[0][1](snapshot);
  }

  it('subscribes to the collection ordered by date and hands back the unsubscribe', () => {
    const stop = vi.fn();
    firestore.onSnapshot.mockReturnValue(stop);

    const result = transactionsService.subscribe('uid1', vi.fn(), vi.fn());

    expect(firestore.orderBy).toHaveBeenCalledWith('date', 'desc');
    expect(firestore.onSnapshot).toHaveBeenCalledOnce();
    expect(result).toBe(stop);
  });

  it('does not read through a one-shot request when subscribing', () => {
    transactionsService.subscribe('uid1', vi.fn(), vi.fn());

    expect(firestore.getDocs).not.toHaveBeenCalled();
  });

  it('maps the documents each snapshot delivers', () => {
    const onItems = vi.fn();
    transactionsService.subscribe('uid1', onItems, vi.fn());

    emitSnapshot({ docs: [docs[0]] });

    expect(onItems).toHaveBeenCalledWith([
      { id: 't1', userId: 'uid1', date: '2026-08-03', amount: 20 },
    ]);
  });

  it('does not expose descriptionNormalized through the subscription', () => {
    const onItems = vi.fn();
    transactionsService.subscribe('uid1', onItems, vi.fn());

    emitSnapshot({
      docs: [
        {
          id: 't1',
          data: () => ({
            date: '2026-08-03',
            description: 'Caf\u00e9',
            descriptionNormalized: 'cafe',
          }),
        },
      ],
    });

    expect(onItems).toHaveBeenCalledWith([
      { id: 't1', userId: 'uid1', date: '2026-08-03', description: 'Caf\u00e9' },
    ]);
  });

  it('forwards a subscription failure to the error handler', () => {
    const onError = vi.fn();
    const failure = new Error('permission-denied');
    transactionsService.subscribe('uid1', vi.fn(), onError);

    firestore.onSnapshot.mock.calls[0][2](failure);

    expect(onError).toHaveBeenCalledWith(failure);
  });

  it('creates a transaction and returns its id', async () => {
    await expect(
      transactionsService.create('uid1', { date: '2026-01-01', amount: 5 } as never)
    ).resolves.toBe('new-id');
  });

  it('stores a normalized description when creating a transaction', async () => {
    await transactionsService.create('uid1', {
      type: 'withdrawal',
      category: 'food',
      amount: 35,
      date: '2026-08-08',
      description: '  Caf\u00e9 da MANH\u00c3  ',
    });

    expect(firestore.addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        description: '  Caf\u00e9 da MANH\u00c3  ',
        descriptionNormalized: 'cafe da manha',
      })
    );
  });

  it('refreshes the normalized description when description changes', async () => {
    await transactionsService.update('uid1', 'tx1', { description: '\u00c1gua e LUZ' });

    expect(firestore.updateDoc).toHaveBeenCalledWith(expect.anything(), {
      description: '\u00c1gua e LUZ',
      descriptionNormalized: 'agua e luz',
    });
  });

  it('does not add descriptionNormalized to unrelated updates', async () => {
    await transactionsService.update('uid1', 'tx1', { amount: 40 });

    expect(firestore.updateDoc).toHaveBeenCalledWith(expect.anything(), { amount: 40 });
  });

  it('returns mapped items, the final document cursor, and hasMore for a full page', async () => {
    firestore.getDocs.mockResolvedValueOnce({ docs });

    await expect(transactionsService.listPaged('uid1', {}, 2)).resolves.toEqual({
      items: [
        { id: 't1', userId: 'uid1', date: '2026-08-03', amount: 20 },
        { id: 't2', userId: 'uid1', date: '2026-08-02', amount: 10 },
      ],
      cursor: docs[1],
      hasMore: true,
    });

    expect(firestore.limit).toHaveBeenCalledWith(3);
  });

  it('adds startAfter when a cursor is provided', async () => {
    const cursor = docs[0] as unknown as QueryDocumentSnapshot;
    firestore.getDocs.mockResolvedValueOnce({ docs: [docs[1]] });

    await transactionsService.listPaged('uid1', {}, 2, cursor);

    expect(firestore.startAfter).toHaveBeenCalledWith(cursor);
  });

  it('keeps startAfter in the Firestore query when a search cursor is provided', async () => {
    const cursor = docs[0] as unknown as QueryDocumentSnapshot;
    firestore.getDocs.mockResolvedValueOnce({ docs: [docs[1]] });

    await transactionsService.listPaged('uid1', { search: 'merc' }, 2, cursor);

    expect(firestore.getDocs).toHaveBeenCalledWith(
      expect.objectContaining({
        clauses: expect.arrayContaining([expect.objectContaining({ kind: 'startAfter', cursor })]),
      })
    );
  });

  it('sets hasMore false when the final page has exactly pageSize items', async () => {
    firestore.getDocs.mockResolvedValueOnce({ docs: [docs[0], docs[1]] });

    await expect(transactionsService.listPaged('uid1', {}, 2)).resolves.toMatchObject({
      cursor: docs[1],
      hasMore: false,
    });
  });

  it('adds type, categories, and date range filters to the Firestore query', async () => {
    await transactionsService.listPaged('uid1', {
      type: 'withdrawal',
      categories: ['food', 'transport'],
      dateFrom: '2026-08-01',
      dateTo: '2026-08-31',
    });

    expect(firestore.where).toHaveBeenCalledWith('type', '==', 'withdrawal');
    expect(firestore.where).toHaveBeenCalledWith('category', 'in', ['food', 'transport']);
    expect(firestore.where).toHaveBeenCalledWith('date', '>=', '2026-08-01');
    expect(firestore.where).toHaveBeenCalledWith('date', '<=', '2026-08-31');
    expect(firestore.getDocs).toHaveBeenCalledWith(
      expect.objectContaining({
        clauses: expect.arrayContaining([
          expect.objectContaining({
            kind: 'where',
            field: 'type',
            operator: '==',
            value: 'withdrawal',
          }),
          expect.objectContaining({ kind: 'where', field: 'category', operator: 'in' }),
          expect.objectContaining({
            kind: 'where',
            field: 'date',
            operator: '>=',
            value: '2026-08-01',
          }),
          expect.objectContaining({
            kind: 'where',
            field: 'date',
            operator: '<=',
            value: '2026-08-31',
          }),
        ]),
      })
    );
  });

  it('always sorts paged queries and applies their requested size', async () => {
    await transactionsService.listPaged('uid1', {}, 7);

    expect(firestore.orderBy).toHaveBeenCalledWith('date', 'desc');
    expect(firestore.limit).toHaveBeenCalledWith(8);
  });

  it('normalizes search and applies an inclusive Firestore prefix range', async () => {
    await transactionsService.listPaged('uid1', { search: '  CAF\u00c9  ' });

    expect(firestore.where).toHaveBeenCalledWith('descriptionNormalized', '>=', 'cafe');
    expect(firestore.where).toHaveBeenCalledWith('descriptionNormalized', '<=', `cafe\uf8ff`);
  });

  it('orders search pages by normalized description and then date', async () => {
    await transactionsService.listPaged('uid1', { search: 'merc' }, 7);

    expect(firestore.orderBy).toHaveBeenNthCalledWith(1, 'descriptionNormalized', 'asc');
    expect(firestore.orderBy).toHaveBeenNthCalledWith(2, 'date', 'desc');
    expect(firestore.limit).toHaveBeenCalledWith(8);
  });

  it('treats an empty normalized search as the unfiltered date-ordered query', async () => {
    await transactionsService.listPaged('uid1', { search: '  \n ' });

    expect(firestore.where).not.toHaveBeenCalledWith(
      'descriptionNormalized',
      expect.anything(),
      expect.anything()
    );
    expect(firestore.orderBy).toHaveBeenCalledTimes(1);
    expect(firestore.orderBy).toHaveBeenCalledWith('date', 'desc');
  });

  it('composes prefix search with structured filters in the query sent to getDocs', async () => {
    await transactionsService.listPaged('uid1', {
      search: 'merc',
      type: 'withdrawal',
      categories: ['food'],
      dateFrom: '2026-08-01',
      dateTo: '2026-08-31',
    });

    expect(firestore.getDocs).toHaveBeenCalledWith(
      expect.objectContaining({
        clauses: expect.arrayContaining([
          expect.objectContaining({ field: 'descriptionNormalized', operator: '>=' }),
          expect.objectContaining({ field: 'descriptionNormalized', operator: '<=' }),
          expect.objectContaining({ field: 'type', operator: '==' }),
          expect.objectContaining({ field: 'category', operator: 'in' }),
          expect.objectContaining({ field: 'date', operator: '>=' }),
          expect.objectContaining({ field: 'date', operator: '<=' }),
        ]),
      })
    );
  });

  it('rejects more than ten selected categories without querying Firestore', async () => {
    await expect(
      transactionsService.listPaged('uid1', {
        categories: Array.from({ length: 11 }, () => 'food'),
      })
    ).rejects.toThrow('A maximum of 10 categories can be filtered at once');

    expect(firestore.getDocs).not.toHaveBeenCalled();
  });

  it('keeps update and remove scoped to the authenticated user transaction path', async () => {
    await transactionsService.update('uid1', 'tx1', { amount: 30 });
    await transactionsService.remove('uid1', 'tx1');

    expect(firestore.doc).toHaveBeenCalledWith(
      expect.anything(),
      'users',
      'uid1',
      'transactions',
      'tx1'
    );
    expect(firestore.updateDoc).toHaveBeenCalledTimes(1);
    expect(firestore.deleteDoc).toHaveBeenCalledTimes(1);
  });
});

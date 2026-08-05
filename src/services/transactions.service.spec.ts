import { describe, it, expect, vi } from 'vitest';
import { transactionsService } from './transactions.service';

vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn((..._args: any[]) => ({})),
    doc: vi.fn((..._args: any[]) => ({})),
    addDoc: vi.fn(async () => ({ id: 'new-id' })),
    updateDoc: vi.fn(async () => undefined),
    deleteDoc: vi.fn(async () => undefined),
    getDocs: vi.fn(async () => ({
      docs: [{ id: 't1', data: () => ({ date: '2023-01-01', amount: 10 }) }],
    })),
    query: vi.fn((...args: any[]) => args),
    orderBy: vi.fn((..._args: any[]) => ({})),
    serverTimestamp: vi.fn(() => 'SERVER_TS'),
  };
});

vi.mock('./firebase', () => ({
  db: { name: 'firestore-instance' },
}));

describe('transactionsService', () => {
  it('list returns mapped transactions', async () => {
    const res = await transactionsService.list('uid1');
    expect(res).toHaveLength(1);
    expect(res[0]).toMatchObject({ id: 't1', userId: 'uid1', date: '2023-01-01', amount: 10 });
  });

  it('create returns id', async () => {
    const id = await transactionsService.create('uid1', { date: '2023-01-01', amount: 5 } as any);
    expect(id).toBe('new-id');
  });
});

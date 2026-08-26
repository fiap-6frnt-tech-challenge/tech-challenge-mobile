import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  limit,
  startAfter,
  where,
  type FirestoreError,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  normalizeSearchText,
  type CategoryId,
  type Transaction,
  type TransactionType,
} from '../domain';

const col = (uid: string) => collection(db, 'users', uid, 'transactions');

const mapTransaction = (uid: string, snapshot: QueryDocumentSnapshot): Transaction => {
  const { descriptionNormalized: _descriptionNormalized, ...data } = snapshot.data();

  return { id: snapshot.id, userId: uid, ...data } as Transaction;
};

function withNormalizedDescription<T extends Partial<Pick<Transaction, 'description'>>>(data: T) {
  if (data.description === undefined) return data;

  return {
    ...data,
    descriptionNormalized: normalizeSearchText(data.description),
  };
}

export interface TxFilter {
  type?: TransactionType;
  categories?: CategoryId[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface TransactionPage {
  items: Transaction[];
  cursor: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

export const transactionsService = {
  subscribe(
    uid: string,
    onItems: (items: Transaction[]) => void,
    onError: (error: FirestoreError) => void
  ): Unsubscribe {
    return onSnapshot(
      query(col(uid), orderBy('date', 'desc')),
      (snapshot) => onItems(snapshot.docs.map((document) => mapTransaction(uid, document))),
      onError
    );
  },
  async listPaged(
    uid: string,
    filter: TxFilter,
    pageSize = 20,
    cursor: QueryDocumentSnapshot | null = null
  ): Promise<TransactionPage> {
    if (filter.categories && filter.categories.length > 10) {
      throw new Error('A maximum of 10 categories can be filtered at once');
    }

    const clauses: QueryConstraint[] = [];
    const normalizedSearch = normalizeSearchText(filter.search ?? '');

    if (normalizedSearch) {
      clauses.push(where('descriptionNormalized', '>=', normalizedSearch));
      clauses.push(where('descriptionNormalized', '<=', `${normalizedSearch}\uf8ff`));
    }

    if (filter.type) clauses.push(where('type', '==', filter.type));
    if (filter.categories?.length) clauses.push(where('category', 'in', filter.categories));
    if (filter.dateFrom) clauses.push(where('date', '>=', filter.dateFrom));
    if (filter.dateTo) clauses.push(where('date', '<=', filter.dateTo));

    const orderConstraints = normalizedSearch
      ? [orderBy('descriptionNormalized', 'asc'), orderBy('date', 'desc')]
      : [orderBy('date', 'desc')];
    const baseQuery = query(col(uid), ...clauses, ...orderConstraints, limit(pageSize + 1));
    const snapshot = await getDocs(cursor ? query(baseQuery, startAfter(cursor)) : baseQuery);
    const hasMore = snapshot.docs.length > pageSize;
    const pageDocuments = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;

    return {
      items: pageDocuments.map((document) => mapTransaction(uid, document)),
      cursor: pageDocuments.at(-1) ?? null,
      hasMore,
    };
  },
  async create(uid: string, data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) {
    const ref = await addDoc(col(uid), {
      ...withNormalizedDescription(data),
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },
  update: (uid: string, id: string, patch: Partial<Transaction>) =>
    updateDoc(doc(db, 'users', uid, 'transactions', id), withNormalizedDescription(patch)),
  remove: (uid: string, id: string) => deleteDoc(doc(db, 'users', uid, 'transactions', id)),
};

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Transaction } from '../domain';

const col = (uid: string) => collection(db, 'users', uid, 'transactions');

export const transactionsService = {
  async list(uid: string): Promise<Transaction[]> {
    const snap = await getDocs(query(col(uid), orderBy('date', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, userId: uid, ...d.data() }) as Transaction);
  },
  async create(uid: string, data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) {
    const ref = await addDoc(col(uid), { ...data, createdAt: serverTimestamp() });
    return ref.id;
  },
  update: (uid: string, id: string, patch: Partial<Transaction>) =>
    updateDoc(doc(db, 'users', uid, 'transactions', id), patch),
  remove: (uid: string, id: string) => deleteDoc(doc(db, 'users', uid, 'transactions', id)),
};

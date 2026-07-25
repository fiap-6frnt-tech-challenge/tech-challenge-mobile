import type { CategoryId } from './categories';
import { TRANSACTION_TYPE } from './constants';

export type TransactionType = (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];

export interface Attachment {
  id: string;
  name: string;
  url: string;
  path: string;
  size: number;
  mimeType: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  category: CategoryId;
  amount: number;
  date: string;
  description: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt?: string;
}

export type NewTransaction = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTransaction = Partial<NewTransaction>;

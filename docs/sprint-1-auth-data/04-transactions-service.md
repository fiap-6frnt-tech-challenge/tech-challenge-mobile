# Task 04 — `transactions.service` (CRUD Firestore)

| | |
| --- | --- |
| **Sprint** | [Sprint 1](./README.md) |
| **Owner** | Dev 1 (Firebase & Data) |
| **Duração** | 1.5 dia |
| **Branch** | `dev1-fb/transactions-service` |
| **Depende de** | Task 03 |
| **Desbloqueia** | Task 07 (TransactionContext) |

---

## Contexto

Camada única de acesso ao Firestore para transações. Paginação por cursor e filtros avançados entram no Sprint 3 (Task S3-01) — aqui só o CRUD + `list` simples.

## Implementação

`src/services/transactions.service.ts`:

```ts
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Transaction } from '@/domain/transaction';

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
  remove: (uid: string, id: string) =>
    deleteDoc(doc(db, 'users', uid, 'transactions', id)),
};
```

## Validação

- [ ] `create` grava e retorna o id
- [ ] `list` retorna transações ordenadas por data desc
- [ ] `update`/`remove` refletem no console
- [ ] Todas as funções recebem `uid` (nunca confiam em id do payload)

## Gotchas

1. **`uid` sempre vem do `AuthContext`**, nunca de input do usuário — casa com as rules.
2. `serverTimestamp()` no create; ao ler, converter `Timestamp`→ISO se necessário (ou guardar `date` como string ISO desde o form).
3. Não paginar aqui — `list` completo só serve p/ o dashboard e a lista básica desta sprint; scroll infinito é S3.

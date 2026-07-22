# Task 01 — Service: paginação por cursor + filtros/busca

| | |
| --- | --- |
| **Sprint** | [Sprint 3](./README.md) |
| **Owner** | Dev 1 (Firebase & Data) |
| **Duração** | 1.5 dia |
| **Branch** | `dev1-fb/service-pagination-filters` |
| **Depende de** | S1-04 (transactions.service) |
| **Desbloqueia** | Task 07 (hook), Task 09 (filtros) |

---

## Contexto

Estende o `transactions.service` com paginação por cursor (base do scroll infinito) e filtros/busca no servidor (Firestore query), para lidar com grandes volumes.

## Implementação

```ts
import { query, orderBy, limit, startAfter, where, getDocs, type QueryDocumentSnapshot } from 'firebase/firestore';

export interface TxFilter {
  type?: TransactionType;
  categories?: string[];   // até 10 (limite do 'in')
  dateFrom?: string;
  dateTo?: string;
  search?: string;         // prefixo de description
}

export interface Page {
  items: Transaction[];
  cursor: QueryDocumentSnapshot | null; // passar p/ a próxima chamada
  hasMore: boolean;
}

export async function listPaged(
  uid: string, filter: TxFilter, pageSize = 20, cursor?: QueryDocumentSnapshot | null,
): Promise<Page> {
  const clauses = [];
  if (filter.type) clauses.push(where('type', '==', filter.type));
  if (filter.categories?.length) clauses.push(where('category', 'in', filter.categories));
  if (filter.dateFrom) clauses.push(where('date', '>=', filter.dateFrom));
  if (filter.dateTo) clauses.push(where('date', '<=', filter.dateTo));

  let q = query(col(uid), ...clauses, orderBy('date', 'desc'), limit(pageSize));
  if (cursor) q = query(q, startAfter(cursor));

  const snap = await getDocs(q);
  const items = snap.docs.map(mapDoc);
  return { items, cursor: snap.docs.at(-1) ?? null, hasMore: snap.docs.length === pageSize };
}
```

**Busca por descrição:** Firestore não faz full-text. Opções: (a) busca por **prefixo** com `where('description','>=',q)` + `where('description','<=',q+'')`; (b) filtrar client-side dentro da página. Adotamos **(a)** para prefixo + refino client-side. Documentar a limitação no README.

## Validação

- [ ] `listPaged` retorna `pageSize` itens + `cursor` + `hasMore`
- [ ] Passar o `cursor` traz a próxima página sem repetir
- [ ] Filtros por tipo/categoria/data aplicam no servidor
- [ ] Última página → `hasMore = false`

## Gotchas

1. **Índices compostos:** `where + orderBy` em campos diferentes exige índice. O erro do Firestore traz o link p/ criar — adicionar em `firestore.indexes.json` e documentar.
2. **`where('category','in',[...])`** limita a 10 valores e não combina com `!=` — ok p/ multi-select de categorias.
3. **Cursor é `DocumentSnapshot`**, não um valor — o hook (Task 07) precisa guardá-lo entre chamadas.
4. Busca full-text real exigiria Algolia/typesense — fora de escopo; prefixo cobre a demo.

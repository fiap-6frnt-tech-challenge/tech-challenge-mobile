# Task 05 — Domínio: portar types + Zod + categorias + `suggestCategory`

| | |
| --- | --- |
| **Sprint** | [Sprint 0 — Foundation](./README.md) |
| **Owner** | Dev 1 (Firebase & Data) |
| **Duração estimada** | 1 dia |
| **Branch recomendada** | `dev1-fb/domain-port` |
| **Depende de** | [Task 01](./01-bootstrap-expo.md) |
| **PR só abre** | Após tipos compilarem e testes de `suggestCategory` passarem |

---

## Dependências

- **Bloqueia esta task:** Task 01.
- **Esta task desbloqueia:** `transactions.service` (S1), forms (S1/S3), agregações (S2), sugestão (S3).

---

## Contexto

Reaproveitamento direto do projeto web (Fase 1/2). São arquivos **TypeScript puros, agnósticos de plataforma** — copiar de `packages/shared` e `components/features/TransactionForm/schema.ts` do repo web para `src/domain/`. Adaptar só imports e a versão do Zod.

---

## Implementação

### `src/domain/transaction.ts`

```ts
export type TransactionType = 'deposit' | 'withdrawal' | 'transfer';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;        // sempre positivo; direção inferida do type
  date: string;          // ISO
  description: string;
  category: string;      // CategoryId
  attachments?: Attachment[];
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;           // download URL do Storage
  path: string;          // caminho no bucket (p/ delete)
  size: number;
  contentType: string;
}
```

### `src/domain/categories.ts`

Portar `CATEGORIES` (id + label pt-BR + ícone) e o mapa de labels/badges de tipo de transação.

### `src/domain/suggestCategory.ts`

Função pura `suggestCategory(description: string): string | null` — heurística por keyword. Portar as ≥20 regras + casos de teste do web.

### `src/domain/schema.ts` (Zod)

```ts
import { z } from 'zod';

export const transactionFormSchema = z.object({
  type: z.enum(['deposit', 'withdrawal', 'transfer']),
  amount: z.number().positive('Valor deve ser maior que zero'),
  date: z.string().refine((d) => new Date(d) <= new Date(), 'Data não pode ser futura'),
  description: z.string().min(3, 'Mínimo 3 caracteres').max(140),
  category: z.string().min(1, 'Selecione uma categoria'),
});

export type TransactionFormData = z.infer<typeof transactionFormSchema>;
```

---

## Validação

- [ ] `import { Transaction } from '@/domain/transaction'` compila
- [ ] `suggestCategory('Uber')` → `'transporte'` (e ≥20 casos passam no Jest)
- [ ] `transactionFormSchema.parse(...)` rejeita valor ≤0, data futura, descrição <3

---

## Gotchas

1. **Zod v4** no repo web usa sintaxe nova; confirmar a versão instalada aqui e alinhar (mensagens como 2º arg em `.min()`/`.refine()`).
2. Não trazer nada de React/Next junto — `src/domain/` é 100% agnóstico.
3. **Categoria como `CategoryId`, não label**: transações antigas do web guardavam label pt-BR; aqui padronizamos `CategoryId` desde o início (evita o mismatch conhecido da Fase 2).

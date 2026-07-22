# Task 01 — Agregações puras

| | |
| --- | --- |
| **Sprint** | [Sprint 2](./README.md) |
| **Owner** | Dev 1 (Firebase & Data) |
| **Duração** | 1.5 dia |
| **Branch** | `dev1-fb/aggregations` |
| **Depende de** | S1 (Transaction) |
| **Desbloqueia** | Task 05 (hook), Task 06 (tela) |

---

## Contexto

Funções puras (sem Firebase, sem React) que transformam `Transaction[]` nas séries dos gráficos e KPIs. Puras = fáceis de testar e reusar. Vivem em `src/domain/aggregations.ts`.

## Implementação

```ts
import type { Transaction } from './transaction';

export function balance(txs: Transaction[]): number {
  return txs.reduce((acc, t) => {
    if (t.type === 'deposit') return acc + t.amount;
    if (t.type === 'withdrawal') return acc - t.amount;
    return acc; // transfer é neutro
  }, 0);
}

export function totals(txs: Transaction[]) {
  const income = txs.filter((t) => t.type === 'deposit').reduce((a, t) => a + t.amount, 0);
  const expense = txs.filter((t) => t.type === 'withdrawal').reduce((a, t) => a + t.amount, 0);
  return { income, expense, balance: income - expense };
}

export function byCategory(txs: Transaction[]): { category: string; total: number }[] { /* group withdrawal por category */ }

export function byMonth(txs: Transaction[], months = 6): { month: string; income: number; expense: number }[] { /* buckets dos últimos N meses */ }

export function balanceOverTime(txs: Transaction[]): { date: string; balance: number }[] { /* saldo acumulado ordenado por data */ }

export function topCategory(txs: Transaction[]): { category: string; total: number } | null { /* maior gasto do mês corrente */ }
```

## Validação

- [ ] `balance` ignora `transfer`
- [ ] `totals` bate com soma manual num fixture
- [ ] `byMonth` retorna exatamente `months` buckets (preenche meses sem dados com 0)
- [ ] `topCategory` retorna a categoria de maior gasto do mês corrente
- [ ] ≥10 casos de teste (incluindo lista vazia → zeros/`null`)

## Gotchas

1. **Timezone:** normalizar datas ao agrupar por mês (usar UTC ou `date-fns` consistente) p/ não pular buckets.
2. Lista vazia deve retornar zeros / `[]` / `null` — nunca `NaN`.
3. Puras: não importar nada de `firebase`/`react` aqui.

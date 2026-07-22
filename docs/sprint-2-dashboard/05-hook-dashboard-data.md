# Task 05 — Hook `useDashboardData`

| | |
| --- | --- |
| **Sprint** | [Sprint 2](./README.md) |
| **Owner** | Dev 3 (Nav & Integration) |
| **Duração** | 1 dia |
| **Branch** | `dev3-nav/hook-dashboard-data` |
| **Depende de** | Task 01 (agregações) |
| **Desbloqueia** | Task 06 (tela) |

---

## Contexto

Cola entre o `TransactionContext` e as funções de agregação. A tela só consome este hook — não conhece as agregações nem o context diretamente.

## Implementação

`src/hooks/useDashboardData.ts`:

```ts
export function useDashboardData() {
  const { items, loading, error, refresh } = useTransactions();

  const data = useMemo(() => ({
    totals: totals(items),
    byMonth: byMonth(items, 6),
    byCategory: byCategory(items),
    balanceOverTime: balanceOverTime(items),
    topCategory: topCategory(items),
  }), [items]);

  return { ...data, loading, error, refresh, isEmpty: items.length === 0 };
}
```

## Validação

- [ ] Retorna todas as séries prontas p/ os gráficos
- [ ] `isEmpty` true quando não há transações
- [ ] `useMemo` evita recalcular a cada render (só quando `items` muda)
- [ ] `refresh` re-busca do Firestore e recomputa

## Gotchas

1. **`useMemo([items])`**: agregações podem ser custosas com muitas transações — memoizar é importante p/ scroll/animação fluidos.
2. Não duplicar lógica de agregação aqui — só orquestrar as funções puras da Task 01.

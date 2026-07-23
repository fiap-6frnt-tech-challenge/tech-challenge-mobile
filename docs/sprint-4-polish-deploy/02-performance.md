# Task 02 — Performance

| | |
| --- | --- |
| **Sprint** | [Sprint 4](./README.md) |
| **Owner** | Dev 3 (Nav & Integration) |
| **Duração** | 1.5 dia |
| **Branch** | `dev3-nav/performance` |
| **Depende de** | Sprint 3 |

---

## Contexto

"Boas práticas de otimização de performance e usabilidade" (spec). Foco na lista (maior volume) e no cold start.

## Ações

- **FlatList:** `getItemLayout` (item de altura fixa), `windowSize`, `maxToRenderPerBatch`, `removeClippedSubviews`
- **`React.memo`** em `TransactionItem`, KPIs e gráficos; `useCallback` nos handlers passados à lista
- **Imagens de anexo:** cache (`expo-image` em vez de `Image` p/ cache/memória)
- **Cold start:** reduzir trabalho no boot; splash até auth resolver; lazy do que não é crítico
- **Agregações:** já memoizadas (S2-05); confirmar que não recomputam à toa
- Medir antes/depois (DevTools/Flipper ou `performance.now()` nos pontos quentes)

## Validação

- [ ] Lista fluida (60fps) com 300+ itens
- [ ] Scroll infinito sem travar ao carregar página
- [ ] Sem re-render em cascata ao digitar na busca (só o input)
- [ ] Cold start aceitável em device mediano
- [ ] Nota antes/depois no `docs/perf.md`

## Gotchas

1. **`expo-image`** dá cache de disco/memória grátis — trocar `Image` nos anexos/thumbnails.
2. Cuidado com funções inline recriadas por render passadas ao `FlatList` — usar `useCallback`.

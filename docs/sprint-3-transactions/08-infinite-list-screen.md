# Task 08 — Tela lista com scroll infinito (FlatList)

| | |
| --- | --- |
| **Sprint** | [Sprint 3](./README.md) |
| **Owner** | Dev 3 (Nav & Integration) |
| **Duração** | 1.5 dia |
| **Branch** | `dev3-nav/infinite-list-screen` |
| **Depende de** | Task 07 (hook) |
| **Desbloqueia** | Task 09 (filtros) |

---

## Contexto

Evolui a lista básica (S1-09) para scroll infinito usando `useInfiniteTransactions`.

## Implementação

`app/(app)/transactions/index.tsx`:

```tsx
const [filter, setFilter] = useState<TxFilter>({});
const { items, loading, refreshing, hasMore, loadMore, refresh } = useInfiniteTransactions(filter);

<FlatList
  data={items}
  keyExtractor={(t) => t.id}
  renderItem={({ item }) => <TransactionItem tx={item} onPress={() => router.push(`/transactions/${item.id}`)} />}
  onEndReached={hasMore ? loadMore : undefined}
  onEndReachedThreshold={0.5}
  ListFooterComponent={loading && hasMore ? <Spinner /> : null}
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
  ListEmptyComponent={!loading ? <EmptyState /> : null}
/>
```

Header da tela: `SearchInput` + botão de filtros (abre `FilterSheet` — Task 09) + chips de filtros ativos. FAB → `/transactions/new`.

## Validação

- [ ] Rolar até o fim carrega mais (spinner no footer)
- [ ] Fim da lista para de buscar
- [ ] Pull-to-refresh reinicia
- [ ] Estado vazio quando sem resultados
- [ ] Fluido com centenas de itens (sem drop de frames)

## Gotchas

1. **`onEndReachedThreshold`** ~0.5; muito baixo dispara tarde, muito alto dispara em loop.
2. **`getItemLayout`** se a altura do item for fixa → scroll mais suave.
3. Não passar `onEndReached` quando `!hasMore` (evita chamada inútil no fim).
4. `TransactionItem` memoizado (`React.memo`) p/ não re-renderizar a lista toda.

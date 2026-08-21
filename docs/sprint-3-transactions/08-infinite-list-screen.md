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

A tela vive em `src/screens/(app)/transactions/TransactionsScreen.tsx`; a rota
`app/(app)/(tabs)/transactions.tsx` só re-exporta (o caminho `app/(app)/transactions/index.tsx`
do rascunho não existe neste repo, a lista é uma aba).

```tsx
const [filter] = useState<TxFilter>({});
const { items, loading, refreshing, hasMore, error, loadMore, refresh } = useInfiniteTransactions(filter);

<FlatList
  data={items}
  keyExtractor={(t) => t.id}
  renderItem={renderItem}
  getItemLayout={getItemLayout}
  onEndReached={hasMore ? handleEndReached : undefined}
  onEndReachedThreshold={0.5}
  ListEmptyComponent={listEmpty}
  ListFooterComponent={listFooter}
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
/>
```

Estados da lista:

| Situação | O que aparece |
| --- | --- |
| Carga inicial | `TransactionListSkeleton` (via `ListEmptyComponent`) |
| Sem transações | `TransactionListFeedback variant="empty"` → CTA `/transactionAdd` |
| Erro com lista vazia | `TransactionListFeedback variant="error"` → "Tentar novamente" chama `refresh()` |
| Erro paginando (já com itens) | Bloco de erro no rodapé → "Tentar novamente" chama `loadMore()` |
| Carregando próxima página | `ActivityIndicator` no rodapé |
| Fim da lista | "Você chegou ao fim da lista" |

FAB → `/transactionAdd` (a rota `/transactions/new` do rascunho não existe neste repo).

`useFocusEffect` chama `refresh()` ao reganhar o foco, pulando o primeiro foco para não duplicar a
carga inicial. É isso que traz para a lista a transação recém-criada pelo form, que hoje escreve
via `TransactionContext` e não conhece este hook (gotcha 4 da Task 07).

### Fora do escopo — fica na Task 09

Header com `SearchInput` + botão de filtros + chips de filtros ativos. A tela já expõe o `filter`
que alimenta o hook; a Task 09 troca `useState<TxFilter>({})` por um estado com setter e monta o
header em cima disso.

## Validação

- [x] Rolar até o fim carrega mais (spinner no footer)
- [x] Fim da lista para de buscar
- [x] Pull-to-refresh reinicia
- [x] Estado vazio quando sem resultados
- [x] Fluido com centenas de itens (sem drop de frames)

## Gotchas

1. **`onEndReachedThreshold`** ~0.5; muito baixo dispara tarde, muito alto dispara em loop.
2. **`getItemLayout`**: a altura não é constante conhecida (varia com o `fontScale` do sistema), então
   é medida em runtime pelo `onLayout` da primeira linha e só então o `getItemLayout` é fornecido —
   cravar um número mágico quebra o scroll de quem usa fonte ampliada.
3. Não passar `onEndReached` quando `!hasMore` (evita chamada inútil no fim).
4. `TransactionItem` memoizado (`React.memo`) p/ não re-renderizar a lista toda — mas o memo só
   segura se `renderItem`, `onPress` e `keyExtractor` forem estáveis (`useCallback` / função de módulo).
5. `Pressable` com `style={({ pressed }) => ...}` renderiza sem estilo neste repo (interop do
   NativeWind descarta a forma de função). O `TransactionItem` passou a usar
   `useState` + `onPressIn`/`onPressOut`, mesmo padrão do `Button` e do `Chip`.

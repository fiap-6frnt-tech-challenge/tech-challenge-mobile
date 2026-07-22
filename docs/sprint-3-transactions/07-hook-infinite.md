# Task 07 — Hook `useInfiniteTransactions`

| | |
| --- | --- |
| **Sprint** | [Sprint 3](./README.md) |
| **Owner** | Dev 3 (Nav & Integration) |
| **Duração** | 1.5 dia |
| **Branch** | `dev3-nav/hook-infinite` |
| **Depende de** | Task 01 (listPaged) |
| **Desbloqueia** | Task 08 (lista), Task 09 (filtros) |

---

## Contexto

Hook que gerencia o **scroll infinito**: acumula páginas, guarda o cursor e reseta quando o filtro muda. É o núcleo do requisito de scroll infinito.

## Implementação

`src/hooks/useInfiniteTransactions.ts`:

```ts
export function useInfiniteTransactions(filter: TxFilter) {
  const { user } = useAuth();
  const [items, setItems] = useState<Transaction[]>([]);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (reset: boolean) => {
    if (!user || loading) return;
    if (!reset && !hasMore) return;
    setLoading(true);
    const page = await listPaged(user.uid, filter, 20, reset ? null : cursor);
    setItems((prev) => reset ? page.items : dedupe([...prev, ...page.items]));
    setCursor(page.cursor);
    setHasMore(page.hasMore);
    setLoading(false);
  }, [user, filter, cursor, hasMore, loading]);

  // reset quando o filtro muda
  useEffect(() => { setItems([]); setCursor(null); setHasMore(true); load(true); }, [JSON.stringify(filter), user]);

  const loadMore = () => load(false);
  const refresh = async () => { setRefreshing(true); await load(true); setRefreshing(false); };

  return { items, loading, refreshing, hasMore, loadMore, refresh };
}

const dedupe = (arr: Transaction[]) => [...new Map(arr.map((t) => [t.id, t])).values()];
```

## Validação

- [ ] Primeira carga traz a página 1
- [ ] `loadMore` acumula sem duplicar (dedupe por id)
- [ ] `hasMore=false` no fim para de buscar
- [ ] Mudar `filter` reseta e recarrega do topo
- [ ] `refresh` recomeça a lista

## Gotchas

1. **Guardar `cursor` (DocumentSnapshot)** — não serializável; manter no state do hook.
2. **`JSON.stringify(filter)`** como dep evita loop por nova referência de objeto a cada render.
3. **Race:** o `loading` guard evita disparos concorrentes do `onEndReached`.
4. Este hook é independente do `TransactionContext` (que serve o dashboard). Ao criar/editar no form, chamar `refresh()` deste hook.

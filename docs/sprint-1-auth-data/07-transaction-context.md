# Task 07 — `TransactionContext` (useReducer + service)

| | |
| --- | --- |
| **Sprint** | [Sprint 1](./README.md) |
| **Owner** | Dev 3 (Nav & Integration) |
| **Duração** | 1.5 dia |
| **Branch** | `dev3-nav/transaction-context` |
| **Depende de** | Task 04 (transactions.service) |
| **Desbloqueia** | Task 09 (lista), form do Sprint 3 |

---

## Contexto

Estado global de transações via **Context API + `useReducer`** (exigência da spec). Ações delegam ao `transactions.service`; o `uid` vem do `useAuth()`.

## Implementação

`src/contexts/TransactionContext.tsx`:

```tsx
type State = { items: Transaction[]; loading: boolean; error: string | null };
type Action =
  | { type: 'LOADING' }
  | { type: 'LOADED'; items: Transaction[] }
  | { type: 'ERROR'; error: string };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'LOADING': return { ...s, loading: true, error: null };
    case 'LOADED': return { items: a.items, loading: false, error: null };
    case 'ERROR': return { ...s, loading: false, error: a.error };
  }
}

export function TransactionProvider({ children }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, { items: [], loading: false, error: null });

  const refresh = useCallback(async () => {
    if (!user) return;
    dispatch({ type: 'LOADING' });
    try { dispatch({ type: 'LOADED', items: await transactionsService.list(user.uid) }); }
    catch (e) { dispatch({ type: 'ERROR', error: 'Falha ao carregar' }); }
  }, [user]);

  const create = async (data) => { await transactionsService.create(user!.uid, data); await refresh(); };
  const update = async (id, patch) => { await transactionsService.update(user!.uid, id, patch); await refresh(); };
  const remove = async (id) => { await transactionsService.remove(user!.uid, id); await refresh(); };

  useEffect(() => { if (user) refresh(); }, [user, refresh]);

  return <TransactionContext.Provider value={{ ...state, refresh, create, update, remove }}>{children}</TransactionContext.Provider>;
}
```

## Validação

- [ ] Ao logar, a lista carrega automaticamente
- [ ] `create`/`update`/`remove` refletem na lista após `refresh`
- [ ] `error` populado quando o service falha
- [ ] Ao deslogar, o próximo login carrega os dados do novo usuário (sem vazar do anterior)

## Gotchas

1. **Reset ao trocar de usuário:** o `useEffect([user])` recarrega; garantir que `items` não persiste entre sessões diferentes.
2. Scroll infinito **não** vive aqui — este context guarda o estado "corrente"; a lista paginada usa o hook `useInfiniteTransactions` (S3). Para o dashboard (S2), `items` completo basta.

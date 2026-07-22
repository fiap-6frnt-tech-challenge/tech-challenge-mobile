# Task 09 — Tela lista básica

| | |
| --- | --- |
| **Sprint** | [Sprint 1](./README.md) |
| **Owner** | Dev 3 (Nav & Integration) |
| **Duração** | 1.5 dia |
| **Branch** | `dev3-nav/basic-list-screen` |
| **Depende de** | Task 07 (TransactionContext) |
| **Desbloqueia** | evolução p/ scroll infinito (S3) |

---

## Contexto

Primeira tela que exibe dados reais do Firestore. Sem filtros nem scroll infinito ainda (isso é S3) — valida a integração Context ↔ service ↔ UI ponta-a-ponta e serve de base p/ o `TransactionItem`.

## Implementação

`app/(app)/transactions/index.tsx`:

- `const { items, loading, error, refresh } = useTransactions();`
- `FlatList` de `TransactionItem` (componente novo em `src/components/features/`)
- `RefreshControl` (pull-to-refresh → `refresh()`)
- Estados: `loading` (skeleton), `error` (retry), vazio ("Nenhuma transação ainda")
- FAB "＋" → `router.push('/transactions/new')`

`TransactionItem`: ícone por tipo/categoria, descrição, data, valor colorido (verde entrada / vermelho saída), `accessibilityLabel` com o resumo falado.

## Validação

- [ ] Lista mostra transações do usuário logado
- [ ] Pull-to-refresh recarrega
- [ ] Estado vazio e de erro aparecem corretamente
- [ ] Valor formatado em BRL; sinal/cor coerente com o tipo
- [ ] Cada item é anunciável por leitor de tela

## Gotchas

1. Usar `FlatList` (não `.map` em `ScrollView`) desde já — vira base do scroll infinito no S3.
2. `keyExtractor={(t) => t.id}`.
3. Transfer é neutro (nem verde nem vermelho) — refletir na cor.

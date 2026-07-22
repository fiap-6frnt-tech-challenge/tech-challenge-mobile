# Task 09 — Integração de filtros → query

| | |
| --- | --- |
| **Sprint** | [Sprint 3](./README.md) |
| **Owner** | Dev 3 (Nav & Integration) |
| **Duração** | 2 dias |
| **Branch** | `dev3-nav/filters-integration` |
| **Depende de** | Task 01 (listPaged), Task 04 (DS filtros) |
| **Desbloqueia** | requisito de filtros avançados |

---

## Contexto

Liga `SearchInput` + `FilterSheet` ao `TxFilter` que alimenta o `useInfiniteTransactions`. Mudar filtro reseta o scroll infinito (Task 07 já trata o reset).

## Implementação

- Estado `filter: TxFilter` na tela; `FilterSheet` emite `{ type, categories, dateFrom, dateTo }` no "Aplicar" → `setFilter`
- `SearchInput` (debounce 300ms) atualiza `filter.search`
- **Chips** de filtros ativos acima da lista; remover chip limpa aquele campo
- Botão "Limpar filtros" → `setFilter({})`
- Contador "N resultados" anunciado (a11y)

## Filtros exigidos pela spec

- **Data** (intervalo `dateFrom`/`dateTo`) ✅
- **Categoria** (multi-select) ✅
- **Tipo** (deposit/withdrawal/transfer) — "etc." da spec ✅
- **Busca** por descrição ✅

## Validação

- [ ] Filtrar por data restringe corretamente
- [ ] Multi-categoria funciona (usa `where('category','in',...)`)
- [ ] Filtrar por tipo funciona
- [ ] Busca por descrição filtra
- [ ] Combinar filtros funciona (respeitando limites do Firestore)
- [ ] Mudar filtro reseta o scroll p/ o topo
- [ ] Chips refletem filtros ativos; limpar restaura tudo

## Gotchas

1. **Combinações que exigem índice composto** → criar no console (link do erro) e commitar em `firestore.indexes.json`. Testar as combinações da demo com antecedência.
2. **Busca + orderBy('date')**: prefixo em `description` + `orderBy('date')` pode exigir índice ou refino client-side — validar cedo (ligação com Task 01).
3. Debounce da busca p/ não disparar query a cada tecla.

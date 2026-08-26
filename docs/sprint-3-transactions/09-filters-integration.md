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

- [x] Filtrar por data restringe corretamente
- [x] Multi-categoria funciona (usa `where('category','in',...)`)
- [x] Filtrar por tipo funciona
- [x] Busca por descrição filtra
- [x] Combinar filtros funciona (respeitando limites do Firestore)
- [x] Mudar filtro reseta o scroll p/ o topo
- [x] Chips refletem filtros ativos; limpar restaura tudo

> **Evidência:** testes automatizados cobrem composição/remoção de filtros, debounce contratado,
> chips, contador e reset visual; smoke em device/simulator confirmou as queries e índices no
> Firebase real.

## Gotchas

1. **Combinações que exigem índice composto** → criar no console (link do erro) e commitar em `firestore.indexes.json`. Testar as combinações da demo com antecedência.
2. **Busca + orderBy('date')**: prefixo em `description` + `orderBy('date')` pode exigir índice ou refino client-side — validar cedo (ligação com Task 01).
3. Debounce da busca p/ não disparar query a cada tecla.

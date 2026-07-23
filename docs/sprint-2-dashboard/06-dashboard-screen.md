# Task 06 — Tela Dashboard: layout + integração

| | |
| --- | --- |
| **Sprint** | [Sprint 2](./README.md) |
| **Owner** | Dev 3 (Nav & Integration) |
| **Duração** | 2.5 dias |
| **Branch** | `dev3-nav/dashboard-screen` |
| **Depende de** | Tasks 02, 03, 05 |
| **Desbloqueia** | Task 07 (estados) |

---

## Contexto

Monta a tela `(app)/index.tsx` juntando KPIs, gráficos e animações. Consome só `useDashboardData()`.

## Implementação

`app/(app)/index.tsx`:

- Header: saudação ("Olá, {name}") + saldo em destaque (`KpiCard` tone primary)
- Linha de KPIs: entradas / saídas (`SummaryTile`)
- Seção "Receita × Despesa": `ExpenseBarChart` (byMonth)
- Seção "Gastos por categoria": `CategoryPieChart` (byCategory) + insight de `topCategory`
- Seção "Evolução do saldo": `BalanceLineChart`
- Cada seção envolvida em `<AnimatedSection index={i}>` (Task 04)
- `ScrollView` com `RefreshControl` → `refresh()`

## Validação

- [ ] KPIs batem com a soma real das transações
- [ ] 3 gráficos renderizam com dados do usuário
- [ ] Seções entram animadas (stagger) ao montar
- [ ] Insight textual (categoria de maior gasto) aparece
- [ ] Layout ok em 360px e tablets

## Gotchas

1. **Gráficos dentro de `ScrollView`**: garantir que o gesto do gráfico (se houver) não conflita com o scroll — desabilitar interação do gráfico se necessário.
2. Passar dados já agregados aos gráficos (nunca `items` cru).
3. Nome do usuário vem do `useAuth().user?.displayName`.

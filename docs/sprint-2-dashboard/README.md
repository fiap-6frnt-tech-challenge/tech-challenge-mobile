# Sprint 2 — Dashboard + Charts + Animations

**Duração:** 10 dias · 2026-08-04 → 2026-08-13
**Time:** 3 devs — Dev 1 (Firebase & Data) · Dev 2 (UI & DS) · Dev 3 (Nav & Integration)
**Objetivo:** Tela **Dashboard** com gráficos e análises financeiras baseadas nas transações do usuário, e **animações de transição entre seções** usando a **`Animated` API (React Native)** — requisito literal da spec.

> Voltar para o [PLAN.md](../PLAN.md) · Alocação: [team-allocation.md#sprint-2](../team-allocation.md#sprint-2--dashboard--charts--animations-10-dias-0408--1308) · Anterior: [Sprint 1](../sprint-1-auth-data/README.md) · Próximo: [Sprint 3](../sprint-3-transactions/README.md)

---

## Pré-requisitos

- [x] Sprint 1 fechado (auth + Firestore + contexts + lista básica)
- [x] `TransactionContext` fornece `items` do usuário
- [ ] `react-native-svg` instalado (dep dos gráficos)

---

## Ordem de execução

| # | Status | Task | Owner | Duração | Paralela? | Arquivo |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | ⏳ | Agregações puras (saldo, categoria, mês, receita/despesa) | Dev 1 | 1.5 dia | ✅ | [01-aggregations.md](./01-aggregations.md) |
| 02 | ⏳ | DS: gráficos (Bar, Pie, Line) | Dev 2 | 3 dias | ✅ | [02-ds-charts.md](./02-ds-charts.md) |
| 03 | ⏳ | DS: `KpiCard` / `SummaryTile` | Dev 2 | 1 dia | ✅ | [03-ds-kpi-cards.md](./03-ds-kpi-cards.md) |
| 04 | ⏳ | Animações `Animated` entre seções | Dev 2 | 2 dias | ⬅ 03 | [04-animated-sections.md](./04-animated-sections.md) |
| 05 | ⏳ | Hook `useDashboardData` | Dev 3 | 1 dia | ⬅ 01 | [05-hook-dashboard-data.md](./05-hook-dashboard-data.md) |
| 06 | ⏳ | Tela Dashboard: layout + integração | Dev 3 | 2.5 dia | ⬅ 02, 03, 05 | [06-dashboard-screen.md](./06-dashboard-screen.md) |
| 07 | ⏳ | Estados vazio/carregando/erro + pull-to-refresh | Dev 3 | 1 dia | ⬅ 06 | [07-states-refresh.md](./07-states-refresh.md) |
| 08 | ⏳ | Testes + smoke | Todos | 1 dia | ⬅ impl | [08-tests-smoke.md](./08-tests-smoke.md) |

**Legenda:** ✅ mergeada · 🟢 implementada · ⏳ pendente

---

## Dependências entre tasks

```
01 (agregações) ─→ 05 (hook) ─┐
02 (charts) ──────────────────┼→ 06 (tela) ─→ 07 (estados)
03 (kpi) ─→ 04 (animações) ───┘
tudo ─→ 08 (testes/smoke)
```

---

## Nota sobre "análises financeiras"

A spec pede "gráficos **e análises**". Cobrimos com:

- **KPIs:** saldo atual, total de entradas, total de saídas (mês corrente)
- **Gráfico de barras:** receita vs. despesa por mês (últimos 6 meses)
- **Gráfico de pizza:** distribuição de gastos por categoria
- **Gráfico de linha:** evolução do saldo ao longo do tempo
- **Insight textual simples:** categoria com maior gasto no mês (análise derivada)

## Critério de aceite do sprint

- [ ] Dashboard mostra KPIs corretos (batem com a soma das transações)
- [ ] 3 gráficos renderizam com dados reais do usuário
- [ ] **Transição animada** entre seções do dashboard (`Animated`) — visível e fluida
- [ ] Estado vazio ("Adicione transações para ver seus gráficos") quando não há dados
- [ ] Pull-to-refresh recalcula os gráficos
- [ ] Agregações têm testes unitários (entrada conhecida → saída esperada)
- [ ] Gráficos performáticos com ~100+ transações

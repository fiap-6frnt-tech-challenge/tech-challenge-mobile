# Sprint 2 — Dashboard Completo

**Duração:** 10 dias · 2026-08-04 -> 2026-08-13
**Time:** 3 devs — Dev 1 (Firebase & Data) · Dev 2 (UI & DS) · Dev 3 (Nav & Integration)
**Objetivo:** Entregar o dashboard completo exigido pela spec: KPIs, gráficos e análises financeiras baseadas em transações reais do usuário, com transições animadas usando `Animated`.

> Voltar para o [PLAN.md](../PLAN.md) · Alocação: [team-allocation.md#sprint-2](../team-allocation.md#sprint-2--dashboard-completo-10-dias--0408---1308) · Anterior: [Sprint 1](../sprint-1-auth-data/README.md) · Próximo: [Sprint 3](../sprint-3-transactions/README.md)

---

## Pré-requisitos

- [x] Sprint 1 fechada
- [x] Auth real funcionando
- [x] CRUD mínimo de transações funcionando no Firestore
- [x] Domínio portado com agregações (`calculateBalance`, `aggregateByMonth`, `cumulativeBalance`, `groupByCategory`)
- [x] `react-native-svg` instalado pela branch `navigation-skeleton`
- [ ] Biblioteca de gráficos instalada e validada

---

## Ordem de execução

| # | Status | Task | Owner | Duração | Paralela? | Arquivo |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | ⏳ | Consolidar agregações portadas e adaptar para dados Firestore | Dev 1 | 1 dia | ✅ | [01-aggregations.md](./01-aggregations.md) |
| 02 | ⏳ | DS: gráficos Bar, Pie e Line + stories | Dev 2 | 3 dias | ✅ | [02-ds-charts.md](./02-ds-charts.md) |
| 03 | ⏳ | DS: `KpiCard`, `SummaryTile`, estados vazio/carregando + stories | Dev 2 | 1.5 dia | ✅ | [03-ds-kpi-cards.md](./03-ds-kpi-cards.md) |
| 04 | ⏳ | Animações `Animated` entre seções do dashboard | Dev 2 | 2 dias | ⬅ 03 | [04-animated-sections.md](./04-animated-sections.md) |
| 05 | ⏳ | Hook `useDashboardData` | Dev 3 | 1 dia | ⬅ 01 | [05-hook-dashboard-data.md](./05-hook-dashboard-data.md) |
| 06 | ⏳ | Tela Dashboard: KPIs + 3 gráficos + insight textual | Dev 3 | 2.5 dias | ⬅ 02, 03, 05 | [06-dashboard-screen.md](./06-dashboard-screen.md) |
| 07 | ⏳ | Pull-to-refresh + estados + performance com 100+ transações | Dev 3 | 1 dia | ⬅ 06 | [07-states-refresh.md](./07-states-refresh.md) |
| 08 | ⏳ | Testes + smoke visual | Todos | 1 dia | ⬅ impl | [08-tests-smoke.md](./08-tests-smoke.md) |

**Legenda:** ✅ mergeada · 🟢 implementada · ⏳ pendente

---

## Dependências entre tasks

```txt
01 (agregações) -> 05 (hook)
02 (charts) -> 06 (dashboard)
03 (KPIs/estados) -> 04 (Animated) -> 06
05 -> 06 -> 07
tudo -> 08
```

---

## Escopo mantido do dashboard

O dashboard continua com o escopo completo planejado:

- **KPIs:** saldo atual, entradas do mês, saídas do mês
- **Gráfico de barras:** receita vs despesa por mês
- **Gráfico de pizza:** gastos por categoria
- **Gráfico de linha:** evolução do saldo
- **Insight textual:** maior categoria de gasto no mês
- **Animação:** transição entre seções usando `Animated`

---

## Critério de aceite do sprint

- [ ] Dashboard usa transações reais do usuário autenticado
- [ ] KPIs batem com as somas do domínio
- [ ] Gráfico de barras renderiza receita vs despesa por mês
- [ ] Gráfico de pizza renderiza gastos por categoria
- [ ] Gráfico de linha renderiza evolução do saldo
- [ ] Insight textual aparece quando há dados suficientes
- [ ] Estado vazio orienta o usuário a criar transações
- [ ] Pull-to-refresh recarrega e recalcula dados
- [ ] Transição `Animated` é visível e fluida
- [ ] Storybook documenta componentes de KPI e gráficos
- [ ] Testes cobrem agregações e hook

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

## Entregue

| Arquivo | Papel |
| --- | --- |
| `src/screens/(app)/dashboard/DashboardScreen.tsx` | A tela (a rota `app/(app)/(tabs)/index.tsx` já re-exportava a screen) |
| `scripts/seed-transactions.mjs` | Popula `users/{uid}/transactions` com ~6 meses de dados de demonstração (`npm run seed`) |

A tela consome só `useDashboardData()` + `useAuth()`. Seções (`AnimatedSection index`): 0 saudação + saldo,
1 entradas/saídas do mês, 2 barras, 3 pizza + insight, 4 linha.

## Validação

- [x] KPIs batem com a soma real das transações — saldo = `totals.balance`; entradas/saídas = último bucket de `byMonth` (mês corrente). Nenhum número é calculado na tela: só formatação e comparação mês a mês
- [x] 3 gráficos renderizam com dados do usuário — `byMonth` / `byCategory` / `balanceOverTime` vindos do hook, séries já agregadas
- [x] Seções entram animadas (stagger) ao montar — `AnimatedSectionGroup` + `AnimatedSection index={0..4}`; `replay()` no fim do pull-to-refresh
- [x] Insight textual (categoria de maior gasto) aparece — `topCategory` → "Maior gasto do mês: {categoria} com {valor}, {n}% das saídas"
- [x] Layout ok em 360px e tablets — conteúdo com `maxWidth` = 640 (teto do `useChartWidth`) + os 56px de inset (`spacing.lg` da tela + `spacing.md` do `Card`), centralizado; a linha de KPIs tem só 2 tiles

> Verificado estaticamente (`tsc --noEmit`, `eslint`, `prettier`). **Falta rodar em device/emulador:** conferir a
> cascata a olho, o layout em 360px/tablet e o pull-to-refresh. Estados de vazio/carregando/erro são a Task 07 —
> hoje o primeiro load mostra os gráficos vazios em vez de skeleton.

## Dados de demonstração

```bash
npm run seed -- --email=voce@exemplo.com --password=suaSenha [--months=6] [--reset] [--dry-run]
```

Autentica com um usuário já cadastrado, gera salário/aluguel/mercado/transporte/lazer/saúde/educação nos últimos
N meses (nunca datas futuras, `amount` sempre positivo) e grava em `users/{uid}/transactions`. Ao final imprime
entradas/saídas/saldo — dá para conferir os KPIs da tela contra esses números.

## Gotchas

1. **Gráficos dentro de `ScrollView`**: garantir que o gesto do gráfico (se houver) não conflita com o scroll — desabilitar interação do gráfico se necessário.
2. Passar dados já agregados aos gráficos (nunca `items` cru).
3. Nome do usuário vem do `useAuth().user?.displayName`.

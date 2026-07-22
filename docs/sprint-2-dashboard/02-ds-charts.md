# Task 02 — DS: gráficos (Bar, Pie, Line)

| | |
| --- | --- |
| **Sprint** | [Sprint 2](./README.md) |
| **Owner** | Dev 2 (UI & DS) |
| **Duração** | 3 dias |
| **Branch** | `dev2-ui/ds-charts` |
| **Depende de** | S0-03 (tema) |
| **Desbloqueia** | Task 06 (tela) |

---

## Contexto

Componentes de gráfico reutilizáveis, estilizados com os tokens do tema. Recebem apenas dados já agregados (Task 01) — nada de lógica de negócio dentro do gráfico.

## Stack

```bash
npx expo install react-native-svg
npm i react-native-gifted-charts
```

> `gifted-charts` tem peer-dep opcional `react-native-linear-gradient`. Se não instalar, usar barras/áreas sólidas (sem gradiente). Se travar no Expo, alternativa: `react-native-chart-kit` (só `react-native-svg`).

## Componentes (`src/components/ui/charts/`)

- **`ExpenseBarChart`** — barras receita×despesa por mês (dados de `byMonth`)
- **`CategoryPieChart`** — pizza/donut por categoria (`byCategory`) + legenda
- **`BalanceLineChart`** — linha do saldo acumulado (`balanceOverTime`)

Props tipadas com as saídas da Task 01. Cores das categorias vindas de um mapa no tema (paleta acessível, contraste AA). Entrega **1 gráfico/dia** para Dev 3 integrar incremental. **Cada gráfico entra com `.stories.tsx`** usando fixtures (inclusive estado vazio) — o Storybook vira o playground de ajuste visual dos gráficos.

## Validação

- [ ] Cada gráfico renderiza com um fixture de dados
- [ ] Cores vêm do tema (sem hex hard-coded no componente)
- [ ] Legenda/labels legíveis; pizza tem legenda textual (não só cor — a11y)
- [ ] Sem warning de `react-native-svg` no console
- [ ] Stories no Storybook (com dados e vazio) para cada gráfico

## Gotchas

1. **Não passar `Transaction[]` cru** — o gráfico recebe dados agregados. Separação clara viz ↔ lógica.
2. **A11y de gráfico:** cor sozinha não comunica; incluir rótulo/valor textual e `accessibilityLabel` resumindo a série.
3. Larguras responsivas: `useWindowDimensions()` p/ o gráfico caber em telas diferentes.

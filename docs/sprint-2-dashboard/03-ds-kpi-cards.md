# Task 03 — DS: `KpiCard` / `SummaryTile`

| | |
| --- | --- |
| **Sprint** | [Sprint 2](./README.md) |
| **Owner** | Dev 2 (UI & DS) |
| **Duração** | 1 dia |
| **Branch** | `dev2-ui/ds-kpi-cards` |
| **Depende de** | S0-03 (tema) |
| **Desbloqueia** | Task 04 (animações), Task 06 (tela) |

---

## Contexto

Cartões de destaque para os KPIs financeiros (saldo, entradas, saídas). Base visual das seções que serão animadas na Task 04.

## Implementação

`src/components/ui/KpiCard.tsx`:

- Props: `label`, `value` (number, formatado BRL), `trend?` ('up'|'down'|'neutral'), `icon?`, `tone` ('primary'|'positive'|'negative')
- Layout: label pequeno + valor grande + ícone/seta de tendência
- `accessibilityLabel`: "Saldo atual: R$ 1.234,56"

`SummaryTile`: variação compacta p/ linha de 3 tiles.

`KpiCard`/`SummaryTile` entram com `.stories.tsx` cobrindo os `tone` (primary/positive/negative) e as tendências (up/down/neutral).

## Validação

- [x] Valor formatado em BRL — `formatBRL` (`src/components/ui/currency.ts`), conferido p/ positivo, zero, `-0` e negativo
- [x] `tone` muda a cor de destaque (via tema) — `toneColors()` só lê tokens do tema, sem hex solto
- [x] Anunciado por leitor de tela com label + valor — `accessible` + `accessibilityRole="text"` + label composto (`"Saldo atual: R$ 1.234,56, em alta"`)
- [x] Renderiza em linha de 3 sem quebrar em telas 360px — story `SummaryTile › ThreeInARowNarrow` cobre o caso
- [x] Stories no Storybook (tones e tendências) — `KpiCard.stories.tsx` e `SummaryTile.stories.tsx`, ambos com `AllStates`

> Os 3 primeiros itens foram verificados estaticamente (código + `tsc` + `eslint`/`prettier`). A verificação em device
> (TalkBack/VoiceOver e layout em 360px) ainda não foi executada.

## Gotchas

1. Formatação BRL com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` — funciona no Hermes/RN.
2. Não confiar só em cor p/ tendência — incluir ícone/seta + texto.

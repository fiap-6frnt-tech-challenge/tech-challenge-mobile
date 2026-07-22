# Planejamento — Tech Challenge Fase 3 (Bytebank Mobile)

Planejamento completo para o **POSTECH Tech Challenge Fase 3** — app de gerenciamento financeiro em **React Native (Expo) + Firebase**, com **Context API**, gráficos, animações `Animated`, **scroll infinito**, filtros avançados, validação, upload de recibos e **design system documentado no Storybook**. Todas as tecnologias são **gratuitas** (ver seção *Custos & free tier* no PLAN.md; única ressalva: Firebase Storage exige plano Blaze, mas fica dentro da cota grátis).

**Time:** 3 desenvolvedores · **Prazo:** 31/08/2026 · **Janela:** 18/07 → 31/08 (45 dias / 5 sprints)

> Copie esta pasta para `docs/phase-3/` no novo repositório `bytebank-mobile`.

## Índice

- 📋 **[PLAN.md](./PLAN.md)** — plano geral, decisões de stack, arquitetura, riscos, verificação end-to-end
- 👥 **[team-allocation.md](./team-allocation.md)** — alocação das tarefas pelos 3 devs em cada sprint

### Sprints

| Sprint | Foco | Dias | Datas |
| --- | --- | --- | --- |
| **[0 — Foundation](./sprint-0-foundation/README.md)** | Expo + Firebase + navegação + tema | 7 | 18/07 → 24/07 |
| **[1 — Auth + Firestore](./sprint-1-auth-data/README.md)** | Firebase Auth + Firestore + Context API | 10 | 25/07 → 03/08 |
| **[2 — Dashboard](./sprint-2-dashboard/README.md)** | Gráficos + análises + animações `Animated` | 10 | 04/08 → 13/08 |
| **[3 — Transactions](./sprint-3-transactions/README.md)** | Scroll infinito + filtros + form + anexos | 11 | 14/08 → 24/08 |
| **[4 — Polish + Deploy](./sprint-4-polish-deploy/README.md)** | A11y + EAS Build + README + vídeo | 7 | 25/08 → 31/08 |

Cada pasta de sprint tem um `README.md` (visão geral, ordem de execução, dependências, critérios de aceite) e **um arquivo por task** (contexto, implementação, validação, gotchas).

## Como usar

1. Leia o **[PLAN.md](./PLAN.md)** para o panorama e as decisões.
2. Distribua as tasks conforme **[team-allocation.md](./team-allocation.md)**.
3. A cada sprint, siga o `README.md` da pasta correspondente e os arquivos de task na ordem indicada.
4. Feche cada sprint pelo seu critério de aceite antes de avançar.

# Planejamento — Tech Challenge Fase 3 (Bytebank Mobile)

Planejamento completo para o **POSTECH Tech Challenge Fase 3** — app de gerenciamento financeiro em **React Native (Expo) + Firebase**, com **Context API**, gráficos, animações `Animated`, **scroll infinito**, filtros avançados, validação, upload de recibos e **design system documentado no Storybook**.

**Time:** 3 desenvolvedores · **Prazo:** 31/08/2026 · **Janela:** 18/07 -> 31/08 (45 dias / 5 sprints)

> Este plano considera o trabalho já adiantado na branch `navigation-skeleton`: grupos de rota `(auth)` e `(app)`, tabs, telas placeholder, movimentação inicial de componentes para `src/components`, ícones com `lucide-react-native` e instalação de `react-native-svg`.

## Índice

- **[PLAN.md](./PLAN.md)** — plano geral, decisões de stack, arquitetura, riscos, verificação end-to-end
- **[team-allocation.md](./team-allocation.md)** — alocação das tarefas pelos 3 devs em cada sprint

### Sprints

| Sprint | Foco | Dias | Datas |
| --- | --- | --- | --- |
| **[0 — Foundation](./sprint-0-foundation/README.md)** | Integrar `navigation-skeleton`, domínio, Firebase, tema, Storybook e spikes de risco | 7 | 18/07 -> 24/07 |
| **[1 — Auth + CRUD mínimo](./sprint-1-auth-data/README.md)** | Firebase Auth + Firestore + Context API + criar/editar/listar transações sem anexos | 10 | 25/07 -> 03/08 |
| **[2 — Dashboard](./sprint-2-dashboard/README.md)** | Gráficos completos + análises + animações `Animated` | 10 | 04/08 -> 13/08 |
| **[3 — Transactions Advanced](./sprint-3-transactions/README.md)** | Scroll infinito + filtros + busca Firestore + anexos Storage integrados | 11 | 14/08 -> 24/08 |
| **[4 — Polish + Deploy](./sprint-4-polish-deploy/README.md)** | A11y + performance + EAS Build + README + vídeo | 7 | 25/08 -> 31/08 |

Cada pasta de sprint tem um `README.md` com visão geral, ordem de execução, dependências e critérios de aceite. Os arquivos de task detalham a implementação e devem ser ajustados conforme a ordem revisada deste planejamento.

## Como usar

1. Leia o **[PLAN.md](./PLAN.md)** para entender a estratégia revisada.
2. Integre ou rebases a branch `navigation-skeleton` antes de iniciar novas tasks de navegação.
3. Distribua as tasks conforme **[team-allocation.md](./team-allocation.md)**.
4. A cada sprint, siga o `README.md` da pasta correspondente como fonte de verdade.
5. Feche cada sprint pelo critério de aceite antes de avançar.

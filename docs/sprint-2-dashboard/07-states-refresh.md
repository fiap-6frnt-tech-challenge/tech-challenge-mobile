# Task 07 — Estados vazio/carregando/erro + pull-to-refresh

| | |
| --- | --- |
| **Sprint** | [Sprint 2](./README.md) |
| **Owner** | Dev 3 (Nav & Integration) |
| **Duração** | 1 dia |
| **Branch** | `dev3-nav/dashboard-states` |
| **Depende de** | Task 06 |

---

## Contexto

Polimento de UX do dashboard: os três estados não-felizes e o refresh, com acessibilidade.

## Implementação

- **Carregando:** skeleton dos cards/gráficos (shimmer leve) enquanto `loading`
- **Vazio (`isEmpty`):** ilustração + "Adicione sua primeira transação para ver seus gráficos" + botão → `/transactions/new`
- **Erro:** mensagem + botão "Tentar novamente" → `refresh()`
- **Pull-to-refresh:** `RefreshControl` re-busca e re-dispara o stagger (Task 04)

## Validação

- [ ] Sem transações → estado vazio com CTA
- [ ] Erro de rede → mensagem + retry funcional
- [ ] Skeleton durante o primeiro load
- [ ] Pull-to-refresh atualiza dados e anima
- [ ] Estados anunciados por leitor de tela

## Gotchas

1. Diferenciar **primeiro load** (skeleton) de **refresh** (spinner do RefreshControl) — não mostrar os dois.
2. Estado vazio é comum no início da demo — capriche, é a primeira impressão.

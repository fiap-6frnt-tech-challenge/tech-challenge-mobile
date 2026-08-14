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
- **Vazio (`isEmpty`):** ilustração + "Adicione sua primeira transação para ver seus gráficos" + botão → `/transactionAdd`
- **Erro:** mensagem + botão "Tentar novamente" → `refresh()`
- **Pull-to-refresh:** `RefreshControl` re-busca e re-dispara o stagger (Task 04)

## Entregue

- `DashboardFeedback` implementa os estados vazio e erro, com CTA, retry e anúncios acessíveis.
- `DashboardSkeleton` cobre o primeiro carregamento com blocos não focáveis e suporte à redução de movimento.
- `dashboardState` concentra a seleção de estado; `runDashboardRefresh` liga o spinner, aguarda `refresh()` e, em `finally`, limpa o spinner e dispara `replay()`, tanto em sucesso quanto em falha.
- `DashboardScreen` integra skeleton, feedback, `RefreshControl`, CTA para `/transactionAdd`, erro inline com dados anteriores e retry.
- `DashboardScreen` também é dona da preservação do erro vazio durante retry e da deduplicação por requisição em voo; `dashboardState` não mantém esse estado de tela.
- Testes de componentes, tela e helpers cobrem estados, acessibilidade estrutural, rota, refresh, retry, deduplicação de requisições e erro com dados anteriores.
- O refresh mantém o conteúdo enquanto o spinner está ativo, não duplica requisições concorrentes e exibe erro inline sem remover os dados anteriores.

## Validação

- [ ] Sem transações → estado vazio com CTA
- [ ] Erro de rede → mensagem + retry funcional
- [ ] Skeleton durante o primeiro load
- [ ] Pull-to-refresh atualiza dados e anima
- [ ] Estados anunciados por leitor de tela

## Validação automatizada

Resultados registrados após executar localmente:

- `npx vitest run 'src/components/features/dashboard/DashboardStates.test.tsx' 'src/screens/(app)/dashboard/dashboardState.test.ts' 'src/screens/(app)/dashboard/DashboardScreen.test.tsx'` — 3 arquivos e 24 testes passaram.
- `npm run test:domain` — 14 arquivos e 164 testes passaram.
- `npm run lint` — ESLint passou e todos os arquivos verificados pelo Prettier estão formatados.
- `npx tsc --noEmit` — passou sem erros.
- `git diff --check phase-3...dev1-fb/dashboard-states` — passou sem erros.

## Validação manual

Ainda pendente, sem evidência nesta sessão:

- smoke em dispositivo ou emulador, registrando dispositivo, OS e build;
- VoiceOver no iOS e TalkBack no Android, incluindo anúncios e nomes acessíveis;
- animações observadas e comportamento com Reduzir Movimento ativado;
- fluxo offline, retry inicial e retry de refresh com dados anteriores;
- cenário com 100+ transações, incluindo scroll, duas atualizações e observação de performance.

## Gotchas

1. Diferenciar **primeiro load** (skeleton) de **refresh** (spinner do RefreshControl) — não mostrar os dois.
2. Estado vazio é comum no início da demo — capriche, é a primeira impressão.

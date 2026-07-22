# Alocação de Time — 3 Devs

**Time:** 3 desenvolvedores
**Estratégia:** 3 tracks paralelos por responsabilidade; cada dev é "dono" de uma vertical através das 5 sprints. Continuidade reduz onboarding e overlap.

> Voltar para o [PLAN.md](./PLAN.md)

---

## Tracks (donos)

| Handle | Track | Foco | Skills demandadas |
| --- | --- | --- | --- |
| **Dev 1 — `dev1-fb`** | **Firebase & Data** | Firebase (Auth, Firestore, Storage), security rules, services/repositories, domínio, agregações, EAS Build, README | Firebase, modelagem de dados, regras de segurança, Node |
| **Dev 2 — `dev2-ui`** | **UI & Design System** | Componentes RN, tema/tokens, **Storybook (doc do DS)**, telas (forms, dashboard), gráficos, animações `Animated`, acessibilidade | React Native, UI, Storybook, `Animated`, RHF, a11y |
| **Dev 3 — `dev3-nav`** | **Navigation & Integration** | Expo Router, Context providers, hooks (scroll infinito, dashboard, filtros), integração Firebase↔UI, anexos | React Native, Expo Router, Context API, integração |

**Princípios:**

1. **Cada dev tem 1 track principal**, mas pega tarefas auxiliares de outro track quando fica sem dependências.
2. **Dependências marcadas explicitamente** (`⬅ depende de`) para o time saber o que sequenciar.
3. **Firebase-first:** Dev 1 entrega services/rules cedo no sprint para desbloquear Dev 3 (integração).
4. **DS-first:** Dev 2 entrega componentes de UI cedo para desbloquear as telas de Dev 3.
5. **Smoke test sempre no fim do sprint** — todo o time.
6. **Pair nas fronteiras:** integrações Firebase↔Context↔UI são feitas em par (Dev 1+Dev 3 ou Dev 2+Dev 3).

**Capacidade por sprint:** 3 devs × dias do sprint. Mantemos ~40-50% de alocação nominal para absorver imprevistos, code review e pair.

---

## Sprint 0 — Foundation (7 dias · 18/07 → 24/07)

| # | Tarefa | Owner | Dias | Depende de |
| --- | --- | --- | --- | --- |
| 01 | Bootstrap app Expo (TS + Expo Router + estrutura de pastas) | Dev 3 | 1 | — |
| 02 | Setup projeto Firebase (console) + `firebase.ts` + env `EXPO_PUBLIC_*` | Dev 1 | 1 | — |
| 03 | Tema + tokens + `ThemeProvider` + componentes base (Button, Text, Card) **+ setup Storybook** | Dev 2 | 3 | Task 01 |
| 04 | Navegação: grupos `(auth)`/`(app)`, tabs, root layout | Dev 3 | 1 | Task 01 |
| 05 | Domínio: portar types + Zod + categorias + `suggestCategory` do web | Dev 1 | 1 | Task 01 |
| 06 | Skeletons de Context (`AuthContext`, `TransactionContext` vazios) | Dev 3 | 0.5 | Task 04 |
| 07 | CI (lint + typecheck + test) + init EAS (`eas.json`) | Dev 1 | 0.5 | Task 01 |
| 08 | **Gate** + smoke: app roda em device, Firebase conecta, auth persiste | Todos | 0.5 | tudo acima |

**Alocado:** Dev 1 ~2.5 · Dev 2 ~3 · Dev 3 ~2.5 (de 21 dev-days). Buffer alto p/ o time aprender Expo/Firebase.
**Dep crítica:** Dev 2 e Dev 3 dependem do bootstrap (Task 01, dia 1). Gate no dia 5 valida persistência de auth (risco #1).
**Convenção fixada aqui:** o setup do Storybook na Task 03 estabelece que **todo componente do DS (Sprints 1-3) nasce com sua `.stories.tsx`** — o esforço das stories está embutido em cada task de DS.

---

## Sprint 1 — Auth + Firestore Data Layer (10 dias · 25/07 → 03/08)

| # | Tarefa | Owner | Dias | Depende de |
| --- | --- | --- | --- | --- |
| 01 | `auth.service` (Firebase Auth: signUp/signIn/signOut + persistência) | Dev 1 | 1 | S0 |
| 02 | `AuthContext` (`user`, `loading`, ações) + guard de navegação | Dev 1 | 1 | Task 01 |
| 03 | Modelo Firestore `users/{uid}/transactions` + `firestore.rules` | Dev 1 | 1.5 | S0 |
| 04 | `transactions.service` (CRUD Firestore) | Dev 1 | 1.5 | Task 03 |
| 05 | DS: form (TextField, CurrencyInput, Select, DatePicker, Button states) | Dev 2 | 2.5 | S0 |
| 06 | Tela Login + tela Register (RHF + Zod) | Dev 2 | 2 | Tasks 02, 05 |
| 07 | `TransactionContext` (`useReducer` + ações → service) | Dev 3 | 1.5 | Task 04 |
| 08 | Wiring de rotas protegidas (redirect por estado de auth) | Dev 3 | 1 | Task 02 |
| 09 | Tela lista básica (sem filtros/scroll) consumindo o context | Dev 3 | 1.5 | Task 07 |
| 10 | Testes (auth flow, reducer, rules deny) + smoke + vídeo curto | Todos | 1 | impl |

**Alocado:** Dev 1 ~6 · Dev 2 ~4.5 · Dev 3 ~5 (de 30 dev-days).
**Deps críticas:** Dev 3 (Task 07) espera `transactions.service` (Task 04, ~dia 4). Dev 2 (Task 06) espera `AuthContext` (Task 02, ~dia 3). Mitigação: Dev 1 prioriza Auth (01-02) e schema (03) nos 3 primeiros dias.

---

## Sprint 2 — Dashboard + Charts + Animations (10 dias · 04/08 → 13/08)

| # | Tarefa | Owner | Dias | Depende de |
| --- | --- | --- | --- | --- |
| 01 | Agregações puras (saldo, por categoria, por mês, receita/despesa) | Dev 1 | 1.5 | S1 |
| 02 | DS: componentes de gráfico (Bar, Pie, Line via gifted-charts) | Dev 2 | 3 | S1 |
| 03 | DS: `KpiCard` / `SummaryTile` (saldo, entradas, saídas) | Dev 2 | 1 | — |
| 04 | Animações `Animated` de transição entre seções do dashboard | Dev 2 | 2 | Task 03 |
| 05 | Hook `useDashboardData` (context + agregações) | Dev 3 | 1 | Task 01 |
| 06 | Tela Dashboard: layout + integração dos gráficos/KPIs | Dev 3 | 2.5 | Tasks 02, 03, 05 |
| 07 | Estados vazio/carregando/erro + pull-to-refresh | Dev 3 | 1 | Task 06 |
| 08 | Testes (agregações, hook, render dos gráficos) + smoke | Todos | 1 | impl |

**Alocado:** Dev 1 ~1.5+apoio · Dev 2 ~6 · Dev 3 ~4.5 (de 30 dev-days).
**Deps críticas:** Dev 3 (Task 06) espera Dev 2 entregar gráficos (Task 02) — Dev 2 entrega **1 gráfico/dia** e Dev 3 integra incrementalmente. Dev 1 (folgado após Task 01) adianta paginação Firestore da Sprint 3 e apoia testes.

---

## Sprint 3 — Transactions: Infinite Scroll + Filters + Form + Attachments (11 dias · 14/08 → 24/08)

| # | Tarefa | Owner | Dias | Depende de |
| --- | --- | --- | --- | --- |
| 01 | `transactions.service`: paginação por cursor (`startAfter`+`limit`) + filtros/busca | Dev 1 | 1.5 | S1 |
| 02 | `storage.service` (upload/delete recibos) + `storage.rules` | Dev 1 | 2 | S1 |
| 03 | `suggestCategory` integrado ao domínio + testes | Dev 1 | 0.5 | S0 |
| 04 | DS: `SearchInput`, `FilterSheet`, `Chip`, `AttachmentPicker` | Dev 2 | 3 | — |
| 05 | DS: `AttachmentList` + preview (imagem/PDF) | Dev 2 | 1 | — |
| 06 | Validação Zod avançada (valor, categoria obrigatória, data não-futura, ≤5 anexos) | Dev 2 | 0.5 | Task 03 |
| 07 | Hook `useInfiniteTransactions` (cursor + `onEndReached` do FlatList) | Dev 3 | 1.5 | Task 01 |
| 08 | Tela lista com scroll infinito (FlatList) | Dev 3 | 1.5 | Tasks 07, 09 (parcial) |
| 09 | Integração de filtros (data/categoria/tipo/busca) → query Firestore | Dev 3 | 2 | Tasks 01, 04 |
| 10 | Form Add/Edit + validação + sugestão de categoria | Dev 3 | 1.5 | Tasks 04, 06 |
| 11 | Fluxo de anexos (picker → Storage → ref no Firestore) | Dev 3 | 1.5 | Tasks 02, 04, 05 |
| 12 | Testes + smoke + vídeo 4 min | Todos | 1 | impl |

**Alocado:** Dev 1 ~4 · Dev 2 ~4.5 · Dev 3 ~9.5 (de 33 dev-days). Dev 3 é o gargalo — Dev 1 apoia a partir do dia 5 (integração de filtros/anexos em par).
**Deps críticas:** Dev 3 depende de quase tudo de Dev 1 (01, 02) e Dev 2 (04, 05). Ordem: Dev 1 entrega paginação (01) no dia 2 e Storage (02) no dia 4; Dev 2 entrega DS de filtros/anexos (04, 05) até o dia 4.

---

## Sprint 4 — Polish + Build + Demo (7 dias · 25/08 → 31/08)

| # | Tarefa | Owner | Dias | Depende de |
| --- | --- | --- | --- | --- |
| 01 | Auditoria de acessibilidade (labels, roles, contraste, leitor de tela) | Dev 2 | 1.5 | S1-S3 |
| 02 | Performance (FlatList tuning, `memo`, cache de imagem, cold start) | Dev 3 | 1.5 | S3 |
| 03 | EAS Build config + gerar **APK Android** | Dev 1 | 1.5 | S3 |
| 04 | README final (setup Firebase, `.env`, deps, passos p/ rodar) | Dev 1 | 1 | S3 |
| 05 | E2E dos fluxos críticos (Maestro opcional) | Dev 3 | 1 | S3 |
| 06 | **Vídeo demo (≤5 min)** — login, add/edit, filtrar, upload, Firebase | Todos | 1 | tudo |
| 07 | Smoke final em clone limpo + tag `v1.0.0` + merge `develop`→`main` | Todos | 0.5 | tudo |

**Alocado:** Dev 1 ~2.5 · Dev 2 ~1.5 · Dev 3 ~2.5 (de 21 dev-days). 3 dias de buffer embutidos p/ o prazo fixo de 31/08.

---

## Resumo de esforço por dev

| Dev | S0 | S1 | S2 | S3 | S4 | Total (dev-days) |
| --- | --- | --- | --- | --- | --- | --- |
| **Dev 1 — Firebase & Data** | 2.5 | 6 | 1.5 | 4 | 2.5 | ~16.5 |
| **Dev 2 — UI & DS** | 3 | 4.5 | 6 | 4.5 | 1.5 | ~19.5 |
| **Dev 3 — Nav & Integration** | 2.5 | 5 | 4.5 | 9.5 | 2.5 | ~24 |

Dev 3 (integrador) carrega mais nas Sprints 3-4; Dev 1 e Dev 2 apoiam a integração conforme liberam dependências. O balanceamento é intencional: a criação de contexto/serviço (Dev 1) e de componentes (Dev 2) é front-loaded; a "colagem" final (Dev 3) é back-loaded.

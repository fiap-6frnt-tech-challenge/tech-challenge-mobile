# Alocação de Time — 3 Devs

**Time:** 3 desenvolvedores
**Estratégia revisada:** manter 3 tracks, mas organizar as entregas por fluxo vertical. A branch `navigation-skeleton` reduz o esforço inicial de navegação e permite antecipar domínio, CRUD mínimo e spikes de Firebase.

> Voltar para o [PLAN.md](./PLAN.md)

---

## Tracks

| Handle | Track | Foco |
| --- | --- | --- |
| **Dev 1 — `dev1-fb`** | **Firebase & Data** | Firebase Auth, Firestore, Storage, security rules, services, domínio portado, agregações, EAS, README |
| **Dev 2 — `dev2-ui`** | **UI & Design System** | Tema, tokens, componentes RN, Storybook, formulários, dashboard visual, gráficos, animações, a11y |
| **Dev 3 — `dev3-nav`** | **Navigation & Integration** | Expo Router, integração da branch `navigation-skeleton`, providers, contexts, hooks, fluxos ponta-a-ponta |

**Princípios:**

1. `navigation-skeleton` deve ser integrada no início da Sprint 0.
2. CRUD mínimo vem antes do dashboard para garantir dados reais.
3. Storybook permanece obrigatório para componentes do design system.
4. Dashboard mantém escopo completo: KPIs, barras, pizza, linha, insight e `Animated`.
5. Upload Storage é testado cedo como spike e integrado de verdade na Sprint 3.
6. Dev 3 não deve carregar sozinho o formulário e os anexos; Dev 2 assume UI/form, Dev 1 assume services/rules.
7. Toda sprint fecha com smoke em device/simulator.

---

## Sprint 0 — Foundation Revisada (7 dias · 18/07 -> 24/07)

| # | Tarefa | Owner | Dias | Depende de |
| --- | --- | --- | --- | --- |
| 00 | Integrar/rebase da branch `navigation-skeleton` e validar rotas placeholder | Dev 3 | 0.5 | branch existente |
| 01 | Bootstrap final: estrutura `src/`, aliases, limpeza de placeholders e dependências | Dev 3 | 0.5 | 00 |
| 02 | Setup Firebase (`firebase.ts`, env, Auth/Firestore/Storage) | Dev 1 | 1 | — |
| 03 | Portar domínio do projeto web (`types`, Zod, categorias, agregações, `suggestCategory`) | Dev 1 | 1 | 01 |
| 04 | Tema + tokens + componentes base + Storybook on-device | Dev 2 | 3 | 00, 01 |
| 05 | Skeletons de providers/contexts (`AuthContext`, `TransactionContext`) | Dev 3 | 1 | 00, 03 |
| 06 | Spike de risco: auth persistence + upload Storage mínimo | Dev 1 + Dev 3 | 1 | 02, 05 |
| 07 | CI + init EAS (`eas.json`) + smoke do foundation | Todos | 1 | tudo acima |

**Alocado:** Dev 1 ~3 · Dev 2 ~3 · Dev 3 ~3 (de 21 dev-days).

---

## Sprint 1 — Auth + CRUD Mínimo (10 dias · 25/07 -> 03/08)

| # | Tarefa | Owner | Dias | Depende de |
| --- | --- | --- | --- | --- |
| 01 | `auth.service` + `AuthContext` completo | Dev 1 | 2 | S0 |
| 02 | Guard de rotas `(auth)`/`(app)` sobre o skeleton existente | Dev 3 | 1 | 01 |
| 03 | Modelo Firestore + `firestore.rules` | Dev 1 | 1.5 | S0 |
| 04 | `transactions.service` CRUD sem anexos | Dev 1 | 1.5 | 03 |
| 05 | DS de formulário: `TextField`, `CurrencyInput`, `Select`, `DatePicker`, estados de botão + stories | Dev 2 | 2.5 | S0 |
| 06 | Telas Login/Register | Dev 2 | 1.5 | 01, 05 |
| 07 | `TransactionContext` com reducer + CRUD real | Dev 3 | 1.5 | 04 |
| 08 | Form Add/Edit sem anexos usando Zod portado | Dev 2 + Dev 3 | 2 | 05, 07 |
| 09 | Lista básica do usuário autenticado | Dev 3 | 1 | 07 |
| 10 | Testes + smoke do fluxo login -> criar -> editar -> listar | Todos | 1 | impl |

**Alocado:** Dev 1 ~5 · Dev 2 ~6 · Dev 3 ~5.5 (de 30 dev-days).

---

## Sprint 2 — Dashboard Completo (10 dias · 04/08 -> 13/08)

| # | Tarefa | Owner | Dias | Depende de |
| --- | --- | --- | --- | --- |
| 01 | Consolidar agregações portadas e adaptar para dados Firestore | Dev 1 | 1 | S1 |
| 02 | DS: componentes de gráfico Bar, Pie e Line + stories | Dev 2 | 3 | S1, `react-native-svg` |
| 03 | DS: `KpiCard`, `SummaryTile`, estados vazio/carregando + stories | Dev 2 | 1.5 | S1 |
| 04 | Animações `Animated` entre seções do dashboard | Dev 2 | 2 | 03 |
| 05 | Hook `useDashboardData` | Dev 3 | 1 | 01 |
| 06 | Tela Dashboard completa com KPIs, 3 gráficos e insight textual | Dev 3 | 2.5 | 02, 03, 05 |
| 07 | Pull-to-refresh + performance com 100+ transações | Dev 3 | 1 | 06 |
| 08 | Testes de agregação, hook e smoke visual | Todos | 1 | impl |

**Alocado:** Dev 1 ~1+apoio · Dev 2 ~6.5 · Dev 3 ~4.5 (de 30 dev-days).

---

## Sprint 3 — Transactions Advanced (11 dias · 14/08 -> 24/08)

| # | Tarefa | Owner | Dias | Depende de |
| --- | --- | --- | --- | --- |
| 01 | `transactions.service`: paginação por cursor + filtros Firestore | Dev 1 | 1.5 | S1 |
| 02 | Estratégia de busca: campo normalizado/prefixo ou busca local documentada | Dev 1 + Dev 3 | 1 | 01 |
| 03 | `storage.service` + `storage.rules` a partir do spike | Dev 1 | 2 | S0 spike |
| 04 | DS: `SearchInput`, `FilterSheet`, `Chip`, `AttachmentPicker` + stories | Dev 2 | 3 | S1 |
| 05 | DS: `AttachmentList` + preview de imagem/PDF + stories | Dev 2 | 1 | 04 |
| 06 | Hook `useInfiniteTransactions` | Dev 3 | 1.5 | 01, 02 |
| 07 | Lista com FlatList, scroll infinito e estados de paginação | Dev 3 | 1.5 | 06 |
| 08 | Integração de filtros e busca | Dev 3 | 1.5 | 04, 06 |
| 09 | Integrar anexos ao Add/Edit existente | Dev 2 + Dev 3 | 1.5 | 03, 04, 05 |
| 10 | Remover anexo: Storage + Firestore consistentes | Dev 1 + Dev 3 | 1 | 03, 09 |
| 11 | Testes + smoke + vídeo parcial de 4 min | Todos | 1 | impl |

**Alocado:** Dev 1 ~5.5 · Dev 2 ~5.5 · Dev 3 ~6.5 (de 33 dev-days).

---

## Sprint 4 — Polish + Build + Demo (7 dias · 25/08 -> 31/08)

| # | Tarefa | Owner | Dias | Depende de |
| --- | --- | --- | --- | --- |
| 01 | Auditoria de acessibilidade | Dev 2 | 1.5 | S1-S3 |
| 02 | Performance: FlatList, memo, imagem, cold start | Dev 3 | 1.5 | S3 |
| 03 | EAS Build config + APK Android | Dev 1 | 1.5 | S3 |
| 04 | README final com Firebase, `.env`, deps, Storybook e passos locais | Dev 1 | 1 | S3 |
| 05 | E2E/smoke dos fluxos críticos | Dev 3 | 1 | S3 |
| 06 | Vídeo demo <= 5 min | Todos | 1 | tudo |
| 07 | Smoke final em clone limpo + tag `v1.0.0` + merge final | Todos | 0.5 | tudo |

**Alocado:** Dev 1 ~2.5 · Dev 2 ~1.5 · Dev 3 ~2.5 (de 21 dev-days).

---

## Resumo de esforço por dev

| Dev | S0 | S1 | S2 | S3 | S4 | Total |
| --- | --- | --- | --- | --- | --- | --- |
| **Dev 1 — Firebase & Data** | ~3 | ~5 | ~1+apoio | ~5.5 | ~2.5 | ~17 |
| **Dev 2 — UI & DS** | ~3 | ~6 | ~6.5 | ~5.5 | ~1.5 | ~22.5 |
| **Dev 3 — Nav & Integration** | ~3 | ~5.5 | ~4.5 | ~6.5 | ~2.5 | ~22 |

O esforço fica mais balanceado que no plano anterior: Dev 3 deixa de ser gargalo na Sprint 3, e Dev 2 assume naturalmente a parte pesada de formulário, filtros visuais e anexos.

# Tech Challenge — Fase 3 — Plano Geral (45 dias)

**App:** Bytebank Mobile — gerenciador financeiro em **React Native (Expo)**
**Janela:** 2026-07-18 → 2026-08-31 (45 dias corridos, ~6.5 semanas) · **prazo final 31/08**
**Time:** **3 desenvolvedores** (3 tracks paralelos — ver [team-allocation.md](./team-allocation.md))
**Repo:** **novo repositório Git** (`bytebank-mobile`) — não é continuação do monorepo web da Fase 2

> Este documento é o resumo executivo. Cada sprint tem sua própria pasta com um `README.md` de visão geral e um arquivo por task com critérios de aceite:
>
> - [team-allocation.md](./team-allocation.md) — **Alocação de tarefas por dev em cada sprint + dependências**
> - [sprint-0-foundation/](./sprint-0-foundation/README.md) — Bootstrap Expo + Firebase + navegação + tema (dias 1-7)
> - [sprint-1-auth-data/](./sprint-1-auth-data/README.md) — Firebase Auth + Firestore + Context API (dias 8-17)
> - [sprint-2-dashboard/](./sprint-2-dashboard/README.md) — Dashboard + gráficos + animações Animated (dias 18-27)
> - [sprint-3-transactions/](./sprint-3-transactions/README.md) — Lista + scroll infinito + filtros + form + anexos (dias 28-38)
> - [sprint-4-polish-deploy/](./sprint-4-polish-deploy/README.md) — A11y + EAS Build + README + vídeo demo (dias 39-45)

---

## Objetivo da Fase 3

> "Desenvolver uma aplicação de gerenciamento financeiro, utilizando **React Native** ou Flutter Mobile, com funcionalidades avançadas. A aplicação deve ser capaz de gerenciar transações financeiras, integrando recursos de navegação, segurança, autenticação e armazenamento em cloud."
> — POSTECH Tech Challenge Fase 3 (PDF, p.2)

O escopo **muda de plataforma**: a Fase 2 era web (Next.js + microfrontends); a Fase 3 é um **app mobile nativo**. Isso é um **projeto novo**, não uma evolução incremental. Reaproveitamos o domínio (types, validação Zod, categorias, regras de negócio) e a experiência de UX; reconstruímos toda a camada de UI em React Native e trocamos a persistência para **Firebase**.

## Requisitos da spec

### Funcionais (telas)

| Tela | Requisitos |
| --- | --- |
| **Dashboard** | Gráficos e análises financeiras baseados nas transações do usuário · **animações** de transição entre seções usando **`Animated` (React Native)** |
| **Listagem de transações** | Filtros avançados (data, categoria, etc.) · **scroll infinito** (escolha do time) · busca integrada ao **Cloud Firestore** para o usuário autenticado |
| **Adicionar/Editar transação** | Criar e editar transações · **validação avançada** (valor, categoria) · **upload de recibos** para o **Firebase Storage** |

### Técnicos

- **React Native (Mobile)** com **Expo** (recomendado pela spec p/ navegação, APIs nativas e integração Firebase)
- **Gerenciamento de estado com Context API** (exigência explícita — auth e transações no estado global)
- **Firebase**: Authentication (segurança/auth), **Cloud Firestore** (transações), **Firebase Storage** (recibos)
- **Navegação**, **segurança/autenticação** e **armazenamento em cloud**
- Boas práticas de **performance e usabilidade**

### Entrega

- Código-fonte em repositório Git + **README** com configuração do Firebase, dependências e passos para rodar localmente
- **Vídeo demonstrativo (≤ 5 min)**: login/auth · adicionar/editar transações · visualizar e filtrar · upload de anexos · integração com Firebase

---

## Decisões de stack (ADR resumido)

| Decisão | Escolha | Justificativa |
| --- | --- | --- |
| Plataforma | **React Native + Expo (SDK 54, managed)** | Recomendado pela spec; acelera setup, navegação, APIs nativas e Firebase. Roda em Expo Go no dev, EAS Build p/ artefato |
| Linguagem | **TypeScript** | Boa prática exigida; reaproveita os types do projeto web |
| Navegação | **Expo Router** (file-based, sobre React Navigation) | Padrão moderno; rotas protegidas por grupo `(auth)` / `(app)` |
| **Estado global** | **Context API + `useReducer`** (`AuthContext`, `TransactionContext`) | **Exigência da spec**; contexts encapsulam auth e transações. Sem Redux |
| Backend/cloud | **Firebase** — Auth + Cloud Firestore + Storage | **Exigência da spec** |
| SDK Firebase | **Firebase JS SDK (`firebase`)** + AsyncStorage p/ persistência de auth | Roda em Expo Go sem native build; menor atrito p/ demo. `@react-native-firebase` exigiria Dev Client (avaliado como alternativa) |
| Gráficos | **`react-native-gifted-charts`** (+ `react-native-svg`) | Bonito, declarativo, suportado no Expo; barras/linha/pizza p/ o dashboard |
| Animações | **`Animated` API (React Native)** | **Exigência literal da spec**; transições entre seções do dashboard |
| Formulários | **React Hook Form + Zod** | Reaproveita schema do web; cobre "validação avançada" |
| Seleção de arquivos | **`expo-image-picker`** + **`expo-document-picker`** | Fotos e PDFs de recibos → upload no Storage |
| Testes | **Jest + `@testing-library/react-native`** (preset `jest-expo`) | Testes de unidade/componentes acompanham as features |
| **Documentação do DS** | **Storybook** (`@storybook/react-native`, on-device; build web opcional via `react-native-web`) | Documenta o design system em stories (continuidade da Fase 2). **Chromatic** opcional (free tier) p/ visual review |
| Build/deploy | **EAS Build** (Android APK p/ demo; iOS opcional) | "Cloud build" via Expo Application Services; Firebase é a cloud de dados |
| Lint/format | **ESLint + Prettier** (`eslint-config-expo`) | Consistência; pre-commit com lint-staged |

### Alternativas avaliadas

| Alternativa | Motivo de não escolha |
| --- | --- |
| **Flutter** | Time domina React/TS (Fase 1/2); reaproveita domínio TS. React Native tem curva menor |
| **`@react-native-firebase`** (nativo) | Melhor performance de Storage, mas exige Expo **Dev Client** (não roda em Expo Go) → mais atrito para o time rodar/demonstrar |
| **Redux Toolkit** | A spec pede **Context API** explicitamente; Redux seria contra o requisito avaliado |
| **`victory-native` / Skia** | Mais pesado (Skia + Reanimated); overkill para 3-4 gráficos |

---

## Custos & free tier

Todas as tecnologias **exigidas pelo desafio** e as escolhidas rodam no **nível gratuito** para a escala deste projeto (app de demonstração).

| Ferramenta | Exigida pela spec? | Nível gratuito | Precisa cartão? |
| --- | :---: | --- | :---: |
| React Native · Expo · Expo Go | ✅ | Grátis (open source) | Não |
| TypeScript · Context API | ✅ | Grátis | Não |
| **Firebase Authentication** | ✅ | Spark: Email/Password essencialmente ilimitado | Não |
| **Cloud Firestore** | ✅ | Spark: 1 GiB · 50k leituras / 20k escritas / 20k deletes por dia | Não |
| **Firebase Storage** | ✅ | 5 GB armazenados · 1 GB/dia de download | ⚠️ **Sim** (ver abaixo) |
| Storybook (`@storybook/react-native`) | ➕ (nossa) | Grátis (open source) | Não |
| Chromatic (visual review — opcional) | ➕ | Free tier: ~5.000 snapshots/mês | Não |
| Jest · Testing Library · Maestro | ➕ | Grátis | Não |
| EAS Build | ➕ | Free tier (fila limitada) **ou** build local grátis (`eas build --local` / `expo run:android`) | Não |
| GitHub Actions (CI) | ➕ | Repo público ilimitado; privado 2.000 min/mês | Não |

### Há alguma tecnologia cobrada que não seja gratuita?

**Não para esta escala.** A **única** exigência do desafio com nuance de custo é o **Firebase Storage** (upload de recibos): projetos Firebase **novos** hoje precisam ativar o plano **Blaze** (pay-as-you-go, **cartão obrigatório**) para provisionar o bucket de Cloud Storage — porém o uso permanece **dentro da cota gratuita** (5 GB / 1 GB de download por dia), sem cobrança real numa app de demonstração.

**Mitigação (obrigatória no setup):** ao ativar o Blaze, definir um **orçamento com alerta** no Google Cloud Billing (ex.: alerta em R$ 5) e um limite de gasto. Documentar isso no README. Auth e Firestore continuam no Spark (grátis) sem cartão; só o Storage puxa o Blaze.

---

## O que reaproveitamos do projeto web (Fase 1/2)

Copiar para `src/domain/` no novo repo — é TypeScript puro, agnóstico de plataforma:

- **Types de domínio** — `Transaction`, `TransactionType` (`deposit`/`withdrawal`/`transfer`)
- **Schema de validação Zod** — `transactionFormSchema` (adaptado p/ RHF no RN)
- **Constantes e labels** — categorias, mapas de badge/label de transação
- **`suggestCategory(description)`** — função pura de sugestão de categoria (bônus da spec)
- **Regras de negócio** — `amount` sempre positivo; direção inferida do `type`; transfer é neutro

> UI (componentes `.tsx` com Tailwind, `next/*`), Module Federation, Drizzle/Postgres, NextAuth e Vercel Blob **não são reaproveitados** — são substituídos por RN + Firebase.

---

## Arquitetura alvo (novo repo `bytebank-mobile`)

```
bytebank-mobile/                  ← raiz do novo git repo
├── app/                          ← Expo Router (file-based routing)
│   ├── (auth)/                   ← grupo público: login, register
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (app)/                    ← grupo protegido (requer sessão)
│   │   ├── _layout.tsx           ← tabs: Dashboard | Transações
│   │   ├── index.tsx             ← Dashboard
│   │   ├── transactions/
│   │   │   ├── index.tsx         ← Listagem (scroll infinito + filtros)
│   │   │   └── [id].tsx          ← Detalhe/editar
│   │   └── transactions/new.tsx  ← Nova transação
│   └── _layout.tsx               ← providers + guard de auth
├── src/
│   ├── domain/                   ← types + zod + categorias + suggestCategory (portado do web)
│   ├── services/                 ← firebase.ts, auth.service.ts, transactions.service.ts, storage.service.ts
│   ├── contexts/                 ← AuthContext, TransactionContext
│   ├── hooks/                    ← useInfiniteTransactions, useDashboardData, useTransactionFilters
│   ├── components/
│   │   ├── ui/                   ← Design System (Button, TextField, Card, Chip, charts...) — cada um com .stories.tsx
│   │   └── features/             ← TransactionForm, TransactionItem, FilterSheet, AttachmentPicker...
│   └── theme/                    ← tokens (cores, spacing, typography) + ThemeProvider
├── .storybook/                   ← config do Storybook (design system documentado)
├── .rnstorybook/ ou index stb    ← entry on-device do Storybook (toggle por env)
├── __tests__/                    ← Jest + RNTL
├── assets/                       ← ícones, splash
├── app.json / app.config.ts      ← config Expo + plugins
├── eas.json                      ← perfis de build EAS
├── firestore.rules               ← regras de segurança Firestore
├── storage.rules                 ← regras de segurança Storage
├── .env.example                  ← chaves Firebase (EXPO_PUBLIC_*)
└── README.md
```

### Segurança / auth (fluxo)

`AuthContext` envolve o app no `app/_layout.tsx`. O layout observa `onAuthStateChanged` do Firebase Auth; enquanto `loading`, mostra splash; sem usuário → redireciona p/ `(auth)/login`; com usuário → libera `(app)`. Toda query Firestore/Storage é escopada por `request.auth.uid` via **security rules** (o cliente nunca confia em `userId` do payload).

### Persistência (Firebase)

- **Transações:** coleção `users/{uid}/transactions/{txId}` no Cloud Firestore (subcoleção por usuário simplifica as rules e as queries)
- **Recibos:** `Firebase Storage` em `receipts/{uid}/{txId}/{file}`; a transação guarda a URL de download + path
- **Scroll infinito:** query Firestore com `orderBy('date','desc')` + `limit(N)` + `startAfter(cursor)`

### Estado (Context API — exigência)

- **`AuthContext`** — `user`, `loading`, `signIn`, `signUp`, `signOut` (wrap do Firebase Auth)
- **`TransactionContext`** — `useReducer` com estado da lista/CRUD; ações `create`/`update`/`remove`/`refresh` delegam ao `transactions.service`
- Scroll infinito e agregações do dashboard vivem em **hooks** que consomem os contexts (sem lib de estado servidor — mantém o requisito Context-first)

---

## Roadmap visual

```
Jul                          Ago
18   25       04       14        25   31
[S0]  Foundation (7d)
     [───S1 Auth+Firestore (10d)───]
                       [───S2 Dashboard (10d)───]
                                     [───S3 Transactions (11d)───]
                                                        [S4 Polish+Deploy (7d)]
```

| Sprint | Foco | Dias | Datas |
| --- | --- | --- | --- |
| **0** | Foundation: Expo + Firebase + navegação + tema | 7 | 18/07 → 24/07 |
| **1** | Auth (Firebase) + Firestore + Context API | 10 | 25/07 → 03/08 |
| **2** | Dashboard + gráficos + animações `Animated` | 10 | 04/08 → 13/08 |
| **3** | Transações: scroll infinito + filtros + form + anexos | 11 | 14/08 → 24/08 |
| **4** | A11y + EAS Build + README + vídeo demo | 7 | 25/08 → 31/08 |

**Capacidade total:** 3 devs × 45 dias = 135 dev-days.

---

## Convenções obrigatórias (toda sprint)

1. **Design System first:** componente de UI novo nasce em `src/components/ui/` com tipos, **story `.stories.tsx` no Storybook** e tokens do tema — nunca hard-code de cor/spacing. Todo componente do DS é documentado no Storybook.
2. **Domínio compartilhado:** types, Zod e categorias vivem em `src/domain/` — fonte única de verdade.
3. **Context como estado global:** auth e transações **sempre** via `AuthContext`/`TransactionContext`; sem prop-drilling de sessão.
4. **Firestore só via service:** telas/contexts nunca importam `firebase/firestore` direto — passam pelo `transactions.service`/`storage.service`.
5. **Segurança nas rules:** toda coleção/bucket escopado por `uid`; testar `firestore.rules` (deny cross-user).
6. **Acessibilidade:** todo componente interativo tem `accessibilityLabel`/`accessibilityRole`; contraste AA; navegável por leitor de tela.
7. **Testes acompanham features** — não acumulam para o final.
8. **PR checklist:** tipos ok? teste? tokens do tema? a11y? rules atualizadas (se tocou dados)? base branch `develop`?

## Git Workflow — Fase 3

**Repositório novo.** `main` = estável (releases/tag). `develop` = branch de integração. Durante a fase, features partem de `develop` e PRs apontam para `develop`; `main` recebe o merge final no fim do Sprint 4 (tag `v1.0.0`).

```bash
# criar repo e branches base
git init && git checkout -b main
git commit --allow-empty -m "chore: init"
git checkout -b develop

# feature branch (handles em team-allocation.md)
git checkout develop && git pull
git checkout -b dev1-fb/auth-context
gh pr create --base develop --title "feat(auth): AuthContext + Firebase Auth service"
```

**Convenção de branch:**

- `dev1-fb/<task>` — Track Firebase & Data
- `dev2-ui/<task>` — Track UI & Design System
- `dev3-nav/<task>` — Track Navigation & Integration

**Regras de merge:** PR precisa de 1 reviewer + CI verde (lint + typecheck + test). Rebase diário recomendado.

---

## Riscos & mitigações

| Risco | Mitigação |
| --- | --- |
| Firebase Auth não persiste sessão no RN | `initializeAuth` com `getReactNativePersistence(AsyncStorage)` — validado no Sprint 0 (gate) |
| Upload p/ Storage falha no Expo Go (Blob/Hermes) | Padrão `fetch(uri) → blob → uploadBytesResumable`; testar em device real cedo (Sprint 3, Task 02) |
| `gifted-charts` exige `react-native-linear-gradient` | Usar sem gradiente ou `expo-linear-gradient`; fallback `react-native-chart-kit` se travar |
| Índices compostos do Firestore p/ filtros+orderBy | Criar índices no console cedo; a msg de erro do Firestore dá o link do índice — documentar no README |
| Scroll infinito duplica/pula itens ao recarregar | Cursor por `DocumentSnapshot` + dedupe por `id`; testes do hook |
| Escopo estoura no Sprint 3 (task mais pesada) | Sprint 3 tem 11 dias; Dev 1 (folgado após S3-02) apoia integração; anexos são a última prioridade |
| Time novo em Expo/Firebase | Sprint 0 inclui spike/gate; pair programming nas primeiras integrações |
| Prazo fixo 31/08 sem folga | Buffer embutido no Sprint 4; features "plus" (metas, gráfico extra) só se sobrar tempo |

## Verificação end-to-end (final)

1. `npm install && npx expo start` sobe o app; abre em Expo Go / emulador
2. App abre em `/login`; **registrar** cria usuário no Firebase Auth
3. Login → **Dashboard** com gráficos das transações + **animação** de transição entre seções
4. **Transações** → scroll infinito carrega páginas do Firestore; filtros por data/categoria/tipo + busca funcionam
5. **Nova transação** "Uber" → categoria "Transporte" **sugerida**; validação bloqueia valor inválido/data futura
6. **Anexar recibo** (foto/PDF) → upload p/ Storage → aparece na transação; persiste após reabrir o app
7. **Editar** transação existente → salva no Firestore
8. **Logout** → volta p/ login; sessão de outro usuário não vê dados alheios (rules)
9. `firestore.rules`/`storage.rules` negam acesso cross-user (teste)
10. **EAS Build** (Android) gera APK instalável
11. Testes Jest passam em CI
12. **README** permite a um clone limpo configurar Firebase e rodar
13. **Vídeo demo (≤5 min)** cobre login, add/edit, filtrar, upload, Firebase

## Próximos passos imediatos

- [ ] Criar o repositório `bytebank-mobile` + branches `main`/`develop`
- [ ] Copiar esta pasta `phase-3/` para `docs/phase-3/` no novo repo
- [ ] Criar o projeto no **Firebase Console** (Auth Email/Password, Firestore, Storage) — ver [sprint-0-foundation/02](./sprint-0-foundation/02-firebase-setup.md)
- [ ] Iniciar [Sprint 0](./sprint-0-foundation/README.md); gate no dia 5 (Expo + Firebase Auth persistente rodando em device)

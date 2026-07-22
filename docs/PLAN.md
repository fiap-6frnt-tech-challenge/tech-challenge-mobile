# Tech Challenge — Fase 3 — Plano Geral Revisado (45 dias)

**App:** Bytebank Mobile — gerenciador financeiro em **React Native (Expo)**
**Janela:** 2026-07-18 -> 2026-08-31 (45 dias corridos, ~6.5 semanas) · **prazo final 31/08**
**Time:** **3 desenvolvedores** (3 tracks paralelos — ver [team-allocation.md](./team-allocation.md))
**Repo:** novo repositório Git (`bytebank-mobile`)

> Revisão feita considerando o enunciado do PDF da Fase 3, o projeto web anterior em `/Users/erickpereira/projects/fiap/tech-challenge` e o avanço já feito na branch `navigation-skeleton`.

---

## Objetivo da Fase 3

Desenvolver uma aplicação mobile de gerenciamento financeiro usando **React Native** ou Flutter, com navegação, segurança, autenticação, armazenamento em cloud e funcionalidades avançadas. A escolha do time é **React Native + Expo + Firebase**.

O projeto mobile é novo, mas reaproveita o domínio puro já validado no projeto web. A UI web, Next.js, microfrontends, Drizzle/Postgres, NextAuth e Vercel Blob não são reaproveitados diretamente.

## Requisitos da spec

### Funcionais

| Tela | Requisitos |
| --- | --- |
| **Dashboard** | Gráficos e análises financeiras baseados nas transações do usuário; animações entre seções usando `Animated` |
| **Listagem de transações** | Lista com filtros avançados por data/categoria/tipo; scroll infinito ou paginação; busca integrada ao Cloud Firestore |
| **Adicionar/Editar transação** | Criar e editar transações; validação avançada de valor/categoria; upload de recibos/documentos no Firebase Storage |

### Técnicos

- **React Native Mobile** com **Expo**
- **Context API** para estado global de auth e transações
- **Firebase Authentication**, **Cloud Firestore** e **Firebase Storage**
- Boas práticas de performance e usabilidade
- Código em repositório Git com README de configuração
- Vídeo demonstrativo de até 5 minutos

---

## O que já foi adiantado

A branch `navigation-skeleton` já contém uma base útil para a Sprint 0:

- Grupos Expo Router `(auth)` e `(app)`
- Tabs principais para Dashboard e Transações
- Rotas placeholder para login, cadastro, perfil, adicionar transação e detalhes
- Telas placeholder em `src/screens`
- Componentes iniciais movidos para `src/components`
- Ícones com `lucide-react-native`
- `react-native-svg` instalado, desbloqueando os gráficos da Sprint 2

**Ação do plano:** integrar essa branch no começo da Sprint 0 e tratar a navegação como parcialmente implementada, ainda sem auth guard real.

---

## Decisões de stack

| Decisão | Escolha | Justificativa |
| --- | --- | --- |
| Plataforma | **React Native + Expo managed** | Recomendado pela spec; acelera setup e demo |
| Linguagem | **TypeScript** | Reaproveita domínio e validações do web |
| Navegação | **Expo Router** | Já iniciado em `navigation-skeleton`; boa ergonomia para grupos `(auth)`/`(app)` |
| Estado global | **Context API + `useReducer`** | Exigência explícita da spec |
| Backend/cloud | **Firebase Auth + Firestore + Storage** | Exigência da spec |
| SDK Firebase | **Firebase JS SDK** + AsyncStorage | Menor atrito com Expo Go; Dev Client só se o gate falhar |
| Gráficos | **`react-native-gifted-charts` + `react-native-svg`** | Escopo completo do dashboard mantido |
| Animações | **`Animated` API** | Exigência literal para o dashboard |
| Forms | **React Hook Form + Zod** | Reaproveita schema do web |
| Arquivos | **`expo-image-picker` + `expo-document-picker`** | Fotos e PDFs de recibos |
| Design System | **Componentes RN + Storybook on-device** | Escopo mantido; documentação do DS continua obrigatória |
| Build | **EAS Build Android APK** | Artefato instalável para a entrega |

---

## Reaproveitamento do projeto web

Copiar/adaptar para `src/domain/` na Sprint 0:

- `packages/shared/src/types/transaction.ts`
- `packages/shared/src/schemas/transaction.ts`
- `packages/shared/src/categories.ts`
- `packages/shared/src/constants/transaction.ts`
- `packages/shared/src/lib/transactions.ts`
- `packages/shared/src/lib/suggestCategory.ts`
- testes de domínio correspondentes

Esses arquivos já cobrem:

- `Transaction`, `Attachment`, `TransactionType`
- schema Zod com valor positivo, categoria obrigatória, data não futura, descrição e limite de anexos
- categorias e keywords
- cálculo de saldo
- agregação por mês
- saldo acumulado
- agrupamento por categoria
- sugestão de categoria por descrição

**Importante:** componentes web do design system e dos MFEs servem como referência visual, mas devem ser reimplementados com primitives React Native.

---

## Arquitetura alvo

```txt
bytebank-mobile/
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (app)/
│   │   ├── _layout.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   └── transactions.tsx
│   │   ├── profile.tsx
│   │   ├── transactionAdd.tsx
│   │   └── transactionDetails.tsx
│   └── _layout.tsx
├── src/
│   ├── domain/
│   ├── services/
│   │   ├── firebase.ts
│   │   ├── auth.service.ts
│   │   ├── transactions.service.ts
│   │   └── storage.service.ts
│   ├── contexts/
│   ├── hooks/
│   ├── components/
│   │   ├── ui/
│   │   └── features/
│   ├── screens/
│   └── theme/
├── .storybook/
├── __tests__/
├── firestore.rules
├── storage.rules
├── app.json / app.config.ts
├── eas.json
├── .env.example
└── README.md
```

### Persistência

- Transações: `users/{uid}/transactions/{txId}`
- Recibos: `receipts/{uid}/{txId}/{file}`
- A transação salva metadados do anexo: `id`, `url`, `path`, `name`, `size`, `mimeType`

### Estado global

- `AuthContext`: `user`, `loading`, `signIn`, `signUp`, `signOut`
- `TransactionContext`: estado corrente das transações + ações CRUD
- Hooks especializados:
  - `useDashboardData`
  - `useInfiniteTransactions`
  - `useTransactionFilters`
  - `useAttachments`

---

## Roadmap revisado

```txt
Jul                          Ago
18   25       04       14        25   31
[S0]  Foundation revisada
     [───S1 Auth + CRUD mínimo───]
                       [───S2 Dashboard completo───]
                                     [───S3 Transactions advanced───]
                                                        [S4 Polish+Deploy]
```

| Sprint | Foco | Dias | Datas |
| --- | --- | --- | --- |
| **0** | Integrar `navigation-skeleton`, domínio, Firebase, tema, Storybook, Context skeletons, spikes | 7 | 18/07 -> 24/07 |
| **1** | Auth + Firestore + Context API + CRUD mínimo de transações sem anexos | 10 | 25/07 -> 03/08 |
| **2** | Dashboard completo com KPIs, 3 gráficos, insight e animações `Animated` | 10 | 04/08 -> 13/08 |
| **3** | Scroll infinito, filtros avançados, busca Firestore e anexos Storage integrados | 11 | 14/08 -> 24/08 |
| **4** | A11y, performance, README, EAS APK, vídeo e release | 7 | 25/08 -> 31/08 |

---

## Convenções obrigatórias

1. **Design System first:** componente de UI novo nasce em `src/components/ui/` com tipos, tokens e story no Storybook.
2. **Domínio compartilhado:** regras puras vivem em `src/domain/`, portadas do projeto web.
3. **Context API como estado global:** auth e transações passam por contexts.
4. **Firebase só via services:** telas e contexts não importam Firestore/Storage direto.
5. **Fluxo vertical cedo:** criar/listar/editar transação sem anexos deve funcionar antes do dashboard.
6. **Busca realista no Firestore:** filtros fortes via query; busca textual limitada e documentada.
7. **Spikes de risco cedo:** auth persistence e upload Storage testados antes da Sprint 3.
8. **Acessibilidade contínua:** labels, roles e contraste desde o componente base.
9. **Testes acompanham features:** domínio e reducers primeiro; fluxo crítico depois.

---

## Riscos & mitigações

| Risco | Mitigação |
| --- | --- |
| Branch `navigation-skeleton` divergir da branch de docs | Integrar/rebase no início da Sprint 0 e revisar rotas antes de criar novas telas |
| Auth não persistir sessão no RN | Gate na Sprint 0 com `initializeAuth` + AsyncStorage; fallback Dev Client |
| Upload Storage falhar no Expo Go | Spike na Sprint 0 com imagem/PDF mínimo; fallback documentado |
| Busca textual no Firestore ser limitada | Usar filtros reais por data/categoria/tipo; busca por descrição normalizada/prefixo ou local sobre resultados carregados |
| Dashboard começar sem dados reais | CRUD mínimo obrigatório na Sprint 1 antes da Sprint 2 |
| Sprint 3 ficar sobrecarregada | Form básico já entregue na Sprint 1; Sprint 3 foca filtros/anexos/refino |
| Storage exigir Blaze | Documentar orçamento/alerta no README; uso fica dentro da cota grátis |
| EAS demorar no final | `eas.json` iniciado na Sprint 0; build validado no começo da Sprint 4 |

---

## Verificação end-to-end final

1. `npm install && npx expo start` sobe o app
2. Registro cria usuário no Firebase Auth
3. Login persiste sessão e libera rotas `(app)`
4. Criar transação com validação Zod salva no Firestore
5. Editar transação persiste alterações
6. Dashboard mostra KPIs, gráfico de barras, pizza, linha e insight textual
7. Dashboard anima transições usando `Animated`
8. Lista pagina/rola infinitamente sem duplicar itens
9. Filtros por data, categoria e tipo funcionam
10. Busca integrada ao Firestore funciona conforme estratégia documentada
11. Upload de foto/PDF salva no Storage e referencia a transação
12. Logout retorna ao login e dados cross-user são negados por rules
13. README permite rodar em clone limpo
14. APK Android gerado e testado
15. Vídeo de até 5 minutos cobre todos os requisitos da spec

# Sprint 0 — Foundation

**Duração:** 7 dias · 2026-07-18 → 2026-07-24
**Time:** 3 devs — Dev 1 (Firebase & Data) · Dev 2 (UI & DS) · Dev 3 (Nav & Integration)
**Objetivo:** App Expo bootstrapado em TypeScript, projeto Firebase criado e conectado, navegação com rotas protegidas, tema/tokens, skeletons de Context e CI. Ao fim do sprint o app **roda em device**, conecta ao Firebase e a **sessão de auth persiste** (gate de risco).

> Voltar para o [PLAN.md](../PLAN.md) · Alocação: [team-allocation.md#sprint-0](../team-allocation.md#sprint-0--foundation-7-dias-1807--2407) · Próximo: [Sprint 1](../sprint-1-auth-data/README.md)

---

## Pré-requisitos

- [ ] Repositório `bytebank-mobile` criado com branches `main` e `develop`
- [ ] Conta Google para criar o projeto no Firebase Console
- [ ] Conta Expo (grátis) para EAS
- [ ] Node 20+, `npm`, Expo Go instalado num celular físico (ou emulador Android/iOS)

---

## Ordem de execução

| # | Status | Task | Owner | Duração | Paralela? | Arquivo |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | ⏳ | Bootstrap app Expo (TS + Expo Router + estrutura) | Dev 3 | 1 dia | ✅ dia 1 | [01-bootstrap-expo.md](./01-bootstrap-expo.md) |
| 02 | ⏳ | Setup Firebase (console) + `firebase.ts` + env | Dev 1 | 1 dia | ✅ dia 1 | [02-firebase-setup.md](./02-firebase-setup.md) |
| 03 | ⏳ | Tema + tokens + componentes base **+ Storybook** | Dev 2 | 3 dias | ⬅ 01 | [03-theme-base-components.md](./03-theme-base-components.md) |
| 04 | ⏳ | Navegação (grupos `(auth)`/`(app)`, tabs) | Dev 3 | 1 dia | ⬅ 01 | [04-navigation-skeleton.md](./04-navigation-skeleton.md) |
| 05 | ⏳ | Domínio: portar types + Zod + categorias | Dev 1 | 1 dia | ⬅ 01 | [05-domain-port.md](./05-domain-port.md) |
| 06 | ⏳ | Skeletons de Context (Auth/Transaction) | Dev 3 | 0.5 dia | ⬅ 04 | [06-context-skeletons.md](./06-context-skeletons.md) |
| 07 | ⏳ | CI + init EAS | Dev 1 | 0.5 dia | ⬅ 01 | [07-ci-eas-init.md](./07-ci-eas-init.md) |
| 08 | ⏳ | **Gate** + smoke em device | Todos | 0.5 dia | ⬅ tudo | [08-gate-smoke.md](./08-gate-smoke.md) |

**Legenda:** ✅ mergeada · 🟢 implementada (aguarda merge) · ⏳ pendente

---

## Dependências entre tasks

```
01 (bootstrap) ──┬─→ 03 (tema)
                 ├─→ 04 (navegação) ──→ 06 (context skeletons)
                 ├─→ 05 (domínio)
                 └─→ 07 (CI/EAS)
02 (firebase) ───────────────────────────→ 08 (gate)
todas ───────────────────────────────────→ 08 (gate/smoke)
```

---

## Gate — dia 5

Critério para seguir com a stack escolhida (senão, acionar mitigação):

- [ ] `npx expo start` roda o app em Expo Go num device real
- [ ] `firebase.ts` inicializa Auth + Firestore + Storage sem erro
- [ ] **Auth persiste:** login manual de teste sobrevive a um reload do app (via `getReactNativePersistence(AsyncStorage)`)

**Mitigação se o gate falhar:** se o Firebase JS SDK der problema de persistência/Storage no Expo Go, migrar para **Expo Dev Client + `@react-native-firebase`** (config plugin). Decisão registrada aqui.

---

## Critério de aceite do sprint

- [ ] `npm install && npx expo start` sobe o app; abre em device/emulador
- [ ] Estrutura de pastas do PLAN.md criada (`app/`, `src/{domain,services,contexts,hooks,components,theme}`)
- [ ] Navegação: app abre num placeholder de `(auth)/login`; grupo `(app)` existe com tabs Dashboard/Transações
- [ ] Tema aplica cores/spacing/typography via `useTheme()`; Button/Text/Card renderizam
- [ ] **Storybook roda** (on-device) com stories dos componentes base (Button/Text/Card)
- [ ] `firebase.ts` exporta `auth`, `db`, `storage` inicializados
- [ ] `src/domain/` tem `transaction.ts` (types), `schema.ts` (Zod), `categories.ts`
- [ ] `AuthContext` e `TransactionContext` existem (vazios, com tipos)
- [ ] CI verde (lint + typecheck + test placeholder); `eas.json` criado
- [ ] Gate do dia 5 aprovado

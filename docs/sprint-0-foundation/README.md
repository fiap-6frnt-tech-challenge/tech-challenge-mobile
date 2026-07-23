# Sprint 0 — Foundation Revisada

**Duração:** 7 dias · 2026-07-18 -> 2026-07-24
**Time:** 3 devs — Dev 1 (Firebase & Data) · Dev 2 (UI & DS) · Dev 3 (Nav & Integration)
**Objetivo:** Integrar a branch `navigation-skeleton`, estabilizar a base Expo Router, portar o domínio do projeto web, configurar Firebase, criar tema/Storybook, preparar contexts e validar cedo os riscos de auth persistence e upload Storage.

> Voltar para o [PLAN.md](../PLAN.md) · Alocação: [team-allocation.md#sprint-0](../team-allocation.md#sprint-0--foundation-revisada-7-dias--1807---2407) · Próximo: [Sprint 1](../sprint-1-auth-data/README.md)

---

## Pré-requisitos

- [ ] Branch `navigation-skeleton` revisada
- [ ] Repositório com branches base `main`, `develop` e branch de docs
- [ ] Conta Google para Firebase Console
- [ ] Conta Expo para EAS
- [ ] Node 20+, `npm`, Expo Go ou simulador/emulador funcionando

---

## Trabalho já adiantado em `navigation-skeleton`

- [x] Grupos `(auth)` e `(app)` criados no Expo Router
- [x] Tabs de Dashboard e Transações
- [x] Rotas placeholder de login, cadastro, perfil, adicionar e detalhes
- [x] Screens placeholder em `src/screens`
- [x] Componentes iniciais movidos para `src/components`
- [x] `lucide-react-native` instalado
- [x] `react-native-svg` instalado

Ainda falta transformar esse skeleton em navegação protegida por auth real.

---

## Ordem de execução

| # | Status | Task | Owner | Duração | Paralela? | Arquivo |
| --- | --- | --- | --- | --- | --- | --- |
| 00 | 🟢 | Integrar/rebase da branch `navigation-skeleton` e validar rotas placeholder | Dev 3 | 0.5 dia | primeiro passo | [00-integrate-navigation-skeleton.md](./00-integrate-navigation-skeleton.md) |
| 01 | ⏳ | Bootstrap final: estrutura `src/`, aliases, limpeza de placeholders e deps | Dev 3 | 0.5 dia | ⬅ 00 | [01-bootstrap-expo.md](./01-bootstrap-expo.md) |
| 02 | ⏳ | Setup Firebase (console) + `firebase.ts` + env | Dev 1 | 1 dia | ✅ | [02-firebase-setup.md](./02-firebase-setup.md) |
| 03 | ⏳ | Domínio: portar `packages/shared` do projeto web | Dev 1 | 1 dia | ⬅ 01 | [05-domain-port.md](./05-domain-port.md) |
| 04 | ⏳ | Tema + tokens + componentes base + Storybook | Dev 2 | 3 dias | ⬅ 00, 01 | [03-theme-base-components.md](./03-theme-base-components.md) |
| 05 | ⏳ | Skeletons de Context e providers | Dev 3 | 1 dia | ⬅ 03 | [06-context-skeletons.md](./06-context-skeletons.md) |
| 06 | ⏳ | Spike: auth persistence + upload Storage mínimo | Dev 1 + Dev 3 | 1 dia | ⬅ 02, 05 | [06-risk-spikes.md](./06-risk-spikes.md) |
| 07 | ⏳ | CI + init EAS + gate/smoke | Todos | 1 dia | ⬅ tudo | [07-ci-eas-init.md](./07-ci-eas-init.md), [08-gate-smoke.md](./08-gate-smoke.md) |

**Legenda:** ✅ mergeada · 🟢 adiantada/em integração · ⏳ pendente

---

## Dependências entre tasks

```txt
00 (navigation-skeleton) -> 01 (bootstrap final) -> 03 (domínio) -> 05 (contexts)
00 + 01 -> 04 (tema + Storybook)
02 (Firebase) + 05 -> 06 (spikes)
tudo -> 07 (gate/smoke)
```

---

## Gate — dia 5

Critério para seguir com a stack escolhida:

- [ ] Branch `navigation-skeleton` integrada sem quebrar o app
- [ ] `npx expo start` roda em device/simulator
- [ ] `firebase.ts` inicializa Auth, Firestore e Storage sem erro
- [ ] Auth persistence funciona com AsyncStorage
- [ ] Upload mínimo para Storage funciona com arquivo pequeno
- [ ] Storybook on-device abre com Button/Text/Card
- [ ] Domínio portado passa nos testes unitários principais

**Mitigação:** se Firebase JS SDK falhar em auth persistence ou Storage no Expo Go, registrar a decisão e migrar para Expo Dev Client + `@react-native-firebase`.

---

## Critério de aceite do sprint

- [ ] Rotas `(auth)` e `(app)` do skeleton integradas
- [ ] Tabs Dashboard/Transações renderizam placeholders
- [ ] Tema e tokens aplicados via provider/hook
- [ ] Componentes base com stories no Storybook
- [ ] `src/domain/` contém types, schema Zod, categorias, agregações e `suggestCategory` portados do web
- [ ] `AuthContext` e `TransactionContext` existem com tipos e providers
- [ ] Firebase Auth/Firestore/Storage configurados por env
- [ ] Auth persistence e upload Storage mínimo validados
- [ ] CI e `eas.json` iniciados

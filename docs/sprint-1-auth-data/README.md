# Sprint 1 — Auth + Firestore Data Layer

**Duração:** 10 dias · 2026-07-25 → 2026-08-03
**Time:** 3 devs — Dev 1 (Firebase & Data) · Dev 2 (UI & DS) · Dev 3 (Nav & Integration)
**Objetivo:** Autenticação completa (registrar/login/logout) via **Firebase Auth** exposta pelo `AuthContext`; modelo de dados e **security rules** do Firestore; `TransactionContext` com CRUD real; telas de auth e uma lista básica funcionando ponta-a-ponta.

> Voltar para o [PLAN.md](../PLAN.md) · Alocação: [team-allocation.md#sprint-1](../team-allocation.md#sprint-1--auth--firestore-data-layer-10-dias-2507--0308) · Anterior: [Sprint 0](../sprint-0-foundation/README.md) · Próximo: [Sprint 2](../sprint-2-dashboard/README.md)

---

## Pré-requisitos

- [x] Sprint 0 fechado (Expo + Firebase + navegação + tema + contexts vazios)
- [x] Gate de persistência de auth aprovado
- [ ] Provider Email/Password habilitado no Firebase Console

---

## Ordem de execução

| # | Status | Task | Owner | Duração | Paralela? | Arquivo |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | ⏳ | `auth.service` (signUp/signIn/signOut + persistência) | Dev 1 | 1 dia | ✅ | [01-auth-service.md](./01-auth-service.md) |
| 02 | ⏳ | `AuthContext` (user, loading, ações) | Dev 1 | 1 dia | ⬅ 01 | [02-auth-context.md](./02-auth-context.md) |
| 03 | ⏳ | Modelo Firestore + `firestore.rules` | Dev 1 | 1.5 dia | ✅ | [03-firestore-model-rules.md](./03-firestore-model-rules.md) |
| 04 | ⏳ | `transactions.service` (CRUD Firestore) | Dev 1 | 1.5 dia | ⬅ 03 | [04-transactions-service.md](./04-transactions-service.md) |
| 05 | ⏳ | DS: componentes de formulário | Dev 2 | 2.5 dia | ✅ | [05-ds-form-components.md](./05-ds-form-components.md) |
| 06 | ⏳ | Telas Login + Register (RHF + Zod) | Dev 2 | 2 dias | ⬅ 02, 05 | [06-auth-screens.md](./06-auth-screens.md) |
| 07 | ⏳ | `TransactionContext` (useReducer + service) | Dev 3 | 1.5 dia | ⬅ 04 | [07-transaction-context.md](./07-transaction-context.md) |
| 08 | ⏳ | Wiring de rotas protegidas | Dev 3 | 1 dia | ⬅ 02 | [08-protected-routes.md](./08-protected-routes.md) |
| 09 | ⏳ | Tela lista básica | Dev 3 | 1.5 dia | ⬅ 07 | [09-basic-list-screen.md](./09-basic-list-screen.md) |
| 10 | ⏳ | Testes + smoke + vídeo curto | Todos | 1 dia | ⬅ impl | [10-tests-smoke.md](./10-tests-smoke.md) |

**Legenda:** ✅ mergeada · 🟢 implementada · ⏳ pendente

---

## Dependências entre tasks

```
01 (auth.service) ─→ 02 (AuthContext) ─┬→ 06 (auth screens)
                                        └→ 08 (protected routes)
03 (model+rules) ─→ 04 (tx.service) ─→ 07 (TransactionContext) ─→ 09 (lista básica)
05 (DS forms) ─────────────────────────→ 06 (auth screens)
tudo ─→ 10 (testes/smoke)
```

---

## Critério de aceite do sprint

- [ ] **Registrar** cria usuário no Firebase Auth + doc `users/{uid}` no Firestore
- [ ] **Login** autentica e redireciona p/ `(app)`; **Logout** volta p/ `(auth)/login`
- [ ] Sessão persiste após fechar/reabrir o app
- [ ] `AuthContext` expõe `user`/`loading`/`signIn`/`signUp`/`signOut`
- [ ] `TransactionContext` faz CRUD real no Firestore (create/update/remove/refresh)
- [ ] `firestore.rules`: usuário só lê/escreve `users/{seu-uid}/transactions/*`; cross-user negado
- [ ] Lista básica mostra transações do usuário logado (sem filtros/scroll infinito ainda)
- [ ] Validação de formulários de auth (email válido, senha ≥6) com mensagens pt-BR
- [ ] Testes: auth flow, reducer do TransactionContext, rules deny cross-user

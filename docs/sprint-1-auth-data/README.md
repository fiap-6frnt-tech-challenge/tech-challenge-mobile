# Sprint 1 — Auth + CRUD Mínimo

**Duração:** 10 dias · 2026-07-25 -> 2026-08-03
**Time:** 3 devs — Dev 1 (Firebase & Data) · Dev 2 (UI & DS) · Dev 3 (Nav & Integration)
**Objetivo:** Entregar o primeiro fluxo financeiro ponta-a-ponta: registrar/login/logout, proteger rotas, criar transação, editar transação e listar transações do usuário autenticado usando Firebase, Firestore, Context API e o domínio portado.

> Voltar para o [PLAN.md](../PLAN.md) · Alocação: [team-allocation.md#sprint-1](../team-allocation.md#sprint-1--auth--crud-mínimo-10-dias--2507---0308) · Anterior: [Sprint 0](../sprint-0-foundation/README.md) · Próximo: [Sprint 2](../sprint-2-dashboard/README.md)

---

## Pré-requisitos

- [x] Sprint 0 fechada
- [x] `navigation-skeleton` integrado
- [x] Domínio portado para `src/domain`
- [x] Firebase inicializado
- [ ] Provider Email/Password habilitado no Firebase Console

---

## Ordem de execução

| # | Status | Task | Owner | Duração | Paralela? | Arquivo |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | ⏳ | `auth.service` + persistência | Dev 1 | 1 dia | ✅ | [01-auth-service.md](./01-auth-service.md) |
| 02 | ⏳ | `AuthContext` completo (`user`, `loading`, ações) | Dev 1 | 1 dia | ⬅ 01 | [02-auth-context.md](./02-auth-context.md) |
| 03 | ⏳ | Modelo Firestore + `firestore.rules` | Dev 1 | 1.5 dia | ✅ | [03-firestore-model-rules.md](./03-firestore-model-rules.md) |
| 04 | ⏳ | `transactions.service` CRUD sem anexos | Dev 1 | 1.5 dia | ⬅ 03 | [04-transactions-service.md](./04-transactions-service.md) |
| 05 | ⏳ | DS: form components + stories | Dev 2 | 2.5 dias | ✅ | [05-ds-form-components.md](./05-ds-form-components.md) |
| 06 | ⏳ | Telas Login + Register | Dev 2 | 1.5 dia | ⬅ 02, 05 | [06-auth-screens.md](./06-auth-screens.md) |
| 07 | ⏳ | Guard de rotas sobre `(auth)`/`(app)` | Dev 3 | 1 dia | ⬅ 02 | [08-protected-routes.md](./08-protected-routes.md) |
| 08 | ⏳ | `TransactionContext` com reducer + service | Dev 3 | 1.5 dia | ⬅ 04 | [07-transaction-context.md](./07-transaction-context.md) |
| 09 | ⏳ | Form Add/Edit sem anexos com Zod + sugestão de categoria | Dev 2 + Dev 3 | 2 dias | ⬅ 05, 08 | [09-minimal-add-edit-form.md](./09-minimal-add-edit-form.md) |
| 10 | ⏳ | Lista básica do usuário autenticado | Dev 3 | 1 dia | ⬅ 08 | [09-basic-list-screen.md](./09-basic-list-screen.md) |
| 11 | ⏳ | Testes + smoke login -> criar -> editar -> listar | Todos | 1 dia | ⬅ impl | [10-tests-smoke.md](./10-tests-smoke.md) |

**Legenda:** ✅ mergeada · 🟢 implementada · ⏳ pendente

---

## Dependências entre tasks

```txt
01 (auth.service) -> 02 (AuthContext) -> 07 (guards)
02 + 05 -> 06 (auth screens)
03 (rules/model) -> 04 (tx.service) -> 08 (TransactionContext)
05 + 08 -> 09 (Add/Edit sem anexos)
08 -> 10 (lista básica)
tudo -> 11 (testes/smoke)
```

---

## Decisão de escopo da Sprint 1

Esta sprint entrega **Add/Edit sem anexos** de propósito. O upload foi validado como spike na Sprint 0, mas a integração final com Storage fica para a Sprint 3. Isso permite que o dashboard da Sprint 2 use dados reais do usuário e evita começar gráficos em cima de mock.

---

## Critério de aceite do sprint

- [ ] Registrar cria usuário no Firebase Auth
- [ ] Login autentica e redireciona para `(app)`
- [ ] Logout retorna para `(auth)/login`
- [ ] Sessão persiste após fechar/reabrir o app
- [ ] Rotas `(app)` ficam bloqueadas sem sessão
- [ ] `firestore.rules` restringe `users/{uid}/transactions/*`
- [ ] `TransactionContext` cria, edita, remove e recarrega transações
- [ ] Form Add/Edit valida valor positivo, categoria obrigatória, data não futura e descrição
- [ ] `suggestCategory("Uber")` sugere Transporte no formulário
- [ ] Lista básica mostra somente transações do usuário autenticado
- [ ] Testes cobrem auth, reducer, schema e rules cross-user

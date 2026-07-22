# Task 10 — Testes + smoke + vídeo curto

| | |
| --- | --- |
| **Sprint** | [Sprint 1](./README.md) |
| **Owner** | Todos |
| **Duração** | 1 dia |
| **Branch** | `dev*/tests-s1` |
| **Depende de** | Tasks 01-09 |

---

## Contexto

Consolida testes da sprint e valida o fluxo auth + dados ponta-a-ponta em device.

## Testes (Jest + RNTL)

- **auth flow:** `AuthContext` — `signIn` popula `user`; `signOut` limpa (Firebase mockado)
- **reducer** do `TransactionContext`: `LOADING`/`LOADED`/`ERROR`
- **rules:** teste com `@firebase/rules-unit-testing` — usuário A **não** lê `users/{B}/transactions`
- **authSchema** Zod: email inválido, senha curta, senhas não conferem

## Smoke (device real)

1. Registrar novo usuário → entra no app
2. Fechar/reabrir app → continua logado (persistência)
3. Criar transação (via form provisório ou script) → aparece na lista
4. Pull-to-refresh atualiza
5. Logout → volta p/ login; login com 2º usuário não vê dados do 1º

## Vídeo curto (≤2 min)

Registrar → login → lista → logout. Serve de checkpoint interno e rascunho do vídeo final.

## Validação

- [ ] Todos os testes passam em CI
- [ ] Roteiro de smoke ✅ em Android e iOS (ou Android + emulador)
- [ ] Cross-user negado confirmado

# Task 12 — Testes + smoke + vídeo 4 min

| | |
| --- | --- |
| **Sprint** | [Sprint 3](./README.md) |
| **Owner** | Todos |
| **Duração** | 1 dia |
| **Branch** | `dev*/tests-s3` |
| **Depende de** | Tasks 01-11 |

---

## Testes

- **`listPaged`:** cursor traz próxima página sem repetir; filtros aplicam; `hasMore` correto (Firestore emulador ou mock)
- **`useInfiniteTransactions`:** acumula + dedupe; reset ao mudar filtro
- **`suggestCategory`:** ≥20 casos (já em S0/03)
- **`transactionFormSchema`:** pos/neg/edge (valor, categoria, data futura, ≤5 anexos)
- **`storage.service`:** rejeita >5MB e tipo inválido (mock)
- **rules:** `storage.rules` nega cross-user

## Smoke (device real — obrigatório p/ anexos)

1. Lista com muitos itens → rolar carrega mais (scroll infinito)
2. Filtrar por data + categoria + tipo; buscar por descrição
3. Nova transação "Uber" → categoria "Transporte" sugerida → salvar
4. Editar a transação → alterar valor → salvar
5. Anexar foto (câmera) e PDF → progresso → aparece
6. Fechar/reabrir app → anexo persiste
7. Remover anexo → some do Storage
8. Validação: valor 0 e data futura bloqueados

## Vídeo (≤4 min)

Rascunho do vídeo final: lista+scroll, filtros, add/edit com sugestão, upload de anexo.

## Validação

- [ ] Testes verdes em CI
- [ ] Smoke ✅ em **device real** (Android + iOS se possível)
- [ ] Anexos persistem e removem corretamente

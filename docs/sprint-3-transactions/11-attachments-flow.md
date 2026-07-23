# Task 11 — Fluxo de anexos (picker → Storage → Firestore)

| | |
| --- | --- |
| **Sprint** | [Sprint 3](./README.md) |
| **Owner** | Dev 3 (Nav & Integration) |
| **Duração** | 1.5 dia |
| **Branch** | `dev3-nav/attachments-flow` |
| **Depende de** | Task 02 (storage.service), Task 04 (AttachmentPicker), Task 05 (AttachmentList) |
| **Desbloqueia** | requisito de upload de recibos |

---

## Contexto

Fecha o requisito "Upload de Recibos → Firebase Storage". Liga o picker ao `storage.service` e persiste a referência no doc da transação.

## Fluxo

1. No `TransactionForm`, `AttachmentPicker` retorna `{ uri, name, contentType, size }`
2. Chamar `uploadReceipt(uid, txId, uri, name, contentType, onProgress)` → mostra progresso no `AttachmentList`
3. Ao concluir, guardar `{ id, name, url, path, size, contentType }` no array `attachments` da transação (Firestore)
4. Remover: `deleteReceipt(path)` + tirar do array

**Ordem txId:** para transação **nova**, criar o doc primeiro (obter `txId`) e então subir anexos para `receipts/{uid}/{txId}/...`; ou usar um id temporário e mover. Recomendado: salvar a transação → obter id → subir anexos → `update` com o array. Para **edição**, o `txId` já existe.

## Validação

- [ ] Anexar foto (câmera e galeria) sobe p/ Storage
- [ ] Anexar PDF sobe p/ Storage
- [ ] Barra de progresso durante upload
- [ ] Anexo aparece na transação e **persiste após reabrir o app**
- [ ] Remover apaga do Storage **e** do Firestore
- [ ] >5MB / tipo inválido bloqueado com mensagem
- [ ] Limite de 5 anexos respeitado (Zod)

## Gotchas

1. **`txId` antes do upload:** decidir criar o doc primeiro. Evita anexos órfãos sem transação.
2. **Anexos órfãos:** se o upload concluir mas o `update` do Firestore falhar, agendar limpeza (ou só logar) — documentar.
3. **Testar em device real** (não só emulador) — é onde o blob/upload costuma falhar (risco #2).
4. Cancelar o form após upload deve limpar os anexos já enviados (ou avisar) p/ não deixar lixo no Storage.

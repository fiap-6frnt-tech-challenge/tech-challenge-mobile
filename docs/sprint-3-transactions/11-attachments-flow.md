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

Executada em 25/08/2026 — emulador Pixel_7a (Android 16), conta `Dev`, branch `phase-3`.

- [x] Anexar foto (câmera e galeria) sobe p/ Storage — galeria e câmera testadas; a câmera pede permissão e sobe direto
- [x] Anexar PDF sobe p/ Storage — via "Escolher arquivo"; o SAF já filtra tipo, `invalido.txt` nem aparece na lista
- [x] Barra de progresso durante upload — nos dois caminhos: fila + `commit` (transação nova) e upload imediato (transação existente)
- [x] Anexo aparece na transação e **persiste após reabrir o app** — reprovou na primeira rodada (o dado persistia, a tela não exibia); revalidado após a correção do bug #1
- [x] Remover apaga do Storage **e** do Firestore — Firestore confirmado ponta a ponta; Storage inferido da ordem do `await` em `removeAttachment` (`deleteReceipt` resolve antes do `update`) + `storage.service.test.ts`
- [x] >5MB / tipo inválido bloqueado com mensagem — JPG de 6,99 MB recusado com "Arquivo excede o limite de 5 MB." e não entra na lista
- [x] Limite de 5 anexos respeitado (Zod) — coberto por `useAttachments.test.tsx`; **não** exercitado na UI

Suíte automatizada: 19 testes passando (`useAttachments.test.tsx` + `storage.service.test.ts`).

### Bugs encontrados

1. **~~`refresh()` falha no cold start e engole o erro~~ — corrigido.** O `catch {}` vazio escondia o erro real, que era `Transaction list request timed out`: `list()` usava `getDocsFromServer` com teto de 10s, e no cold start o canal do Firestore e o token de auth ainda não estão prontos. Como `getFirestore` não configura persistência, o cache é só em memória e nasce vazio a cada boot — a leitura forçada não tinha como responder a tempo. Um cronômetro fixo era a abordagem errada para "não girar para sempre": trocado por `onSnapshot` (`transactions.service.ts`), que entrega assim que há dado e reporta falha real via `onError`. De quebra, `create`/`update`/`remove` deixaram de disparar um re-read da coleção inteira.
2. **~~Detalhes não distingue falha de carga de registro inexistente~~ — corrigido.** A tela agora lê `error` do contexto e oferece "Tentar novamente", em vez de afirmar que a transação não existe.
3. **~~Nome do anexo se perde nos pickers de imagem~~ — corrigido.** Captura de câmera não tem nome de origem, então passa a gerar `recibo-AAAAMMDD-HHMMSS.jpg`; nome vindo da galeria só é descartado quando não é descritivo (o id do MediaStore, `34.jpg`). "Escolher arquivo" segue preservando o nome real.

### Não verificado

- **Device real** — só emulador. O gotcha #3 pede explicitamente, e é onde o blob/upload costuma falhar.
- **Objeto removido do Storage** — sem acesso ao console do Firebase; ver método usado no item 5.
- **Gotcha #4** — cancelar o form após upload não foi testado.

> Ficou na conta `Dev` a transação de teste "Teste anexo task 11" (R$ 123,45, 26/08/2026) com 2 anexos.

## Gotchas

1. **`txId` antes do upload:** decidir criar o doc primeiro. Evita anexos órfãos sem transação.
2. **Anexos órfãos:** se o upload concluir mas o `update` do Firestore falhar, agendar limpeza (ou só logar) — documentar.
3. **Testar em device real** (não só emulador) — é onde o blob/upload costuma falhar (risco #2).
4. Cancelar o form após upload deve limpar os anexos já enviados (ou avisar) p/ não deixar lixo no Storage.

# Task 11 — Excluir Transação (extra, fora do plano original)

| | |
| --- | --- |
| **Sprint** | [Sprint 1](./README.md) |
| **Owner** | Extra — implementado junto da Task 09 |
| **Duração** | 0.5 dia |
| **Branch** | `phase-3` |
| **Depende de** | Task 08 (`TransactionContext`), Task 09 (tela de detalhe) |
| **Desbloqueia** | — |

---

## Contexto

Nenhuma task do plano cobria excluir uma **transação**: `transactionsService.remove` (Task 04) e
`TransactionContext.remove` (Task 08) existiam e o critério de aceite da Sprint 1 cita "cria, edita,
remove e recarrega", mas nenhuma tela chamava `remove` — o `useTransactions()` da lista até
desestruturava `remove` sem usar. A `10-remove-attachment.md` da Sprint 3 é sobre **anexo**, não
sobre a transação.

Como a tela de detalhe/edição chegou na Task 09, a exclusão entrou nela: é onde o usuário já está
com a transação aberta e onde o `id` está disponível.

## Implementação

1. `TransactionForm` ganhou um prop opcional `footer?: ReactNode`, renderizado abaixo do botão de
   submit e dentro do mesmo `ScrollView` (a tela de adicionar não passa nada).
2. `TransactionDetailsScreen` passa no `footer` um `Button` "Excluir transação" (`variant="secondary"`).
3. Confirmação com `Alert.alert` nativo — "Excluir transação / Essa ação não pode ser desfeita." com
   Cancelar (`style: 'cancel'`) e Excluir (`style: 'destructive'`).
4. Confirmado: `remove(id)` do `TransactionContext` (que delega ao service e dá `refresh`), depois
   volta para a lista com o mesmo `router.canGoBack()` do save.
5. Falha mostra erro inline com `accessibilityLiveRegion="polite"`, sem sair da tela.

## Validação

- [x] Botão aparece só no detalhe/edição, não na tela de adicionar
- [x] Cancelar no diálogo não apaga nada
- [x] Confirmar apaga e volta para a lista já sem o item
- [x] Lista reflete a exclusão via `refresh` do context (leitura do Firestore)
- [x] Enquanto exclui, o botão fica em `loading`

> Verificado no emulador Android em 2026-08-11, excluindo a transação de teste criada no smoke da
> Task 09.

## Gotchas

1. Depois do `remove`, o `refresh` do context tira o item de `items` e o `find` da tela devolve
   `undefined` — sem cuidado, a tela pisca "Transação não encontrada" antes de navegar. Por isso o
   estado `deleting` mantém o spinner nesse intervalo.
2. `deleting` só volta para `false` no erro; no sucesso a tela está saindo de cena.
3. Excluir anexos junto (Storage) é assunto da S3-10/S3-11 — aqui a transação ainda não tem anexo.

# Task 10 — Remover Anexo com Consistência

## Contexto

Ao remover um recibo, o app precisa apagar o arquivo do Firebase Storage e atualizar a transação no Firestore. A remoção deve evitar anexos órfãos e também não deixar a transação apontando para arquivo inexistente.

## Implementação

1. Garantir que cada anexo salve `path` além de `url`.
2. Criar método `deleteReceipt(path)` em `storage.service`.
3. Criar ação no `TransactionContext` para remover anexo da transação.
4. Executar remoção em ordem segura:
   - remover arquivo do Storage;
   - atualizar array de anexos no Firestore;
   - atualizar estado local.
5. Tratar erro parcial com mensagem clara e opção de tentar novamente.

## Validação

- [ ] Remover anexo apaga arquivo do Storage
- [ ] Firestore deixa de listar o anexo
- [ ] UI atualiza sem reload completo
- [ ] Erro de permissão aparece de forma compreensível
- [ ] Usuário não consegue remover anexo de outro usuário

## Gotchas

- Não depender apenas da URL pública para apagar; usar `path`.
- Se o Firestore falhar após apagar do Storage, informar o usuário e permitir refresh.
- Security rules devem validar `uid` no caminho.

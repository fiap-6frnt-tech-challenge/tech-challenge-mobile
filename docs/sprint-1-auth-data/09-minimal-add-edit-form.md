# Task 09 — Form Add/Edit Sem Anexos

## Contexto

O dashboard da Sprint 2 precisa consumir dados reais. Por isso, o fluxo de adicionar e editar transações entra na Sprint 1, ainda sem anexos.

## Implementação

1. Criar componente `TransactionForm` em `src/components/features`.
2. Usar React Hook Form + Zod com o schema portado para `src/domain`.
3. Integrar campos:
   - tipo
   - categoria
   - valor
   - data
   - descrição
4. Integrar `suggestCategory(description)` como sugestão editável.
5. Criar tela de nova transação em `transactionAdd`.
6. Criar tela de detalhe/edição em `transactionDetails`.
7. Salvar via `TransactionContext`, que delega para `transactions.service`.
8. Navegar de volta para lista após salvar.

## Validação

- [ ] Valor inválido é bloqueado
- [ ] Categoria obrigatória é validada
- [ ] Data futura é bloqueada
- [ ] Descrição menor que 3 caracteres é bloqueada
- [ ] Criar transação persiste no Firestore
- [ ] Editar transação persiste no Firestore
- [ ] Sugestão de categoria aparece para descrições conhecidas

## Gotchas

- Não implementar anexos nesta task.
- Não importar Firebase direto no formulário.
- `amount` deve permanecer positivo; direção vem do `type`.

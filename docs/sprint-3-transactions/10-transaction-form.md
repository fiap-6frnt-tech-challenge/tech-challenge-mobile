# Task 10 — Form Add/Edit + validação + sugestão

| | |
| --- | --- |
| **Sprint** | [Sprint 3](./README.md) |
| **Owner** | Dev 3 (Nav & Integration) |
| **Duração** | 1.5 dia |
| **Branch** | `dev3-nav/transaction-form` |
| **Depende de** | Task 04 (DS), Task 06 (Zod) |
| **Desbloqueia** | Task 11 (anexos no form) |

---

## Contexto

Tela única de adicionar/editar transação (requisito da spec). Reutiliza o form entre `new` e `[id]`. Validação avançada (Zod) + sugestão automática de categoria.

## Implementação

`src/components/features/TransactionForm.tsx` consumido por:

- `app/(app)/transactions/new.tsx` — modo criar
- `app/(app)/transactions/[id].tsx` — modo editar (prefill via `transactionsService` / item da lista)

```tsx
const { control, handleSubmit, watch, setValue } = useForm({
  resolver: zodResolver(transactionFormSchema),
  defaultValues: initial ?? { type: 'withdrawal', date: new Date().toISOString(), ... },
});

// sugestão automática ao digitar descrição
const description = watch('description');
useEffect(() => {
  if (!touchedCategory) {
    const s = suggestCategory(description);
    if (s) setValue('category', s);   // usuário pode sobrescrever
  }
}, [description]);

const onSubmit = async (data) => {
  if (mode === 'edit') await update(id, data);
  else await create(data);
  router.back();
};
```

Campos: tipo (SegmentedControl), valor (`CurrencyInput`), categoria (`Select` com badge "Sugerido"), data (`DatePicker`), descrição (`TextField`), anexos (Task 11).

## Validação

- [ ] Criar transação persiste no Firestore e aparece na lista/dashboard
- [ ] Editar prefila os campos e salva alterações
- [ ] Validação bloqueia submit inválido com mensagens pt-BR
- [ ] Digitar "Uber" preenche categoria "Transporte" (sobrescrevível)
- [ ] Após salvar, `refresh` da lista e do dashboard reflete a mudança

## Gotchas

1. **Sugestão só enquanto o usuário não mexeu na categoria** (`touchedCategory`) — senão sobrescreve a escolha manual a cada tecla.
2. Ao editar, não re-sugerir por cima do valor salvo.
3. Depois de `create`/`update`, invalidar tanto o `useInfiniteTransactions` (lista) quanto o `TransactionContext` (dashboard) — chamar os dois `refresh`.

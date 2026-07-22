# Task 06 — Validação Zod avançada

| | |
| --- | --- |
| **Sprint** | [Sprint 3](./README.md) |
| **Owner** | Dev 2 (UI & DS) |
| **Duração** | 0.5 dia |
| **Branch** | `dev2-ui/zod-advanced` |
| **Depende de** | Task 03 (suggestCategory / shape de categoria) |
| **Desbloqueia** | Task 10 (form) |

---

## Contexto

Evolui o `transactionFormSchema` (S0-05) para a "validação avançada" exigida pela spec: valor e categoria são os campos citados explicitamente.

## Implementação

`src/domain/schema.ts`:

```ts
export const transactionFormSchema = z.object({
  type: z.enum(['deposit', 'withdrawal', 'transfer'], { message: 'Selecione o tipo' }),
  amount: z.number({ message: 'Informe um valor' })
    .positive('Valor deve ser maior que zero')
    .max(1_000_000, 'Valor muito alto'),
  category: z.string().min(1, 'Selecione uma categoria'),
  date: z.string().refine((d) => new Date(d) <= new Date(), 'Data não pode ser futura'),
  description: z.string().min(3, 'Mínimo 3 caracteres').max(140, 'Máximo 140 caracteres'),
  attachments: z.array(attachmentSchema).max(5, 'Máximo 5 anexos').optional(),
});
```

Mensagens em pt-BR. `attachmentSchema` valida `{ name, url, path, size, contentType }`.

## Validação

- [ ] Valor ≤0 rejeitado; categoria vazia rejeitada
- [ ] Data futura rejeitada
- [ ] Descrição <3 ou >140 rejeitada
- [ ] >5 anexos rejeitado
- [ ] Testes pos/neg/edge do schema

## Gotchas

1. **Zod v4**: mensagem vai em `{ message }` (não `errorMap`/`invalid_type_error` da v3). Alinhar com a versão instalada.
2. `amount` como `number` — o `CurrencyInput` (S1-05) já entrega number ao form.

# Task 03 — `suggestCategory` integrado + testes

| | |
| --- | --- |
| **Sprint** | [Sprint 3](./README.md) |
| **Owner** | Dev 1 (Firebase & Data) |
| **Duração** | 0.5 dia |
| **Branch** | `dev1-fb/suggest-category` |
| **Depende de** | S0-05 (domínio portado) |
| **Desbloqueia** | Task 06 (Zod), Task 10 (form) |

---

## Contexto

`suggestCategory(description)` já foi portado na S0-05. Aqui garantimos cobertura de teste e o formato de retorno esperado pelo form (`CategoryId | null`), incluindo o bônus de "sugestão automática de categorias" da spec.

## Implementação

- Revisar as regras de keyword → categoria em `src/domain/suggestCategory.ts`
- Cobrir pt-BR: "uber/99/gasolina" → transporte; "mercado/ifood/restaurante" → alimentação; "salário/pagamento" → salário/receita; "aluguel/luz/água" → moradia; etc.
- Retornar `null` quando nada casa (não força categoria errada)

## Validação

- [ ] ≥20 casos de teste passam
- [ ] Case-insensitive e ignora acentos
- [ ] Sem match → `null`
- [ ] Retorno é `CategoryId` válido (existe em `categories.ts`)

## Gotchas

1. **Normalizar acentos** antes de casar (`normalize('NFD')`) — "salário" e "salario".
2. Sugestão é **palpite**: o usuário sempre pode sobrescrever no `CategorySelect` (Task 10).

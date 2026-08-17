# Task 08 — Testes + smoke ✅

| | |
| --- | --- |
| **Sprint** | [Sprint 2](./README.md) |
| **Owner** | Todos |
| **Duração** | 1 dia |
| **Branch** | `dev*/tests-s2` |
| **Depende de** | Tasks 01-07 |

---

## Testes

- **Agregações (Task 01):** ≥10 casos — `balance` ignora transfer; `byMonth` preenche meses vazios; `topCategory`; lista vazia → zeros/`null`
- **`useDashboardData`:** dado `items` mockado, retorna séries corretas + `isEmpty`
- **Render dos gráficos:** montam sem crash com fixture (RNTL); KPIs mostram valor formatado
- **Formatação BRL:** helper testado

### Cobertura automatizada

Os cenários da task ficam em:

- `src/domain/aggregations.test.ts`
- `src/hooks/useDashboardData.test.tsx`
- `src/components/ui/charts/charts.test.tsx`
- `src/components/ui/KpiCard.test.tsx`
- `src/components/ui/currency.test.ts`

Executar com:

```bash
npm test
```

## Smoke (device)

1. Login com usuário que tem transações → dashboard com gráficos corretos
2. Animação de entrada em cascata visível
3. Alternar seção anima
4. Pull-to-refresh recalcula
5. Usuário sem transações → estado vazio
6. Criar transação (via lista) → voltar ao dashboard → gráficos atualizam

## Validação

- [X] Testes verdes em CI
- [X] Smoke ✅ em device
- [X] Performance ok com ~100 transações (sem travar animação/scroll)

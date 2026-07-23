# Task 05 — DS: componentes de formulário

| | |
| --- | --- |
| **Sprint** | [Sprint 1](./README.md) |
| **Owner** | Dev 2 (UI & DS) |
| **Duração** | 2.5 dias |
| **Branch** | `dev2-ui/ds-form-components` |
| **Depende de** | S0-03 (tema) |
| **Desbloqueia** | Task 06 (auth screens), forms do Sprint 3 |

---

## Contexto

Componentes de formulário reutilizáveis, integráveis com React Hook Form via `Controller`. Servem auth (S1) e o form de transação (S3).

## Componentes (`src/components/ui/`)

- **`TextField`** — label, placeholder, `error`, `secureTextEntry`, `keyboardType`; `accessibilityLabel` + estado de erro anunciado.
- **`CurrencyInput`** — máscara de moeda BRL; retorna `number`; teclado numérico.
- **`Select`** — bottom-sheet/modal de opções (base do `CategorySelect` do S3).
- **`DatePicker`** — usa `@react-native-community/datetimepicker` (`npx expo install`); não permite data futura (validação no schema).
- **`Button`** (estados) — já existe da S0-03; revisar `loading`/`disabled`.

Todos aceitam serem controlados por RHF `Controller` (`value`/`onChangeText`/`onBlur`). **Cada componente entra com `.stories.tsx`** cobrindo os estados relevantes (normal, erro, disabled).

## Validação

- [ ] `TextField` mostra `error` abaixo do campo e muda a borda
- [ ] `CurrencyInput` formata `1234.5` → `R$ 1.234,50` e devolve `number`
- [ ] `DatePicker` abre o picker nativo e retorna ISO
- [ ] Todos navegáveis por teclado externo/leitor de tela (`accessibilityLabel`)
- [ ] Stories no Storybook para cada componente (estados normal/erro/disabled)

## Gotchas

1. **`datetimepicker`** tem APIs diferentes em Android (dialog) e iOS (inline/spinner) — encapsular a diferença no componente.
2. `CurrencyInput`: guardar o valor numérico no estado do form, formatar só na exibição (evita bug de cursor).
3. Erro deve ter `accessibilityLiveRegion="polite"` (Android) p/ ser anunciado.

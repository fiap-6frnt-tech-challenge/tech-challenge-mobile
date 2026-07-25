# Task 03 — Tema + tokens + componentes base + Storybook

|                        |                                                                             |
| ---------------------- | --------------------------------------------------------------------------- |
| **Sprint**             | [Sprint 0 — Foundation](./README.md)                                        |
| **Owner**              | Dev 2 (UI & DS)                                                             |
| **Duração estimada**   | 3 dias                                                                      |
| **Branch recomendada** | `dev2-ui/theme-base-components`                                             |
| **Depende de**         | [Task 01](./01-bootstrap-expo.md)                                           |
| **PR só abre**         | Após Button/Text/Card renderizarem e o Storybook abrir com as stories deles |

---

## Dependências

- **Bloqueia esta task:** Task 01 (bootstrap).
- **Esta task desbloqueia:** todas as telas (Sprints 1-3), os componentes de formulário/gráfico e a **documentação em Storybook** de todo o DS.

---

## Contexto

Fundação visual do Design System em React Native + a infraestrutura de **documentação (Storybook)**. Tokens de cor/spacing/typography num tema central, expostos por `useTheme()`, os 3 átomos mais usados, e o Storybook configurado para que daqui em diante **todo componente do DS nasça com sua story**. Espelha a identidade Bytebank (roxo/verde) e a prática de design system da Fase 2.

---

## Implementação

### 1. Tokens — `src/theme/tokens.ts`

```ts
export const colors = {
  // valores realinhados com a paleta do projeto web (Fase 2) — ver src/theme/tokens.ts
  primary: '#6841f2',
  primaryHover: '#5a35d1',
  brandDark: '#000b34',
  background: '#f3f3f3',
  surface: '#ffffff',
  surfaceHover: '#f8f8f8',
  text: '#000b34',
  textSecondary: '#5c6070',
  textInverse: '#ffffff',
  textOnBg: '#f3f3f3',
  danger: '#b53418',
  success: '#107e3e',
  border: '#c2c2c2',
  borderFocus: '#6841f2',
  iconDefault: '#000b34',
  iconSecondary: '#5c6070',
  iconAccent: '#b53418',
  placeholder: '#5c6070',
  badgeTransferBg: 'rgba(104, 65, 242, 0.1)',
  badgeTransferText: '#6841f2',
  badgeWithdrawBg: 'rgba(242, 72, 34, 0.1)',
  badgeWithdrawText: '#b53418',
  badgeDepositBg: 'rgba(31, 228, 113, 0.1)',
  badgeDepositText: '#0d7a3e',
  chartBrand: '#6841f2',
  chartBlue: '#0098f4',
  chartPink: '#ec4899',
  chartOrange: '#f97316',
  chartGreen: '#1cc060',
  chartRed: '#ff3631',
};
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 };
export const radius = { default: 8 };
export const typography = {
  h1: { fontSize: 25, fontWeight: '700' as const },
  h2: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
};
```

> Paleta, spacing e radius foram realinhados com os design tokens do projeto web da Fase 2 (`--color-*`, `--spacing-*`, `--radius-default` em rem, convertidos para px). `radius` ficou com um único valor (`default: 8`) porque o projeto antigo usa o mesmo raio para cards, badges, inputs e botões — sem variante `pill`. Cores de badge/chart foram trazidas 1:1 para permitir telas de extrato e gráficos futuros sem introduzir literais fora de `tokens.ts`.

### 2. `ThemeProvider` + `useTheme` — `src/theme/index.tsx`

Context leve que expõe `{ colors, spacing, radius, typography }`. Montado no root layout (Task 04). (Suporte a dark mode fica como plus.)

### 3. Componentes base — `src/components/ui/`

- **`Button`** — variantes `primary`/`secondary`/`tertiary`, estados `loading`/`disabled`, `accessibilityRole="button"` + `accessibilityLabel`.
- **`Text`** — wrapper tipográfico (`variant="h1|h2|body|caption"`).
- **`Card`** — `surface` + `radius.default` + sombra sutil.

Cada componente: arquivo próprio + tipos + **`.stories.tsx`** + tokens via `useTheme()`. Sem cor/spacing hard-coded.

### 4. Storybook (documentação do DS)

```bash
npx storybook@latest init --type react_native
# instala @storybook/react-native + addons on-device
```

> Implementado: `npx storybook@latest init --type react_native --yes --no-dev --disable-telemetry`. A versão instalada (storybook 10.5.x) gera a config em `.rnstorybook/`, não `.storybook/` como o texto abaixo sugere.

- Configuração em `.rnstorybook/` (`main.ts`, `preview.tsx`, `index.ts`) e entry on-device do Storybook.
- **Toggle por env** para alternar app ↔ Storybook (ex.: `EXPO_PUBLIC_STORYBOOK=true` no `App`/root escolhe renderizar o `StorybookUIRoot`). Assim o mesmo projeto Expo abre o app normal ou o catálogo de componentes.

  > Implementado com uma diferença importante do exemplo do doc: como o projeto usa **Expo Router** (não um `App.tsx` bare), não dá pra simplesmente trocar o export do root. A abordagem que funcionou (confirmada no README oficial do `@storybook/react-native`, seção "Expo router specific setup"): rota dedicada `app/storybook.tsx` (`export { default } from '../.rnstorybook'`) + `.rnstorybook/index.ts` chamando `registerRootComponent()` — o dev client carrega `.rnstorybook/index.ts` como entry direto quando `EXPO_PUBLIC_STORYBOOK=true`, não passa pelo `expo-router/entry.js` nesse modo. `metro.config.js` usa `withStorybook(config, { enabled: process.env.EXPO_PUBLIC_STORYBOOK === 'true' })` pra excluir o Storybook do bundle de produção.

- **Decorator global** envolvendo as stories no `ThemeProvider` (senão `useTheme()` quebra dentro do Storybook).
- Stories dos 3 átomos (Button em todos os estados/variantes, Text por variant, Card).
- **Opcional (build web/CI):** configurar `react-native-web` + Storybook web para publicar o catálogo no navegador e habilitar **Chromatic** (free tier) — continuidade da Fase 2. Deixar como incremento se o tempo permitir.

Convenção fixada a partir daqui: **todo componente novo em `ui/` entra com `.stories.tsx`** (ver DS tasks das Sprints 1-3).

---

## Validação

- [x] `useTheme()` retorna tokens em qualquer componente sob o provider — confirmado visualmente no Storybook on-device (cores/spacing dos tokens aplicados corretamente em Button/Text/Card)
- [x] `Button` mostra spinner em `loading` e fica não-clicável em `disabled` — spinner confirmado visualmente; `disabled` bloqueia interação via prop `disabled` do `Pressable`
- [ ] `Button` é anunciado por leitor de tela (label + role) — `accessibilityRole="button"` + `accessibilityLabel` implementados no código, mas não testado com leitor de tela real (TalkBack/VoiceOver) neste ambiente
- [x] Nenhum literal de cor/spacing fora de `theme/tokens.ts` — únicos valores fora de tokens são `opacity` (não é cor/spacing) e `'transparent'`/ajustes de sombra no `Card` (não são cor/spacing, ver gotcha de sombra)
- [x] **Storybook abre** (on-device) e lista as stories de Button/Text/Card com o tema aplicado — confirmado, incluindo depois de resolver um bug real (ver abaixo)
- [x] Toggle app ↔ Storybook funciona (env) — confirmado, `EXPO_PUBLIC_STORYBOOK=true`/`false` alterna corretamente

---

## Gotchas

1. **`fontWeight` no RN** precisa ser string (`'700'`) — daí o `as const`.
2. Sombra: `elevation` no Android, `shadow*` no iOS — encapsular no `Card`.
3. `StyleSheet.create` fora do render (ou `useMemo`) p/ não recriar estilos a cada render.
4. **Storybook + tema:** registrar um decorator global com o `ThemeProvider`, senão as stories quebram ao chamar `useTheme()`.
5. **Storybook infla o bundle** — mantê-lo atrás do toggle de env garante que o build de produção (EAS) não inclua o Storybook.
6. `npx storybook init` pode exigir ajustes no `metro.config.js` (transformer de stories) — seguir o output do CLI.
7. **`Pressable` com `style` em forma de função `({ pressed }) => [...]` não aplica `backgroundColor` corretamente** neste projeto (`babel.config.js` usa `jsxImportSource: 'nativewind'` globalmente, que intercepta o JSX de todo componente, mesmo sem `className`). Sintoma: variante `primary` do `Button` renderizava completamente invisível (fundo e texto brancos sumiam) enquanto `secondary`/`tertiary` pareciam OK só por coincidência (fundo branco/transparente "correto" era visualmente igual a "nenhum estilo aplicado"). Confirmado via story de diagnóstico isolando 4 casos (View inline, View com StyleSheet, Pressable com array estático, Pressable com função) — só o último falhava. Fix: gerenciar `pressed` com `useState` + `onPressIn`/`onPressOut`, passando `style` como array estático em vez de função.
8. **Storybook (`.rnstorybook/index.ts`) é carregado como _entry point direto_ pelo dev client quando `EXPO_PUBLIC_STORYBOOK=true`**, não através de `expo-router/entry.js` → `app/_layout.tsx`. Por isso `.rnstorybook/index.ts` precisa chamar `registerRootComponent()` (removê-la causa `Invariant Violation: "main" has not been registered`, um erro enganoso que não indica a causa real).

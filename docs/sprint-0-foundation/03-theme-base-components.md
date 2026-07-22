# Task 03 — Tema + tokens + componentes base + Storybook

| | |
| --- | --- |
| **Sprint** | [Sprint 0 — Foundation](./README.md) |
| **Owner** | Dev 2 (UI & DS) |
| **Duração estimada** | 3 dias |
| **Branch recomendada** | `dev2-ui/theme-base-components` |
| **Depende de** | [Task 01](./01-bootstrap-expo.md) |
| **PR só abre** | Após Button/Text/Card renderizarem e o Storybook abrir com as stories deles |

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
  primary: '#004D61',
  accent: '#47A138',
  danger: '#BF1313',
  bg: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#111111',
  muted: '#8B8B8B',
  border: '#DEE9EA',
};
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };
export const typography = {
  h1: { fontSize: 24, fontWeight: '700' as const },
  h2: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
};
```

### 2. `ThemeProvider` + `useTheme` — `src/theme/index.tsx`

Context leve que expõe `{ colors, spacing, radius, typography }`. Montado no root layout (Task 04). (Suporte a dark mode fica como plus.)

### 3. Componentes base — `src/components/ui/`

- **`Button`** — variantes `primary`/`secondary`/`ghost`, estados `loading`/`disabled`, `accessibilityRole="button"` + `accessibilityLabel`.
- **`Text`** — wrapper tipográfico (`variant="h1|h2|body|caption"`).
- **`Card`** — `surface` + `radius.md` + sombra sutil.

Cada componente: arquivo próprio + tipos + **`.stories.tsx`** + tokens via `useTheme()`. Sem cor/spacing hard-coded.

### 4. Storybook (documentação do DS)

```bash
npx storybook@latest init --type react_native
# instala @storybook/react-native + addons on-device
```

- Configuração em `.storybook/` (main, preview) e entry on-device do Storybook.
- **Toggle por env** para alternar app ↔ Storybook (ex.: `EXPO_PUBLIC_STORYBOOK=true` no `App`/root escolhe renderizar o `StorybookUIRoot`). Assim o mesmo projeto Expo abre o app normal ou o catálogo de componentes.
- **Decorator global** envolvendo as stories no `ThemeProvider` (senão `useTheme()` quebra dentro do Storybook).
- Stories dos 3 átomos (Button em todos os estados/variantes, Text por variant, Card).
- **Opcional (build web/CI):** configurar `react-native-web` + Storybook web para publicar o catálogo no navegador e habilitar **Chromatic** (free tier) — continuidade da Fase 2. Deixar como incremento se o tempo permitir.

Convenção fixada a partir daqui: **todo componente novo em `ui/` entra com `.stories.tsx`** (ver DS tasks das Sprints 1-3).

---

## Validação

- [ ] `useTheme()` retorna tokens em qualquer componente sob o provider
- [ ] `Button` mostra spinner em `loading` e fica não-clicável em `disabled`
- [ ] `Button` é anunciado por leitor de tela (label + role)
- [ ] Nenhum literal de cor/spacing fora de `theme/tokens.ts`
- [ ] **Storybook abre** (on-device) e lista as stories de Button/Text/Card com o tema aplicado
- [ ] Toggle app ↔ Storybook funciona (env)

---

## Gotchas

1. **`fontWeight` no RN** precisa ser string (`'700'`) — daí o `as const`.
2. Sombra: `elevation` no Android, `shadow*` no iOS — encapsular no `Card`.
3. `StyleSheet.create` fora do render (ou `useMemo`) p/ não recriar estilos a cada render.
4. **Storybook + tema:** registrar um decorator global com o `ThemeProvider`, senão as stories quebram ao chamar `useTheme()`.
5. **Storybook infla o bundle** — mantê-lo atrás do toggle de env garante que o build de produção (EAS) não inclua o Storybook.
6. `npx storybook init` pode exigir ajustes no `metro.config.js` (transformer de stories) — seguir o output do CLI.

# Task 04 — DS: `SearchInput`, `FilterSheet`, `Chip`, `AttachmentPicker`

| | |
| --- | --- |
| **Sprint** | [Sprint 3](./README.md) |
| **Owner** | Dev 2 (UI & DS) |
| **Duração** | 3 dias |
| **Branch** | `dev2-ui/ds-filters-picker` |
| **Depende de** | S0-03 (tema) |
| **Desbloqueia** | Tasks 09 (filtros), 10 (form), 11 (anexos) |

---

## Contexto

Componentes de UI para filtros, busca e seleção de arquivos. Entregar cedo (dias 1-4) para desbloquear Dev 3.

## Componentes (`src/components/ui/`)

- **`SearchInput`** — campo de busca com ícone, `debounce` (300ms), botão limpar, `accessibilityLabel`; anuncia contagem de resultados (`accessibilityLiveRegion`).
- **`FilterSheet`** — bottom sheet (`@gorhom/bottom-sheet` ou Modal nativo) com: intervalo de datas (2× DatePicker), multi-seleção de categorias (checkboxes/chips), seletor de tipo (deposit/withdrawal/transfer). Botões "Aplicar" / "Limpar".
- **`Chip`** — pill removível p/ mostrar filtros ativos (ex.: "Alimentação ✕").
- **`AttachmentPicker`** — botão que abre ação: "Tirar foto" (`expo-image-picker` câmera), "Escolher da galeria" (image-picker), "Escolher arquivo" (`expo-document-picker` p/ PDF). Retorna `{ uri, name, contentType, size }`.

Instalar: `npx expo install expo-image-picker expo-document-picker @gorhom/bottom-sheet react-native-reanimated react-native-gesture-handler` (reanimated/gesture-handler são deps do bottom-sheet).

Cada componente entra com `.stories.tsx` (o `AttachmentPicker` com mock do resultado do picker, já que o picker nativo não roda no Storybook).

## Validação

> **Status:** verificado no Storybook on-device (emulador Android, `sdk_gphone16k_x86_64`),
> além de `npx tsc --noEmit`, `eslint` e `prettier -c`.

- [x] `SearchInput` faz debounce e limpa — na story `Slow Debounce` (1000ms) o campo já mostra
      o texto enquanto "Busca aplicada" segue `(vazia)`, e só depois da janela emite; o ✕ limpa,
      devolve o foco e emite na hora
- [x] `FilterSheet` abre, coleta filtros e emite no "Aplicar" — emitiu
      `{"type":"deposit","categories":["salary","food"],"dateFrom":"2026-07-01"}`
- [x] `Chip` removível — remover "Alimentação" voltou o valor para `categories:["salary"]`
- [x] `AttachmentPicker` retorna foto (câmera/galeria) e PDF com metadados — mock devolveu
      `IMG_0042.jpg` / `image/jpeg` / 793 KB
- [x] Permissões de câmera/galeria pedidas e tratadas (negado → mensagem) — mock `denied`
      exibiu "Permissão de câmera negada." com borda de erro e não emitiu nada
- [x] Tudo navegável por leitor de tela — `uiautomator dump` confirma os botões expostos com
      `content-desc` ("Tirar foto", "Escolher da galeria", "Escolher arquivo",
      "Fechar opções de anexo")
- [x] Stories no Storybook (`SearchInput`, `FilterSheet`, `Chip`; `AttachmentPicker` com mock)

**Não verificado:** o caminho nativo real de câmera/galeria/arquivo. O dev client precisa de
`npx expo prebuild` + rebuild para linkar `expo-image-picker`/`expo-document-picker` e aplicar
as strings de permissão do `app.json`. Fica para a Task 11.

## Decisões de implementação

- **`Modal` nativo, não `@gorhom/bottom-sheet`** (alternativa prevista no gotcha 2). Motivo:
  `Select` e `DatePicker` já usam esse padrão, e o bottom-sheet exigiria `GestureHandlerRootView`
  em `app/_layout.tsx` — arquivo do track do Dev 3. As libs continuam instaladas.
- **`FilterSheet` emite `FilterSheetValue` = `TxFilter` sem `search`** (`{ type?, categories?,
  dateFrom?, dateTo? }`), exatamente o shape que a Task 09 passa pro `listPaged` da Task 01 —
  sem adapter no meio. `type` é single-select (Firestore `where('type','==',...)`);
  `categories` é multi.
- **"Limpar" só reseta o rascunho** dentro do sheet; nada é emitido até "Aplicar"
  (callback opcional `onClear` avisa o consumidor).
- **`AttachmentPicker` recebe um `source: AttachmentSource` injetável**
  (`AttachmentPicker.source.ts`), que isola `expo-image-picker`/`expo-document-picker` e já
  normaliza os dois shapes pra `{ uri, name, contentType, size }` (gotcha 3). O Storybook injeta
  um mock. Permissões negadas viram `{ status: 'denied', message }` → mensagem com
  `accessibilityLiveRegion`.
- Strings de permissão iOS/Android configuradas via plugin `expo-image-picker` no `app.json`
  (exige rebuild do dev client).
- **Os SDKs de picker entram por `await import(...)`, não import estático.** Eles resolvem o
  módulo nativo no topo do arquivo e derrubavam o catálogo inteiro do Storybook (onde não há
  binário nativo linkado). Com o import tardio, a falha fica dentro do handler do toque —
  onde o `try/catch` já a transforma em mensagem — em vez de quebrar o bundle.
- **`style` de `Pressable` sempre em array, nunca função** (`style={({pressed}) => ...}`).
  O `babel.config.js` usa `jsxImportSource: 'nativewind'`, e o interop do NativeWind normaliza
  o `style` e **descarta a forma de função** — o componente renderiza sem nenhum estilo do
  container. Estado de toque via `onPressIn`/`onPressOut`, como o `Button` já fazia.

## Gotchas

1. **Permissões:** `expo-image-picker` pede permissão de câmera/galeria em runtime — tratar o caso negado.
2. **`@gorhom/bottom-sheet`** exige `react-native-reanimated` (plugin no `babel.config.js`) e `GestureHandlerRootView` no root. Alternativa mais simples: `Modal` nativo se quiser evitar a config.
3. `expo-document-picker` retorna `assets[0].uri` — normalizar o shape de retorno entre image e document picker.

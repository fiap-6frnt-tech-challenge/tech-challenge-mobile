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

- [ ] `SearchInput` faz debounce e limpa
- [ ] `FilterSheet` abre, coleta filtros e emite no "Aplicar"
- [ ] `Chip` removível
- [ ] `AttachmentPicker` retorna foto (câmera/galeria) e PDF com metadados
- [ ] Permissões de câmera/galeria pedidas e tratadas (negado → mensagem)
- [ ] Tudo navegável por leitor de tela
- [ ] Stories no Storybook (`SearchInput`, `FilterSheet`, `Chip`; `AttachmentPicker` com mock)

## Gotchas

1. **Permissões:** `expo-image-picker` pede permissão de câmera/galeria em runtime — tratar o caso negado.
2. **`@gorhom/bottom-sheet`** exige `react-native-reanimated` (plugin no `babel.config.js`) e `GestureHandlerRootView` no root. Alternativa mais simples: `Modal` nativo se quiser evitar a config.
3. `expo-document-picker` retorna `assets[0].uri` — normalizar o shape de retorno entre image e document picker.

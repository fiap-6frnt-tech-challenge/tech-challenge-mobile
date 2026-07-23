# Task 05 — DS: `AttachmentList` + preview

| | |
| --- | --- |
| **Sprint** | [Sprint 3](./README.md) |
| **Owner** | Dev 2 (UI & DS) |
| **Duração** | 1 dia |
| **Branch** | `dev2-ui/ds-attachment-list` |
| **Depende de** | S0-03 (tema) |
| **Desbloqueia** | Task 11 (fluxo de anexos) |

---

## Contexto

Lista os recibos anexados a uma transação, com preview e ação de remover. Usada no form e no detalhe.

## Implementação

`src/components/ui/AttachmentList.tsx`:

- Item: thumbnail (imagem) ou ícone de PDF, nome, tamanho formatado, botão remover
- Estado de **upload em progresso** (barra + %) vs. **enviado** (link/preview)
- Tocar no item → abre preview (imagem em modal/zoom; PDF via `Linking.openURL(url)` ou `WebView`)
- `readonly?` (esconde o botão remover)
- `accessibilityLabel`: "Recibo recibo.pdf, 1,2 MB, botão remover"

`AttachmentList` entra com `.stories.tsx` cobrindo: imagem, PDF, upload em progresso, e modo `readonly`.

## Validação

- [ ] Mostra thumbnail p/ imagem e ícone p/ PDF
- [ ] Tamanho formatado (KB/MB)
- [ ] Barra de progresso durante upload
- [ ] Remover dispara callback
- [ ] Preview abre imagem e PDF
- [ ] `readonly` esconde remover
- [ ] Stories no Storybook (imagem / PDF / progresso / readonly)

## Gotchas

1. **Thumbnail de PDF** não renderiza como `<Image>` — usar ícone + abrir externo no toque.
2. Preview de imagem: `<Image>` com `resizeMode="contain"` num modal; cuidado com imagens grandes (usar a URL do Storage, que serve otimizado o suficiente).

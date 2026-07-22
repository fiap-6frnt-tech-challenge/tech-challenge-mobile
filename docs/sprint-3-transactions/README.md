# Sprint 3 — Transactions Advanced

**Duração:** 11 dias · 2026-08-14 -> 2026-08-24
**Time:** 3 devs — Dev 1 (Firebase & Data) · Dev 2 (UI & DS) · Dev 3 (Nav & Integration)
**Objetivo:** Evoluir o fluxo de transações já funcional: lista com scroll infinito, filtros avançados, busca integrada ao Firestore e upload/preview/remoção de anexos no Firebase Storage.

> Voltar para o [PLAN.md](../PLAN.md) · Alocação: [team-allocation.md#sprint-3](../team-allocation.md#sprint-3--transactions-advanced-11-dias--1408---2408) · Anterior: [Sprint 2](../sprint-2-dashboard/README.md) · Próximo: [Sprint 4](../sprint-4-polish-deploy/README.md)

---

## Pré-requisitos

- [x] Sprint 1 fechada com CRUD mínimo
- [x] Sprint 2 fechada com dashboard consumindo dados reais
- [x] Spike de upload Storage validado na Sprint 0
- [ ] Storage habilitado no Firebase Console
- [ ] Índices Firestore necessários identificados/documentados

---

## Scroll infinito e busca

A spec permite **scroll infinito ou paginação**. O time mantém **scroll infinito**:

- `FlatList` com `onEndReached`
- Firestore cursor com `orderBy('date', 'desc')`, `limit(PAGE_SIZE)` e `startAfter(lastDoc)`
- Mudança de filtro reseta cursor e volta ao topo
- Dedupe por `id`

Para busca textual, Firestore tem limitações. A estratégia deve ser simples e documentada:

- filtros fortes por data, categoria e tipo via query Firestore
- campo `descriptionNormalized` salvo na transação
- busca por prefixo quando possível, ou busca local sobre o conjunto carregado se a combinação de filtros não permitir query eficiente
- qualquer limitação deve aparecer no README final

---

## Ordem de execução

| # | Status | Task | Owner | Duração | Paralela? | Arquivo |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | ⏳ | Service: paginação por cursor + filtros Firestore | Dev 1 | 1.5 dia | ✅ | [01-service-pagination-filters.md](./01-service-pagination-filters.md) |
| 02 | ⏳ | Estratégia de busca: `descriptionNormalized`, prefixo/local e índices | Dev 1 + Dev 3 | 1 dia | ⬅ 01 | [02-search-strategy.md](./02-search-strategy.md) |
| 03 | ⏳ | `storage.service` + `storage.rules` a partir do spike | Dev 1 | 2 dias | ✅ | [02-storage-service-rules.md](./02-storage-service-rules.md) |
| 04 | ⏳ | DS: `SearchInput`, `FilterSheet`, `Chip`, `AttachmentPicker` + stories | Dev 2 | 3 dias | ✅ | [04-ds-filters-picker.md](./04-ds-filters-picker.md) |
| 05 | ⏳ | DS: `AttachmentList` + preview imagem/PDF + stories | Dev 2 | 1 dia | ✅ | [05-ds-attachment-list.md](./05-ds-attachment-list.md) |
| 06 | ⏳ | Hook `useInfiniteTransactions` | Dev 3 | 1.5 dia | ⬅ 01, 02 | [07-hook-infinite.md](./07-hook-infinite.md) |
| 07 | ⏳ | Tela lista com FlatList, footer e estados de paginação | Dev 3 | 1.5 dia | ⬅ 06 | [08-infinite-list-screen.md](./08-infinite-list-screen.md) |
| 08 | ⏳ | Integração de filtros e busca | Dev 3 | 1.5 dia | ⬅ 04, 06 | [09-filters-integration.md](./09-filters-integration.md) |
| 09 | ⏳ | Integrar anexos ao Add/Edit existente | Dev 2 + Dev 3 | 1.5 dia | ⬅ 03, 04, 05 | [11-attachments-flow.md](./11-attachments-flow.md) |
| 10 | ⏳ | Remover anexo: Storage + Firestore consistentes | Dev 1 + Dev 3 | 1 dia | ⬅ 03, 09 | [10-remove-attachment.md](./10-remove-attachment.md) |
| 11 | ⏳ | Testes + smoke + vídeo parcial | Todos | 1 dia | ⬅ impl | [12-tests-smoke.md](./12-tests-smoke.md) |

**Legenda:** ✅ mergeada · 🟢 implementada · ⏳ pendente

---

## Dependências entre tasks

```txt
01 (paginação/filtros) -> 02 (busca) -> 06 (hook) -> 07 (lista)
04 (DS filtros/picker) -> 08 (filtros) -> 11
03 (storage/rules) + 04 + 05 -> 09 (anexos) -> 10 (remoção)
tudo -> 11
```

---

## Critério de aceite do sprint

### Listagem + scroll infinito

- [ ] Lista carrega páginas via cursor
- [ ] `onEndReached` busca próxima página
- [ ] Footer mostra carregamento
- [ ] Fim da lista para novas buscas
- [ ] Não duplica nem pula itens

### Filtros + busca

- [ ] Filtra por intervalo de data
- [ ] Filtra por uma ou mais categorias
- [ ] Filtra por tipo (`deposit`, `withdrawal`, `transfer`)
- [ ] Busca por descrição funciona conforme estratégia documentada
- [ ] Chips mostram filtros ativos
- [ ] Limpar filtros reseta lista e cursor

### Anexos

- [ ] Add/Edit aceita foto e PDF
- [ ] Upload salva arquivo em `receipts/{uid}/{txId}/...`
- [ ] Transação guarda metadados do anexo
- [ ] Preview/lista de anexos aparece no detalhe/form
- [ ] Remover anexo apaga Storage e Firestore
- [ ] `storage.rules` restringe acesso por `uid`
- [ ] Limites de tamanho/tipo ficam documentados

### Qualidade

- [ ] Stories dos componentes de filtro e anexos
- [ ] Testes do hook de paginação
- [ ] Testes de rules Storage/Firestore quando aplicável
- [ ] Smoke em device/simulator cobre filtros, busca e upload

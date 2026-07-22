# Sprint 3 — Transactions: Infinite Scroll + Filters + Form + Attachments

**Duração:** 11 dias · 2026-08-14 → 2026-08-24
**Time:** 3 devs — Dev 1 (Firebase & Data) · Dev 2 (UI & DS) · Dev 3 (Nav & Integration)
**Objetivo:** Fechar o coração do app: **listagem com scroll infinito** (cursores do Firestore), **filtros avançados** (data, categoria, tipo) + **busca**, **form de adicionar/editar** com validação avançada e **sugestão de categoria**, e **upload de recibos** para o **Firebase Storage**.

> Voltar para o [PLAN.md](../PLAN.md) · Alocação: [team-allocation.md#sprint-3](../team-allocation.md#sprint-3--transactions-infinite-scroll--filters--form--attachments-11-dias-1408--2408) · Anterior: [Sprint 2](../sprint-2-dashboard/README.md) · Próximo: [Sprint 4](../sprint-4-polish-deploy/README.md)

---

## Scroll infinito (decisão)

A spec pede **"scroll infinito OU paginação"**. O time escolheu **scroll infinito** (decisão do produto). Implementação:

- **Firestore cursors:** `query(col, orderBy('date','desc'), limit(PAGE))` + `startAfter(lastDocSnapshot)` para a próxima página.
- **FlatList `onEndReached`** dispara o carregamento da próxima página; `ListFooterComponent` mostra o spinner.
- **Estado do cursor** vive no hook `useInfiniteTransactions` (não no `TransactionContext`, que guarda o estado "corrente" p/ o dashboard).
- **Filtros + scroll infinito:** ao mudar um filtro, resetar o cursor e recomeçar do topo.

> Diferença vs. o dashboard: o dashboard usa `items` completo (para agregações); a lista usa o hook paginado (para grandes volumes). São consumidores distintos do mesmo Firestore.

---

## Pré-requisitos

- [x] Sprint 2 fechado (dashboard funcional)
- [x] `transactions.service` (CRUD) e `firestore.rules` prontos (S1)
- [ ] Storage habilitado no Firebase Console (rules nesta sprint)
- [ ] `suggestCategory` portado (S0-05)

---

## Ordem de execução

| # | Status | Task | Owner | Duração | Paralela? | Arquivo |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | ⏳ | Service: paginação por cursor + filtros/busca | Dev 1 | 1.5 dia | ✅ | [01-service-pagination-filters.md](./01-service-pagination-filters.md) |
| 02 | ⏳ | `storage.service` + `storage.rules` | Dev 1 | 2 dias | ✅ | [02-storage-service-rules.md](./02-storage-service-rules.md) |
| 03 | ⏳ | `suggestCategory` integrado + testes | Dev 1 | 0.5 dia | ✅ | [03-suggest-category.md](./03-suggest-category.md) |
| 04 | ⏳ | DS: `SearchInput`, `FilterSheet`, `Chip`, `AttachmentPicker` | Dev 2 | 3 dias | ✅ | [04-ds-filters-picker.md](./04-ds-filters-picker.md) |
| 05 | ⏳ | DS: `AttachmentList` + preview | Dev 2 | 1 dia | ✅ | [05-ds-attachment-list.md](./05-ds-attachment-list.md) |
| 06 | ⏳ | Validação Zod avançada | Dev 2 | 0.5 dia | ⬅ 03 | [06-zod-advanced.md](./06-zod-advanced.md) |
| 07 | ⏳ | Hook `useInfiniteTransactions` | Dev 3 | 1.5 dia | ⬅ 01 | [07-hook-infinite.md](./07-hook-infinite.md) |
| 08 | ⏳ | Tela lista com scroll infinito (FlatList) | Dev 3 | 1.5 dia | ⬅ 07 | [08-infinite-list-screen.md](./08-infinite-list-screen.md) |
| 09 | ⏳ | Integração de filtros → query | Dev 3 | 2 dias | ⬅ 01, 04 | [09-filters-integration.md](./09-filters-integration.md) |
| 10 | ⏳ | Form Add/Edit + validação + sugestão | Dev 3 | 1.5 dia | ⬅ 04, 06 | [10-transaction-form.md](./10-transaction-form.md) |
| 11 | ⏳ | Fluxo de anexos (picker → Storage → Firestore) | Dev 3 | 1.5 dia | ⬅ 02, 04, 05 | [11-attachments-flow.md](./11-attachments-flow.md) |
| 12 | ⏳ | Testes + smoke + vídeo 4 min | Todos | 1 dia | ⬅ impl | [12-tests-smoke.md](./12-tests-smoke.md) |

**Legenda:** ✅ mergeada · 🟢 implementada · ⏳ pendente

---

## Dependências entre tasks

```
01 (paginação) ─→ 07 (hook) ─→ 08 (lista) ─┐
04 (DS filtros/picker) ─┬─→ 09 (filtros) ──┘
                        ├─→ 10 (form) ← 06 (zod) ← 03 (suggest)
                        └─→ 11 (anexos) ← 02 (storage) ← 05 (AttachmentList)
tudo ─→ 12 (testes/smoke)
```

---

## Critério de aceite do sprint

### Listagem + scroll infinito

- [ ] Lista carrega em páginas via cursor; `onEndReached` busca a próxima; footer mostra spinner
- [ ] Sem duplicar/pular itens ao paginar; fim da lista para de buscar
- [ ] Funciona com centenas de transações sem travar

### Filtros + busca

- [ ] Filtrar por **data** (intervalo), **categoria** (multi) e **tipo** (deposit/withdrawal/transfer)
- [ ] **Busca** por descrição (integrada ao Firestore)
- [ ] Mudar filtro **reseta** o scroll infinito para o topo
- [ ] Chips mostram filtros ativos; limpar filtros funciona

### Form Add/Edit

- [ ] Criar e editar transação persistem no Firestore
- [ ] **Validação avançada:** valor > 0, categoria obrigatória, data não-futura, descrição 3-140
- [ ] Digitar "Uber" sugere categoria "Transporte" (aceitável/editável)

### Anexos (Firebase Storage)

- [ ] Anexar **foto** (galeria/câmera) e **PDF** (document picker)
- [ ] Upload p/ Storage com barra de progresso; ref salva na transação
- [ ] Preview do anexo; remover apaga do Storage e do Firestore
- [ ] `storage.rules` restringe a `receipts/{uid}/...`; máx 5MB e tipos permitidos
- [ ] Anexo persiste após reabrir o app

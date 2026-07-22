# Sprint 4 — Polish + Build + Demo

**Duração:** 7 dias · 2026-08-25 -> 2026-08-31 (**prazo final 31/08**)
**Time:** 3 devs — Dev 1 (Firebase & Data) · Dev 2 (UI & DS) · Dev 3 (Nav & Integration)
**Objetivo:** Fechar a entrega com acessibilidade, performance, README completo, Storybook revisado, EAS Build Android, vídeo demonstrativo de até 5 minutos e smoke final em clone limpo.

> Voltar para o [PLAN.md](../PLAN.md) · Alocação: [team-allocation.md#sprint-4](../team-allocation.md#sprint-4--polish--build--demo-7-dias--2508---3108) · Anterior: [Sprint 3](../sprint-3-transactions/README.md)

---

## Pré-requisitos

- [x] Sprints 0-3 fechadas
- [x] Auth, CRUD, dashboard, filtros, busca e anexos funcionais
- [ ] CI verde em `develop`
- [ ] Firebase configurado com Auth, Firestore, Storage e rules
- [ ] Conta Expo/EAS configurada

---

## Ordem de execução

| # | Status | Task | Owner | Duração | Arquivo |
| --- | --- | --- | --- | --- | --- |
| 01 | ⏳ | Auditoria de acessibilidade | Dev 2 | 1.5 dia | [01-accessibility-audit.md](./01-accessibility-audit.md) |
| 02 | ⏳ | Performance (FlatList, memo, imagens, cold start) | Dev 3 | 1.5 dia | [02-performance.md](./02-performance.md) |
| 03 | ⏳ | EAS Build config + APK Android | Dev 1 | 1.5 dia | [03-eas-build.md](./03-eas-build.md) |
| 04 | ⏳ | README final: Firebase, `.env`, deps, Storybook, busca e passos locais | Dev 1 | 1 dia | [04-readme.md](./04-readme.md) |
| 05 | ⏳ | E2E/smoke dos fluxos críticos | Dev 3 | 1 dia | [05-e2e.md](./05-e2e.md) |
| 06 | ⏳ | Vídeo demo <= 5 min | Todos | 1 dia | [06-demo-video.md](./06-demo-video.md) |
| 07 | ⏳ | Smoke final em clone limpo + tag `v1.0.0` + merge final | Todos | 0.5 dia | [07-release.md](./07-release.md) |

**Legenda:** ✅ mergeada · 🟢 implementada · ⏳ pendente

---

## Critério de aceite do sprint

- [ ] Todos os elementos interativos têm `accessibilityLabel` e `accessibilityRole`
- [ ] Contraste AA nos componentes principais
- [ ] `reduce-motion` respeitado nas animações quando aplicável
- [ ] Lista com muitos itens continua fluida
- [ ] Imagens/anexos não degradam a experiência
- [ ] Storybook abre e documenta DS base, forms, filtros, anexos, KPIs e gráficos
- [ ] README permite rodar em clone limpo
- [ ] README documenta Firebase Auth, Firestore, Storage, rules e `.env`
- [ ] README explica limitação/estratégia da busca Firestore
- [ ] APK Android instalável gerado por EAS
- [ ] Vídeo de até 5 minutos cobre todos os fluxos pedidos
- [ ] `develop` mergeada em `main` com tag `v1.0.0`

---

## Mapa: requisito da spec -> entrega

| Requisito (PDF) | Entregue em |
| --- | --- |
| Dashboard com gráficos e análises | Sprint 2 |
| Animações entre seções usando `Animated` | Sprint 2 — Task 04 |
| Listagem de transações | Sprint 1 básica; Sprint 3 avançada |
| Filtros avançados | Sprint 3 — Tasks 01, 04, 08 |
| Scroll infinito/paginação | Sprint 3 — Tasks 06, 07 |
| Busca integrada ao Firestore | Sprint 3 — Tasks 02, 08 |
| Adicionar/Editar transação | Sprint 1 — Task 09 |
| Validação avançada | Sprint 1 — Task 09; refinada na Sprint 3 |
| Upload de recibos/anexos | Spike Sprint 0; integração Sprint 3 |
| React Native Mobile + Expo | Sprint 0 |
| Context API | Sprints 0-1 |
| Firebase Auth/Firestore/Storage | Sprints 0-3 |
| README com setup | Sprint 4 — Task 04 |
| Vídeo demonstrativo | Sprint 4 — Task 06 |

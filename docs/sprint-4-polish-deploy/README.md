# Sprint 4 — Polish + Build + Demo

**Duração:** 7 dias · 2026-08-25 → 2026-08-31 (**prazo final 31/08**)
**Time:** 3 devs — Dev 1 (Firebase & Data) · Dev 2 (UI & DS) · Dev 3 (Nav & Integration)
**Objetivo:** Fechar a entrega — acessibilidade, performance, **EAS Build (APK Android)**, **README** com configuração do Firebase e passos para rodar, e o **vídeo demonstrativo (≤5 min)**. Buffer de 3 dias embutido para o prazo fixo.

> Voltar para o [PLAN.md](../PLAN.md) · Alocação: [team-allocation.md#sprint-4](../team-allocation.md#sprint-4--polish--build--demo-7-dias-2508--3108) · Anterior: [Sprint 3](../sprint-3-transactions/README.md)

---

## Pré-requisitos

- [x] Sprints 0-3 fechadas; todas as features funcionais em device
- [ ] CI verde em `develop`
- [ ] Conta Expo com EAS configurado (S0-07)

---

## Ordem de execução

| # | Status | Task | Owner | Duração | Arquivo |
| --- | --- | --- | --- | --- | --- |
| 01 | ⏳ | Auditoria de acessibilidade | Dev 2 | 1.5 dia | [01-accessibility-audit.md](./01-accessibility-audit.md) |
| 02 | ⏳ | Performance (FlatList, memo, cold start) | Dev 3 | 1.5 dia | [02-performance.md](./02-performance.md) |
| 03 | ⏳ | EAS Build config + APK Android | Dev 1 | 1.5 dia | [03-eas-build.md](./03-eas-build.md) |
| 04 | ⏳ | README final (Firebase, `.env`, deps, passos) | Dev 1 | 1 dia | [04-readme.md](./04-readme.md) |
| 05 | ⏳ | E2E fluxos críticos (Maestro opcional) | Dev 3 | 1 dia | [05-e2e.md](./05-e2e.md) |
| 06 | ⏳ | Vídeo demo (≤5 min) | Todos | 1 dia | [06-demo-video.md](./06-demo-video.md) |
| 07 | ⏳ | Smoke final + tag + merge `develop`→`main` | Todos | 0.5 dia | [07-release.md](./07-release.md) |

**Legenda:** ✅ mergeada · 🟢 implementada · ⏳ pendente

---

## Critério de aceite do sprint (= entrega da fase)

- [ ] **A11y:** todos os interativos com label/role; contraste AA; navegável por leitor de tela; reduce-motion respeitado
- [ ] **Performance:** lista fluida com muitos itens; cold start aceitável; sem re-render desnecessário
- [ ] **EAS Build:** APK Android instalável gerado e testado num device
- [ ] **README:** um clone limpo consegue configurar Firebase, criar `.env` e rodar (`npm install` + `npx expo start`)
- [ ] **Vídeo (≤5 min):** cobre login/auth, add/edit, visualizar+filtrar, upload de anexos, integração Firebase
- [ ] **Repo:** `develop` mergeada em `main`, tag `v1.0.0`
- [ ] Checklist da spec 100% coberto (ver mapeamento abaixo)

---

## Mapa: requisito da spec → onde está

| Requisito (PDF) | Entregue em |
| --- | --- |
| Dashboard com gráficos e análises | Sprint 2 |
| Animações entre seções (`Animated`) | Sprint 2 — Task 04 |
| Listagem com filtros avançados | Sprint 3 — Task 09 |
| Scroll infinito | Sprint 3 — Tasks 07-08 |
| Busca integrada ao Firestore | Sprint 3 — Tasks 01, 09 |
| Adicionar/Editar transação | Sprint 3 — Task 10 |
| Validação avançada (valor, categoria) | Sprint 3 — Task 06 |
| Upload de recibos (Firebase Storage) | Sprint 3 — Tasks 02, 11 |
| React Native (Expo) | Sprint 0 |
| Context API (auth + transações) | Sprints 0-1 (AuthContext, TransactionContext) |
| Firebase (Auth/Firestore/Storage) | Sprints 0-3 |
| README com config Firebase | Sprint 4 — Task 04 |
| Vídeo demonstrativo | Sprint 4 — Task 06 |

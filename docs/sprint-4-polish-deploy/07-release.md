# Task 07 — Smoke final + tag + merge `develop`→`main`

| | |
| --- | --- |
| **Sprint** | [Sprint 4](./README.md) |
| **Owner** | Todos |
| **Duração** | 0.5 dia |
| **Branch** | PR final `develop` → `main` |
| **Depende de** | Tasks 01-06 |

---

## Contexto

Fecho da fase. Smoke final em clone limpo, tag de release e merge para `main`.

## Roteiro final (clone limpo)

1. `git clone` → seguir **só o README** → configurar Firebase + `.env`
2. `npm install && npx expo start` → app sobe
3. Executar o roteiro end-to-end do [PLAN.md](../PLAN.md#verificação-end-to-end-final) (13 itens)
4. Instalar o **APK** e repetir os fluxos principais
5. Conferir o mapa de requisitos (README do Sprint 4) — 100% coberto

## Release

```bash
git checkout main && git merge --no-ff develop
git tag -a v1.0.0 -m "Tech Challenge Fase 3 — Bytebank Mobile"
git push origin main --tags
```

## Checklist de entrega

- [ ] Repositório Git público/acessível à banca
- [ ] README completo (config Firebase + rodar)
- [ ] APK anexado/linkado
- [ ] Vídeo (≤5 min) linkado
- [ ] Todos os requisitos da spec cobertos (ver mapa)
- [ ] CI verde em `main`
- [ ] Tag `v1.0.0`

## Gotchas

1. **Prazo 31/08:** deixar este dia livre — não empurrar features. Se algo escorregou, cortar "plus", nunca requisito.
2. Testar o README **de verdade** numa máquina/clone limpo — é o que a banca faz.

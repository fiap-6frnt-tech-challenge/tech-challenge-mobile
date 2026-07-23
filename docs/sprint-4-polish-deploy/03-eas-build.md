# Task 03 — EAS Build config + APK Android

| | |
| --- | --- |
| **Sprint** | [Sprint 4](./README.md) |
| **Owner** | Dev 1 (Firebase & Data) |
| **Duração** | 1.5 dia |
| **Branch** | `dev1-fb/eas-build` |
| **Depende de** | Sprint 3 (app completo) |

---

## Contexto

Gera o artefato instalável do app via **EAS Build** (a "cloud" de build do Expo). O entregável mínimo é um **APK Android** que a banca consegue instalar; iOS é opcional (exige conta Apple paga p/ device físico).

## Implementação

`eas.json`:

```jsonc
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

Variáveis de ambiente Firebase no EAS (as `EXPO_PUBLIC_*`):

```bash
eas secret:create --name EXPO_PUBLIC_FIREBASE_API_KEY --value ...
# ... demais chaves
eas build --platform android --profile preview
```

Baixar o APK do link do EAS e instalar num device.

## Validação

- [ ] `eas build -p android --profile preview` conclui com sucesso
- [ ] APK instala e abre num device Android real
- [ ] App buildado conecta ao Firebase (login, Firestore, upload funcionam)
- [ ] Link/arquivo do APK anexado à entrega

## Gotchas

1. **Env no build:** `EXPO_PUBLIC_*` precisam estar disponíveis no EAS (secrets ou `eas.json env`) — senão o build sai sem config Firebase.
2. **`storageBucket`/domínios do Firebase:** conferir que as chaves de produção batem com o projeto.
3. Primeiro build EAS demora (fila + compilação) — não deixar p/ o último dia; rodar já no início do Sprint 4.
4. Ícone/splash e `versionCode` no `app.json` antes do build de release.

# Task 07 — CI (lint + typecheck + test) + init EAS

| | |
| --- | --- |
| **Sprint** | [Sprint 0 — Foundation](./README.md) |
| **Owner** | Dev 1 (Firebase & Data) |
| **Duração estimada** | 0.5 dia |
| **Branch recomendada** | `dev1-fb/ci-eas-init` |
| **Depende de** | [Task 01](./01-bootstrap-expo.md) |
| **PR só abre** | Após workflow verde num PR de teste |

---

## Dependências

- **Bloqueia esta task:** Task 01.
- **Esta task desbloqueia:** disciplina de PR de toda a fase; EAS Build no Sprint 4.

---

## Contexto

Automação mínima para PRs contra `develop` e a base do build de release (EAS) que só será exercido no Sprint 4 — mas inicializado agora para não virar surpresa no fim.

---

## Implementação

### 1. Jest + Testing Library

```bash
npx expo install jest jest-expo @testing-library/react-native
npm i -D @types/jest
```

`jest.config.js` com preset `jest-expo`; um teste placeholder (`suggestCategory` da Task 05).

### 2. GitHub Actions — `.github/workflows/ci.yml`

```yaml
name: CI
on:
  pull_request:
    branches: [develop, main]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --ci
```

### 3. EAS init

```bash
npm i -g eas-cli
eas login
eas build:configure     # gera eas.json
```

`eas.json` com perfil `preview` (Android APK, `distribution: internal`) e `production`.

---

## Validação

- [ ] PR de teste dispara o workflow e fica verde
- [ ] `eas.json` commitado com perfil `preview` (APK)
- [ ] `npm test` roda o placeholder

---

## Gotchas

1. **Segredos Firebase no CI:** o lint/typecheck/test não precisa das chaves reais; para testes que tocam Firebase, usar mock. Não expor `.env` real no Actions.
2. `eas build` de verdade só no Sprint 4 — aqui é só `configure` (não gasta minutos de build).

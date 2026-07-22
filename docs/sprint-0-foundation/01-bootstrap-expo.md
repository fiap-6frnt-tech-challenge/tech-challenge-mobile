# Task 01 — Bootstrap app Expo (TypeScript + Expo Router)

| | |
| --- | --- |
| **Sprint** | [Sprint 0 — Foundation](./README.md) |
| **Owner** | Dev 3 (Nav & Integration) |
| **Duração estimada** | 1 dia |
| **Branch recomendada** | `dev3-nav/bootstrap-expo` |
| **Depende de** | Repo `bytebank-mobile` criado |
| **PR só abre** | Após `npx expo start` rodar em device |

---

## Dependências

- **Bloqueia esta task:** nada (primeira do projeto).
- **Esta task desbloqueia:** 03 (tema), 04 (navegação), 05 (domínio), 07 (CI).

---

## Contexto

Ponto de partida do repositório. Cria o app Expo com o template TypeScript + Expo Router e a estrutura de pastas definida no [PLAN.md](../PLAN.md).

---

## Implementação

```bash
# criar o app (SDK managed, TypeScript, expo-router pré-configurado)
npx create-expo-app@latest bytebank-mobile
cd bytebank-mobile
```

Estrutura de pastas a criar (além da gerada):

```
src/
├── domain/
├── services/
├── contexts/
├── hooks/
├── components/{ui,features}/
└── theme/
```

Configurar path alias em `tsconfig.json`:

```jsonc
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

`app.json` — nome, slug, `scheme` (deep-link p/ auth), orientação portrait, ícone/splash placeholder.

Adicionar scripts em `package.json`:

```jsonc
"scripts": {
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "lint": "expo lint",
  "typecheck": "tsc --noEmit",
  "test": "jest"
}
```

---

## Validação

- [ ] `npx expo start` abre o Metro; app carrega em Expo Go (device/emulador)
- [ ] `import x from '@/...'` resolve (alias funciona)
- [ ] `npm run typecheck` passa
- [ ] Estrutura de pastas `src/*` commitada (com `.gitkeep` onde vazio)

---

## Gotchas

1. **Use `create-expo-app`** (não `expo init`, deprecado). O template default já traz Expo Router.
2. **`scheme` no `app.json`** é necessário p/ redirect de auth funcionar em device.
3. Commit do `package-lock.json` para builds reprodutíveis no CI/EAS.

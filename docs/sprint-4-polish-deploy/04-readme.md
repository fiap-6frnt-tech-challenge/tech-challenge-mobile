# Task 04 — README final

|                |                         |
| -------------- | ----------------------- |
| **Sprint**     | [Sprint 4](./README.md) |
| **Owner**      | Dev 1 (Firebase & Data) |
| **Duração**    | 1 dia                   |
| **Branch**     | `dev1-fb/readme`        |
| **Depende de** | Sprint 3                |

---

## Contexto

Entregável obrigatório: README com **configuração do Firebase**, dependências e passos para rodar localmente (item explícito da spec).

## Estrutura do README

1. **Sobre** — Bytebank Mobile, print/gif do app, stack (Expo/RN, Firebase, Context API)
2. **Requisitos** — Node 20+, Expo Go (ou emulador Android/iOS), conta Firebase
3. **Configuração do Firebase** (passo a passo):
   - Criar projeto no console
   - Habilitar Authentication → Email/Password
   - Criar Firestore + publicar `firestore.rules` (comando)
   - Habilitar Storage + publicar `storage.rules`
   - Registrar Web App e copiar `firebaseConfig`
   - Criar índices compostos (link do erro do Firestore) — listar os necessários
4. **Variáveis de ambiente** — copiar `.env.example` → `.env` e preencher `EXPO_PUBLIC_*`
5. **Instalar e rodar**:
   ```bash
   npm install
   npx expo start        # abrir em Expo Go / emulador
   ```
6. **Testes** — `npm test`
7. **Storybook** — como abrir o catálogo de componentes (toggle por env, ex.: `EXPO_PUBLIC_STORYBOOK=true npx expo start`)
8. **Build (APK)** — `eas build -p android --profile preview`
9. **Estrutura do projeto** — árvore de pastas resumida
10. **Funcionalidades** — checklist mapeado à spec
11. **Vídeo demo** — link

## Validação

- [ ] Um dev externo (ou colega em máquina limpa) consegue rodar seguindo só o README
- [x] `.env.example` presente e completo
- [x] Comandos de deploy das rules documentados
- [x] Índices do Firestore listados

Evidência (2026-08-29): `npm run lint`, `npx tsc --noEmit`, `git diff --check` e o contrato dos scripts documentados passaram. Em clone separado criado com `git clone --no-local`, `npm ci`, `npm start`, `npm run ios`, `npm run storybook` e `npm test` passaram; o app foi instalado no Simulador iOS. O fluxo autenticado de transação/comprovante não foi concluído nesta sessão e o gate do emulador Firestore ficou bloqueado porque o host possui apenas Java 17 (o `firebase-tools` atual exige Java 21), portanto a validação em máquina limpa permanece aberta.

## Gotchas

1. **Não commitar `.env` real** — só o `.env.example`.
2. Deixar claro que as `EXPO_PUBLIC_*` são chaves de cliente (públicas) e que a segurança está nas rules.
3. Incluir troubleshooting comum: erro de índice do Firestore (com link), permissão de câmera negada, persistência de auth.

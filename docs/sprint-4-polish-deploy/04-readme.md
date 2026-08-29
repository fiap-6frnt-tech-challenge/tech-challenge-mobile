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
3. **Configuração e execução operacional** — consulte o [README raiz](../../README.md), que define a sequência para clone, `cd`, `npm ci`, Firebase, `.env` e inicialização do app.
4. **Firebase e variáveis de ambiente** — o README raiz documenta Auth, Firestore, Storage, rules, índices, o único `cp .env.example .env` e as chaves `EXPO_PUBLIC_*`.
5. **Testes, Storybook e build Android** — use os scripts e comandos exatos do README raiz; ele é a fonte de verdade para o catálogo no dispositivo e o perfil EAS `preview`.
6. **Estrutura do projeto** — árvore de pastas resumida.
7. **Funcionalidades** — checklist mapeado à spec.
8. **Vídeo demo** — link.

## Validação

- [ ] Um dev externo (ou colega em máquina limpa) consegue rodar seguindo só o README
- [x] `.env.example` presente e completo
- [x] Comandos de deploy das rules documentados
- [x] Índices do Firestore listados

Evidência (2026-08-29): `npm run lint`, `npx tsc --noEmit`, `git diff --check` e o contrato dos scripts documentados passaram. Em clone separado criado com `git clone --no-local`, `npm ci`, `npm start`, `npm run ios`, `npm run storybook` e `npm test` passaram; o app foi instalado no Simulador iOS. O fluxo autenticado de transação/comprovante não foi concluído nesta sessão; o gate do emulador Firestore/domínio passou com Java 21, com 25 arquivos e 284 testes aprovados. A validação em máquina limpa permanece aberta por causa do fluxo de interface não concluído.

## Gotchas

1. **Não commitar `.env` real** — só o `.env.example`.
2. Deixar claro que as `EXPO_PUBLIC_*` são chaves de cliente (públicas) e que a segurança está nas rules.
3. Incluir troubleshooting comum: erro de índice do Firestore (com link), permissão de câmera negada, persistência de auth.

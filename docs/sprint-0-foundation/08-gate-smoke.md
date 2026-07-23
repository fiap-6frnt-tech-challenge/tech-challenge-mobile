# Task 08 — Gate + Smoke em device

| | |
| --- | --- |
| **Sprint** | [Sprint 0 — Foundation](./README.md) |
| **Owner** | Todos |
| **Duração estimada** | 0.5 dia |
| **Branch recomendada** | — (validação conjunta em `develop`) |
| **Depende de** | Tasks 01-07 |
| **PR só abre** | — |

---

## Contexto

Fecho do Sprint 0. Valida a hipótese central da stack (**Expo + Firebase JS SDK com auth persistente**) antes de investir 5 semanas nela. Se o gate reprovar, acionar a mitigação (Dev Client + `@react-native-firebase`).

---

## Roteiro de smoke (device real + emulador)

1. Clone limpo → `npm install` → `npx expo start` → abre em Expo Go
2. App abre em `(auth)/login` (placeholder)
3. Navegação: tabs Dashboard/Transações acessíveis
4. Tema aplicado (cores/typography via `useTheme`)
5. Console script de teste: `createUserWithEmailAndPassword` cria usuário no Firebase Console
6. **Gate de persistência:** logar via script → **reload do app** → `auth.currentUser` ainda preenchido
7. `firestore.rules`/`storage.rules` default publicadas (restritivas; refinadas nas próximas sprints)
8. CI verde no último PR

---

## Gate — critérios (dia 5)

- [ ] App roda em device real via Expo Go
- [ ] Firebase inicializa Auth+Firestore+Storage sem erro
- [ ] **Auth persiste após reload** (risco #1 mitigado)

**Se reprovar:** migrar para **Expo Dev Client + `@react-native-firebase`** (config plugin `expo-build-properties`). Impacto: precisa de dev build (não roda em Expo Go puro), mas resolve persistência/Storage nativos. Registrar a decisão aqui e ajustar o Sprint 1.

---

## Validação

- [ ] Todos os itens do roteiro ✅
- [ ] Gate aprovado (ou mitigação acionada e documentada)
- [ ] README de bootstrap atualizado com os passos mínimos p/ rodar

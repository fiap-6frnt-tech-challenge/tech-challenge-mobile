# Task 00 — Integrar `navigation-skeleton`

## Contexto

A branch `navigation-skeleton` já adianta a base de navegação do app: grupos `(auth)` e `(app)`, tabs, telas placeholder, `src/screens`, `lucide-react-native` e `react-native-svg`.

## Implementação

1. Fazer rebase/merge da branch `navigation-skeleton` na branch de trabalho da Sprint 0.
2. Resolver conflitos com a branch de docs sem perder arquivos de planejamento.
3. Validar que `app/_layout.tsx`, `(auth)` e `(app)` continuam renderizando.
4. Confirmar que as rotas placeholder existem:
   - login
   - register
   - dashboard
   - transactions
   - transactionAdd
   - transactionDetails
   - profile
5. Registrar ajustes necessários para o auth guard real da Sprint 1.

## Validação

- [ ] `npm install` conclui sem conflito de lockfile
- [ ] `npx expo start` abre o app
- [ ] Tabs aparecem
- [ ] Rotas placeholder renderizam sem crash
- [ ] `lucide-react-native` e `react-native-svg` resolvem corretamente

## Gotchas

- Não implementar auth guard nesta task; isso pertence à Sprint 1.
- Não iniciar design final das telas placeholder; elas serão substituídas por screens reais.

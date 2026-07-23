# Task 06 — Spike de Auth Persistence e Storage

## Contexto

Os maiores riscos técnicos da stack Expo + Firebase são persistência de sessão no React Native e upload de arquivo para Firebase Storage. Esta task valida ambos antes das sprints de feature.

## Implementação

1. Configurar Auth com persistência em AsyncStorage.
2. Criar usuário/login manual de teste.
3. Fechar/reabrir/recarregar o app e confirmar sessão persistida.
4. Selecionar um arquivo pequeno usando picker temporário ou mock de URI.
5. Fazer upload mínimo para `receipts/{uid}/spike/...`.
6. Obter URL/metadados e apagar o arquivo de teste.
7. Documentar qualquer ajuste necessário para a implementação final.

## Validação

- [ ] Sessão sobrevive a reload do app
- [ ] Upload para Storage conclui
- [ ] URL/metadados são obtidos
- [ ] Arquivo de teste pode ser removido
- [ ] Falhas e decisões ficam anotadas no README da sprint

## Gotchas

- Este spike não precisa de UI final.
- Se o Firebase JS SDK falhar no Expo Go, avaliar Expo Dev Client + `@react-native-firebase`.
- Storage pode exigir projeto Firebase com Blaze habilitado.

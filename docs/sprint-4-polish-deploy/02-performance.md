# Task 02 — Performance

| | |
| --- | --- |
| **Sprint** | [Sprint 4](./README.md) |
| **Owner** | Dev 3 (Nav & Integration) |
| **Duração** | 1.5 dia |
| **Branch** | `dev3-nav/performance` |
| **Depende de** | Sprint 3 |

---

## Contexto

"Boas práticas de otimização de performance e usabilidade" (spec). Foco na lista (maior volume) e no cold start.

## Ações

- **FlatList:** `getItemLayout` (item de altura fixa), `windowSize`, `maxToRenderPerBatch`, `removeClippedSubviews`
- **`React.memo`** em `TransactionItem`, KPIs e gráficos; `useCallback` nos handlers passados à lista
- **Imagens de anexo:** cache (`expo-image` em vez de `Image` p/ cache/memória)
- **Cold start:** reduzir trabalho no boot; splash até auth resolver; lazy do que não é crítico
- **Agregações:** já memoizadas (S2-05); confirmar que não recomputam à toa
- Medir antes/depois (DevTools/Flipper ou `performance.now()` nos pontos quentes)

## Validação

- [x] Lista fluida com 300+ itens
- [x] Scroll infinito sem travar ao carregar página
- [x] Sem re-render em cascata ao digitar na busca (só o input)
- [x] Cold start aceitável
- [x] Nota antes/depois no [`docs/perf.md`](../perf.md)

Evidência (2026-08-29): `npm run lint`, `npx tsc --noEmit` e `npm test` (290 testes) passaram.

Antes/depois no Node com `npx vitest run src/components/renderBudget.test.tsx`: re-renders do dashboard
de 6/3/3/3 → 2/1/1/1 por ciclo de refresh, e digitar "mercado" custa 0 render da tela e 0 re-render
da linha, com só 1 render após o debounce.

Validação em emulador `Pixel_7a` (Android 17, x86_64) com build release e conta de 320 transações:

- **Pintura do dashboard.** Havia uma janela em branco de 12 a 16 s entre o skeleton de carga sumir
  e o conteúdo aparecer. O skeleton de entrada cobre essa janela e a reamostragem da linha do saldo
  (320 → 60 pontos plotados) antecipou a pintura de ~18 s para ~14 s. Em 5 cold starts amostrados
  aos 15 s: 1/5 com conteúdo antes, **5/5 depois**.
- **Scroll infinito.** 90 flings percorreram as 16 páginas até "Você chegou ao fim da lista", sem
  erro no rodapé em nenhum checkpoint.
- **Lista.** 60 flings na lista de 320 itens: p50 89 ms contra p50 150 ms do app Configurações do
  próprio Android medido no mesmo emulador. O pipeline gráfico do emulador (GPU por software) janka
  tudo, inclusive apps do sistema; a leitura possível é comparativa, e a lista rola melhor que o
  controle nativo.
- **Cold start.** `TotalTime` de ~3,9 s até o primeiro frame (splash), estável antes e depois — é
  tempo nativo, anterior ao JS.
- **Digitação na busca.** 43 frames desenhados ao digitar "mercado", com a lista filtrando de 20
  para 19 resultados: consistente com "só o input redesenha por tecla".

Números, método de medição e classificação de frame em [`docs/perf.md`](../perf.md#medição-em-emulador-2026-08-29).

## Gotchas

1. **`expo-image`** dá cache de disco/memória grátis — trocar `Image` nos anexos/thumbnails.
2. Cuidado com funções inline recriadas por render passadas ao `FlatList` — usar `useCallback`.
3. **`getItemLayout` precisa somar a altura do `ListHeaderComponent`** e o padding do
   `contentContainerStyle` ao offset. Foi por ignorar isso que ele saiu na S3-08 (`d9aab90`): o
   `VirtualizedList` compara esse offset com as métricas reais das células medidas, que já incluem
   ambos. Detalhe em [`docs/perf.md`](../perf.md#decisão-por-que-o-getitemlayout-voltou).
4. O `memo` dos gráficos só segura se o `value` dos contextos for memoizado — senão o provider muda
   de identidade a cada render e re-renderiza todos os consumidores.
5. A reamostragem do `BalanceLineChart` vale só para a plotagem: eixo e rótulo de acessibilidade
   continuam calculados sobre a série completa.

# Performance — nota antes/depois

Referente à [Task 02 — Performance](./sprint-4-polish-deploy/02-performance.md) (Sprint 4).
Foco: a lista de transações (maior volume), o dashboard (maior custo de render) e o cold start.

## Como reproduzir as medições

| Medição | Comando |
| --- | --- |
| Re-renders de KPIs, gráficos, linha da lista e digitação na busca | `npx vitest run src/components/renderBudget.test.tsx` |
| Pintura do dashboard, fps, scroll e cold start | emulador — ver [Medição em emulador](#medição-em-emulador-2026-08-29) |

A primeira roda no Node (V8, desktop) e conta renders, não tempo: serve para comparar
**antes/depois** do mesmo código, não para prever número absoluto no aparelho.

Ambiente das medições abaixo: Windows 11, Node v24.14.0, Vitest 4.1.10; emulador `Pixel_7a`
(`sdk_gphone16k_x86_64`, Android 17) com build release e conta de 320 transações.

## O que mudou

### Lista (`TransactionsScreen`)

- `getItemLayout` voltou, agora **somando o padding do conteúdo e a altura do cabeçalho ao offset**.
- `removeClippedSubviews` ligado só no Android (no iOS derruba célula visível).
- `updateCellsBatchingPeriod={50}` explícito junto de `initialNumToRender`/`maxToRenderPerBatch`/`windowSize`.
- `TransactionItem` aceita `onLayout` — é assim que a primeira linha é medida, sem `View` extra
  envolvendo todas as linhas.
- `TransactionItem` trocou `CATEGORIES.find(...)` por `CATEGORY_LABEL_MAP` (busca linear por linha
  renderizada → lookup direto). O mesmo mapa agora atende dashboard, gráfico de pizza e chips de filtro.

### Dashboard

- `React.memo` em `KpiCard`, `SummaryTile`, `ExpenseBarChart`, `CategoryPieChart` e `BalanceLineChart`.
- As props já eram estáveis (séries memoizadas em `useDashboardData`, ícones em escopo de módulo,
  estilos memoizados por tema), então o `memo` corta o re-render sem mudança de API.
- **`BalanceLineChart` reamostra a série acima de 60 pontos.** `balanceOverTime` devolve um ponto
  por transação: com 320 transações o `LineChart` montava um path SVG curvo de 320 pontos numa área
  de plotagem de ~327 px — mais pontos do que pixels. A reamostragem é uniforme e preserva as pontas
  da série; a escala do eixo e o rótulo de acessibilidade continuam sendo calculados sobre a série
  **completa**, então nem o eixo nem a descrição para leitor de tela perdem informação.
- **Skeleton de entrada.** Enquanto as `AnimatedSection` entram, a tela fica sobreposta por um
  `DashboardSkeleton` (`pointerEvents="none"`), removido quando a última seção termina de animar.
  Sem ele havia uma janela de vários segundos em que o conteúdo estava montado mas ainda perto de
  `opacity: 0` — ver [Pintura do dashboard](#pintura-do-dashboard--antesdepois).

### Contextos

- `AuthContext` e `TransactionContext` memoizam o `value` e envolvem as ações em `useCallback`.
  Antes, cada render do provider criava um objeto novo e re-renderizava **todos** os consumidores —
  o que anularia o `memo` do dashboard e da lista.

### Imagens de anexo

- `AttachmentList` usa `Image` do `expo-image` no thumbnail e no preview, com
  `cachePolicy="memory-disk"` e `recyclingKey`. Cache de memória e disco de graça: a URL assinada do
  Storage não é rebaixada a cada montagem da lista.

### Cold start

- `SplashScreen.hideAsync()` era chamado a cada mudança de rota e antes do redirect terminar. Agora
  roda **uma vez**, só depois que o grupo montado corresponde ao estado de auth — a splash cobre o
  boot inteiro em vez de piscar a tela errada por um frame.
- `preventAutoHideAsync()`/`hideAsync()` com `.catch()`: a promise rejeita quando a splash já sumiu,
  e isso não é erro do app.

## Antes/depois — re-renders

Cenário: o dashboard troca de estado (ex.: `refreshing` no pull-to-refresh) **sem** dados novos.
Contagem de renders de cada componente após a montagem + 2 atualizações do pai.

| Componente | Antes | Depois |
| --- | --- | --- |
| `KpiCard` + `SummaryTile` (2 instâncias) | 6 | 2 |
| `ExpenseBarChart` | 3 | 1 |
| `CategoryPieChart` | 3 | 1 |
| `BalanceLineChart` | 3 | 1 |
| `TransactionItem` (mesma transação) | 1 | 1 |

10 renders de componente evitados por ciclo de refresh. Os gráficos são os mais caros da tela
(SVG + animação de 400 ms), e eram remontados a cada toggle de estado.

`TransactionItem` já estava memoizado desde a Sprint 3 — a medição confirma que continua assim
depois da nova prop `onLayout` (só a primeira linha recebe callback; as demais recebem `undefined`,
que é estável).

### Digitação na busca

O mesmo arquivo trava o orçamento da busca: digitar "mercado" (7 teclas) no `SearchInput` custa
**0 render da tela e 0 re-render da linha da lista**; só depois do debounce de 300 ms a tela
re-renderiza **1 vez**. O estado do texto vive dentro do `SearchInput` — se alguém subir esse estado
para a tela, o teste falha na primeira tecla.

O teste `src/components/renderBudget.test.tsx` trava esses números como orçamento: se alguém remover um
`memo` ou passar uma prop instável, ele falha.

## Custo das agregações

Já eram memoizadas em `useDashboardData` (S2-05), e o que importa é que continuem assim: o teste em
`src/hooks/useDashboardData.test.tsx` conta as chamadas e garante que o conjunto (`totals` +
`byMonth` + `byCategory` + `balanceOverTime` + `topCategory`) roda **uma vez por mudança de lista**,
não por render.

O custo absoluto foi medido uma vez e descartado como fator: ~0,8 ms para 300 transações e ~2,9 ms
para 1000, em Node/V8 no desktop. Com a memoização isso é irrelevante. Sem ela, seria esse custo
**por render** — em Hermes, o suficiente para estourar o frame de 16 ms em sequências como o
pull-to-refresh.

## Decisão: por que o `getItemLayout` voltou

Ele existiu na S3-08 e foi removido em `d9aab90` porque quebrava o scroll. A causa raiz não era o
`fontScale`: o `offset` era calculado como `rowHeight * index`, ignorando o `ListHeaderComponent`.

O `VirtualizedList` usa o valor de `getItemLayout` como offset **absoluto dentro do conteúdo** e o
compara com as métricas reais das células medidas (`ListMetricsAggregator.getCellMetrics`), que
incluem a altura do cabeçalho. Offset sem o cabeçalho → as duas fontes discordam → salto no scroll.

Agora as duas alturas são medidas em runtime (`onLayout` da primeira linha e do cabeçalho de
filtros) e o `getItemLayout` só é fornecido quando ambas existem:

```
offset = LIST_CONTENT_PADDING + headerHeight + rowHeight * index
```

O `LIST_CONTENT_PADDING` entra na conta pelo mesmo motivo: o `contentContainerStyle` tem `padding`,
e a posição medida de cada célula já começa depois dele. A constante alimenta o estilo e o cálculo,
então os dois não podem divergir.

Isso cobre também os casos que mudam a altura do cabeçalho (chips de filtro ativo quebrando linha,
contador de resultados) e o `fontScale` do sistema: qualquer mudança re-mede e reemite o
`getItemLayout`. Coberto por três testes em `TransactionsScreen.test.tsx`.

## Medição em emulador (2026-08-29)

Build **release** (`assembleRelease`, bundle embutido) no emulador `Pixel_7a`, conta `dev@test.com`
com **320 transações**.

O build precisa ser **nativo** (`npm run android` / APK do EAS): `expo-image` é módulo nativo e não
sobe com o Expo Go do SDK padrão. Depois de `npx expo install expo-image`, o app foi adicionado ao
`plugins` do `app.json` — quem já tinha a pasta `android/` gerada precisa de `npx expo prebuild`
antes do próximo `run:android`.

### Método de classificação de frame

Cada execução é um cold start (`am force-stop` → `am start -W`) com **uma única** captura
(`adb exec-out screencap`, RGBA cru) no instante alvo. O frame é classificado por proporção de pixel
na área de conteúdo (18%–90% da altura):

| Estado | Assinatura |
| --- | --- |
| `CONTENT` | mais de 3% de pixel colorido (saturação acima de 24) |
| `SKELETON` | sem cor, mas mais de 1% de cinza `#c2c2c2` (blocos de placeholder) |
| `BLANK` | nem cor nem cinza de placeholder — só o fundo |

Nunca capture o framebuffer em loop para detectar o conteúdo: 10 MB por captura competem com o app
e inflam a medição. Uma captura por execução, um instante por execução.

### Pintura do dashboard — antes/depois

Varredura de um instante por cold start, do mesmo build antes e depois do skeleton de entrada e da
reamostragem da linha do saldo:

| t após `am start` | Antes | Depois |
| --- | --- | --- |
| 8 s | `SKELETON` | pré-montagem |
| 10 s | `SKELETON` | `SKELETON` |
| 12 s | **`BLANK`** | `SKELETON` |
| 14 s | **`BLANK`** | `CONTENT` |
| 16 s | **`BLANK`** | `CONTENT` |
| 18 s | `CONTENT` | `CONTENT` |
| 20–25 s | `CONTENT` | `CONTENT` |

Confirmação em 5 cold starts amostrados em t = 15 s:

| | `CONTENT` aos 15 s |
| --- | --- |
| Antes | 1/5 |
| Depois | **5/5** |

Duas coisas mudaram, e são independentes:

1. **A janela em branco de 12–16 s sumiu.** Um `uiautomator dump` isolado aos 15 s (sem screencap na
   mesma execução) mostrava a árvore do dashboard **montada com dados** enquanto o frame do mesmo
   instante estava vazio: as `AnimatedSection`, configuradas para 350 ms + stagger, se esticam sob a
   carga de boot e mantêm a área perto de `opacity: 0`. O skeleton de entrada cobre exatamente essa
   janela — o usuário passa de "skeleton → nada → conteúdo" para "skeleton → conteúdo".
2. **O conteúdo pinta ~4 s mais cedo** (18 s → 14 s). Isso não é máscara: é a reamostragem da linha
   do saldo, a única mudança que reduz trabalho de render nessa janela (320 → 60 pontos no path SVG
   curvo).

### Cold start

| Marco | Antes | Depois |
| --- | --- | --- |
| `am start -W` → `TotalTime` (1º frame, splash) | 3765–4145 ms | 3875–4438 ms |
| Dashboard pintado | ~18 s | **~14 s** |

O `TotalTime` não muda porque mede o primeiro frame nativo (splash), antes do JS. O ganho está na
janela seguinte.

### FPS da lista — o emulador é o gargalo

60 flings contínuos na lista de 320 itens, com um app do próprio sistema como controle no mesmo
emulador:

| Cenário | Frames | Jank | p50 | p90 | p99 |
| --- | --- | --- | --- | --- | --- |
| Lista do Bytebank (60 flings) | 511 | 99,80% | 89 ms | 150 ms | 250 ms |
| **Controle:** app Configurações do Android (20 flings) | 156 | 100% | **150 ms** | 200 ms | 250 ms |

O controle é o que importa: um app nativo do sistema janka **100%** dos frames com p50 quase o dobro
do Bytebank. O `gfxinfo` ainda reporta `50th gpu percentile: 4950ms`, valor sem sentido físico — a
GPU por software do emulador é o gargalo, não a lista. A leitura possível aqui é comparativa, e ela
é favorável: com `getItemLayout`, `removeClippedSubviews` e `TransactionItem` memoizado, a lista
rola melhor do que um app nativo do sistema no mesmo ambiente.

### Scroll infinito

Partindo de "20 resultados" (1ª página), 90 flings contínuos: as 16 páginas carregaram, a lista
terminou em "Você chegou ao fim da lista" e **nenhum** checkpoint mostrou erro no rodapé. Rolar de
volta ao topo devolve o cabeçalho e a ordenação correta — os offsets do `getItemLayout` não
desalinham a volta.

### Digitação na busca

Digitando "mercado" (7 teclas) com a lista carregada: **43 frames** desenhados no total (p50 85 ms,
5 missed vsync, 27 slow UI thread), e a lista passou de "20 resultados" para "19 resultados" com as
linhas filtradas para `Mercado do bairro`. 43 frames para 7 teclas mais uma troca de resultado é o
número esperado de "só o input redesenha por tecla, e a lista atualiza uma vez após o debounce" — o
mesmo comportamento travado pelo `renderBudget.test.tsx`.

## Gotchas

1. `getItemLayout` **sempre** soma o padding do conteúdo e a altura do cabeçalho. Se um dia o header
   sair do `FlatList`, o `headerHeight` vira 0 naturalmente — mas o `onLayout` precisa ir junto, e o
   padding continua na conta.
2. `removeClippedSubviews` fica no Android. Ligar no iOS já causou célula em branco no RN.
3. Funções inline em `renderItem`/`keyExtractor` derrubam o `memo` do `TransactionItem`: manter
   `useCallback` e função de módulo.
4. `expo-image` usa `contentFit` (não `resizeMode`) e pede rebuild nativo.
5. O `value` dos contextos precisa continuar memoizado: sem isso o `memo` dos gráficos não segura
   nada, porque o objeto do provider muda de identidade a cada render.
6. A reamostragem do `BalanceLineChart` é só de **plotagem**. A escala do eixo e o rótulo de
   acessibilidade continuam vindo da série completa — se alguém passar a calcular a escala sobre os
   pontos reamostrados, o eixo pode cortar o mínimo ou o máximo real.
7. Ao medir estado de tela por screenshot, classifique a partir de **um único frame** e nunca compare
   um `screencap` com um `uiautomator dump` tirado em outro comando: a diferença de alguns segundos
   entre eles já produziu, nesta task, um diagnóstico errado sobre a causa da tela vazia. O caminho
   certo é uma captura por execução e uma varredura de instantes.
8. O `TransactionContext` assina **todas** as transações do usuário via `onSnapshot`, sem limite. É o
   que sustenta o "Saldo atual" (all-time), então limitar a assinatura quebraria o KPI. Se a janela
   de boot voltar a incomodar com volumes maiores, o caminho é mover o saldo para um agregado no
   servidor, não cortar a assinatura no cliente.

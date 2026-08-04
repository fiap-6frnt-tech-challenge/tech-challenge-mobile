# Task 04 — Animações `Animated` entre seções

| | |
| --- | --- |
| **Sprint** | [Sprint 2](./README.md) |
| **Owner** | Dev 2 (UI & DS) |
| **Duração** | 2 dias |
| **Branch** | `dev2-ui/animated-sections` |
| **Depende de** | Task 03 |
| **Desbloqueia** | requisito de animação da spec |

---

## Contexto

**Requisito literal da spec:** "Implementar animações para transições entre seções do dashboard utilizando **`Animated`** (React Native)". Usamos a `Animated` API nativa do RN (não Reanimated) para atender à letra do requisito.

## O que animar

O dashboard tem seções (KPIs → gráfico de barras → pizza → linha). Animações:

1. **Entrada em cascata (stagger):** ao montar/refresh, cada seção faz fade-in + slide-up sequencial com `Animated.stagger`.
2. **Troca de seção (tab/segmented):** se usarmos um segmented control p/ alternar entre "Visão geral" e "Por categoria", transição com `Animated.timing` (fade/translate) entre as views.
3. **Pull-to-refresh:** re-dispara o stagger.

## Implementação (esboço)

```tsx
const AnimatedSection = ({ index, children }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay: index * 120, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, delay: index * 120, useNativeDriver: true }),
    ]).start();
  }, []);

  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
};
```

Expor um método `replay()` (via ref/callback) para o pull-to-refresh re-animar.

## Entregue

| Arquivo | Papel |
| --- | --- |
| `src/hooks/useReduceMotion.ts` | Lê `AccessibilityInfo.isReduceMotionEnabled()` e assina `reduceMotionChanged` |
| `src/components/ui/motion/motion.ts` | Tokens de duração/stagger/deslocamento + easings |
| `src/components/ui/motion/AnimatedSection.tsx` | Fade-in + slide-up escalonado; handle `replay()` por seção |
| `src/components/ui/motion/AnimatedSectionGroup.tsx` | Provider sem UI; `replay()` por `ref` **ou** pelo hook `useAnimatedSectionGroup()` |
| `src/components/ui/motion/AnimatedSwitcher.tsx` | Troca de seção (fade-out -> swap -> fade-in + slide) |
| `src/components/ui/SegmentedControl.tsx` | Abas "Visão geral"/"Por categoria" com indicador deslizante |

Stories: `ui/motion/AnimatedSection` (`Cascade`, `PullToRefresh`, `ReduceMotion`, `AllStates`),
`ui/motion/AnimatedSwitcher` (`WithStaggeredSections`, `AllStates`) e `ui/SegmentedControl`.
As stories montam as seções reais (KPIs + os 3 gráficos), não placeholders.

**Uso previsto na Task 06:**

```tsx
const sectionsRef = useRef<AnimatedSectionGroupHandle>(null);

<AnimatedSectionGroup ref={sectionsRef}>
  <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} />}>
    <AnimatedSection index={0}>{/* KPIs */}</AnimatedSection>
    <AnimatedSection index={1}>{/* barras */}</AnimatedSection>
  </ScrollView>
</AnimatedSectionGroup>;

// no fim do refresh:
sectionsRef.current?.replay();
```

## Validação

- [x] Ao abrir o dashboard, seções entram em cascata (fade + slide) — `AnimatedSection` com `delay = index * staggerStep`; story `Cascade`
- [x] Alternar seção (segmented) anima a transição, não corta seco — `AnimatedSwitcher` só troca o conteúdo no meio do fade (render prop recebe o valor **exibido**, não o selecionado)
- [x] Pull-to-refresh re-dispara a animação — `replay()` no `ref` do grupo; story `PullToRefresh`
- [x] 60fps (usar `useNativeDriver: true`) — todas as animações usam driver nativo e só tocam `opacity`/`transform`
- [x] Respeita "reduzir movimento" do SO (`AccessibilityInfo.isReduceMotionEnabled`) — `useReduceMotion()`; com a preferência ligada as seções entram prontas e a troca é instantânea. Cada componente aceita `reduceMotion` como override (stories `ReduceMotion`)

> Verificado estaticamente (`tsc --noEmit`, `eslint`, bundle do Storybook). **Falta rodar em device/emulador:**
> conferir a cascata a olho, medir fps no profiler e ligar "reduzir movimento" no SO.
> A tela do dashboard em si é a Task 06 — aqui a cascata é demonstrada pelas stories.

## Gotchas

1. **`useNativeDriver: true`** só anima `opacity`/`transform` (não `height`/`backgroundColor`) — planejar as animações nesses eixos.
   Por isso o `AnimatedSwitcher` não anima altura: use `minHeight` quando as seções tiverem alturas muito diferentes.
2. Guardar `Animated.Value` em `useRef` (não recriar por render). **Ajuste:** o lint do React Compiler
   (`react-hooks/refs`, via `eslint-config-expo`) barra `useRef(new Animated.Value(0)).current` — ler `.current`
   durante o render é erro. Usamos `useState(() => new Animated.Value(0))[0]`, que dá a mesma estabilidade.
   Pela mesma razão (`react-hooks/set-state-in-effect`), o valor exibido pelo `AnimatedSwitcher` em modo
   "reduzir movimento" é derivado no render em vez de sincronizado por efeito.
3. **Reduce motion:** checar `AccessibilityInfo` e pular a animação — a11y (vale nota).
4. A cascata é feita por `delay` em cada seção, não por `Animated.stagger` no pai: assim cada seção é dona do seu
   `Animated.Value` e pode montar/desmontar sem quebrar a sequência (o esboço acima já usava `delay`).

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

## Validação

- [ ] Ao abrir o dashboard, seções entram em cascata (fade + slide)
- [ ] Alternar seção (segmented) anima a transição, não corta seco
- [ ] Pull-to-refresh re-dispara a animação
- [ ] 60fps (usar `useNativeDriver: true`)
- [ ] Respeita "reduzir movimento" do SO (`AccessibilityInfo.isReduceMotionEnabled`) — encurta/desliga animação

## Gotchas

1. **`useNativeDriver: true`** só anima `opacity`/`transform` (não `height`/`backgroundColor`) — planejar as animações nesses eixos.
2. Guardar `Animated.Value` em `useRef` (não recriar por render).
3. **Reduce motion:** checar `AccessibilityInfo` e pular a animação — a11y (vale nota).

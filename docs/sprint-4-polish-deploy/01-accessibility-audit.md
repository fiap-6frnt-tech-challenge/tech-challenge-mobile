# Task 01 — Auditoria de acessibilidade

| | |
| --- | --- |
| **Sprint** | [Sprint 4](./README.md) |
| **Owner** | Dev 2 (UI & DS) |
| **Duração** | 1.5 dia |
| **Branch** | `dev2-ui/a11y-audit` |
| **Depende de** | Sprints 1-3 |

---

## Contexto

A spec valoriza acessibilidade. Varredura final de todas as telas com leitor de tela e checagem de contraste.

## Checklist

- [ ] Todo `Pressable`/`TouchableOpacity` tem `accessibilityRole` + `accessibilityLabel`
- [ ] Inputs com label associado e erro anunciado (`accessibilityLiveRegion`)
- [ ] Gráficos têm resumo textual (não dependem só de cor)
- [ ] Contraste texto/fundo ≥ 4.5:1 (checar tokens do tema)
- [ ] Ordem de foco lógica; foco visível
- [ ] `reduce motion` respeitado nas animações (S2-04)
- [ ] Tamanhos de toque ≥ 44×44
- [ ] Testar com **TalkBack** (Android) e **VoiceOver** (iOS)

## Validação

- [ ] Navegar o app inteiro só com leitor de tela (login → dashboard → lista → filtrar → nova transação → anexar → logout)
- [ ] Nenhum elemento interativo "mudo"
- [ ] Relatório curto de a11y no repo (`docs/a11y.md`) com o que foi checado

## Gotchas

1. **`accessibilityLabel` em ícones** que são botões — sem texto visível, o leitor precisa do label.
2. Cor de "entrada/saída" precisa de reforço textual (valor com sinal), não só verde/vermelho.

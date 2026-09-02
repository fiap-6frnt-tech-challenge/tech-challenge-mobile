# Task 01 — Auditoria de acessibilidade

|                |                         |
| -------------- | ----------------------- |
| **Sprint**     | [Sprint 4](./README.md) |
| **Owner**      | Dev 1 (Firebase & Data) |
| **Duração**    | 1.5 dia                 |
| **Branch**     | `dev1-fb/a11y-audit`    |
| **Depende de** | Sprints 1-3             |

---

## Contexto

A spec valoriza acessibilidade. Varredura final de todas as telas com leitor de tela e checagem de contraste.

## Checklist

- [x] Todo `Pressable`/`TouchableOpacity` do fluxo de produto tem `accessibilityRole` + `accessibilityLabel`
- [x] Inputs com label associado e erro anunciado (`accessibilityLiveRegion`)
- [x] Gráficos têm resumo textual (não dependem só de cor)
- [x] Contraste texto/fundo ≥ 4.5:1 (checar tokens do tema)
- [ ] Ordem de foco lógica; foco visível
- [x] `reduce motion` respeitado nas animações (S2-04)
- [x] Tamanhos de toque ≥ 44×44
- [ ] Testar com **TalkBack** (Android) e **VoiceOver** (iOS)

## Validação

- [ ] Navegar o app inteiro só com leitor de tela (login → dashboard → lista → filtrar → nova transação → anexar → logout)
- [x] Nenhum elemento interativo "mudo"
- [x] Relatório curto de a11y no repo (`docs/a11y.md`) com o que foi checado

## Gotchas

1. **`accessibilityLabel` em ícones** que são botões — sem texto visível, o leitor precisa do label.
2. Cor de "entrada/saída" precisa de reforço textual (valor com sinal), não só verde/vermelho.

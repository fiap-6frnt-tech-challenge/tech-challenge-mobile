# Task 06 — Vídeo demo (≤5 min)

| | |
| --- | --- |
| **Sprint** | [Sprint 4](./README.md) |
| **Owner** | Todos |
| **Duração** | 1 dia |
| **Branch** | — |
| **Depende de** | app completo + APK |

---

## Contexto

Entregável obrigatório da spec: vídeo de **até 5 minutos** com as principais funcionalidades. Gravar em device real (tela) com o APK ou Expo Go.

## Roteiro (cobrir os 5 itens exigidos)

| Tempo | Cena | Item da spec |
| --- | --- | --- |
| 0:00-0:40 | Registrar + login (sessão persiste ao reabrir) | **Login e autenticação** |
| 0:40-1:40 | Nova transação com sugestão de categoria + validação; editar uma existente | **Adicionar/Editar transações** |
| 1:40-2:40 | Lista: scroll infinito + filtros (data/categoria/tipo) + busca | **Visualizar e filtrar transações** |
| 2:40-3:40 | Anexar recibo (foto + PDF) → progresso → persistência | **Upload de anexos** |
| 3:40-4:30 | Dashboard: gráficos + animação entre seções; mostrar dado no Firestore/Storage no console | **Integração com Firebase** |
| 4:30-5:00 | Fecho: logout + destaque de segurança (rules) | — |

## Produção

- Gravar tela do device (Android: `scrcpy`/gravador nativo; iOS: gravação de tela)
- Narração ou legendas curtas explicando cada etapa
- Mostrar o **console do Firebase** (dados aparecendo no Firestore/Storage) reforça "integração com Firebase"
- Editar p/ ficar **≤5 min** (requisito rígido)

## Validação

- [ ] Vídeo ≤5 min
- [ ] Todos os 5 itens da spec aparecem
- [ ] Áudio/legenda claros; app fluido na gravação
- [ ] Link do vídeo no README

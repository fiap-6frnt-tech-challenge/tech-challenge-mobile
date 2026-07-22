# Task 03 — Modelo Firestore + `firestore.rules`

| | |
| --- | --- |
| **Sprint** | [Sprint 1](./README.md) |
| **Owner** | Dev 1 (Firebase & Data) |
| **Duração** | 1.5 dia |
| **Branch** | `dev1-fb/firestore-model-rules` |
| **Depende de** | S0-02 |
| **Desbloqueia** | Task 04 (transactions.service) |

---

## Contexto

Define a estrutura de dados e a **segurança** (requisito da spec). Usamos **subcoleção por usuário** — `users/{uid}/transactions/{txId}` — o que simplifica rules e queries (todo acesso é naturalmente escopado por `uid`).

## Modelo

```
users/{uid}                         ← perfil { name, email, createdAt }
  └── transactions/{txId}           ← { type, amount, date, description, category, attachments[], createdAt }
```

Documento de transação (`attachments` como array de refs; arquivos ficam no Storage — S3-02):

```jsonc
{
  "type": "withdrawal",
  "amount": 42.9,
  "date": "2026-07-20T00:00:00.000Z",
  "description": "Uber para o aeroporto",
  "category": "transporte",
  "attachments": [{ "id": "...", "name": "recibo.pdf", "url": "...", "path": "...", "size": 12345, "contentType": "application/pdf" }],
  "createdAt": "<serverTimestamp>"
}
```

## `firestore.rules`

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;

      match /transactions/{txId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

Deploy: `firebase deploy --only firestore:rules` (ou pelo console). Commitar `firestore.rules` no repo.

## Índices

Filtros do Sprint 3 (ex.: `where('type') + orderBy('date')`) exigirão **índices compostos**. O Firestore retorna erro com link direto p/ criar — documentar no README. Adicionar `firestore.indexes.json` conforme surgirem.

## Validação

- [ ] Usuário lê/escreve só a própria subcoleção
- [ ] Acesso a `users/{outro-uid}/transactions` é **negado** (testar no simulador de rules)
- [ ] `firestore.rules` commitado

## Gotchas

1. **Subcoleção vs coleção raiz com `userId`**: escolhemos subcoleção — rules mais simples e sem risco de esquecer `where('userId','==',uid)` em alguma query.
2. Ativar o **emulador do Firestore** localmente ajuda a testar rules sem gastar quota (opcional).

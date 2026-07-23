# Task 02 — `storage.service` + `storage.rules`

| | |
| --- | --- |
| **Sprint** | [Sprint 3](./README.md) |
| **Owner** | Dev 1 (Firebase & Data) |
| **Duração** | 2 dias |
| **Branch** | `dev1-fb/storage-service-rules` |
| **Depende de** | S0-02 (Storage habilitado) |
| **Desbloqueia** | Task 11 (fluxo de anexos) |

---

## Contexto

Upload de recibos para o **Firebase Storage** (requisito da spec). Camada de serviço + regras de segurança por usuário. Este é o item de maior risco técnico do sprint (upload de arquivo local no Expo Go) — validar em device cedo.

## Implementação

`src/services/storage.service.ts`:

```ts
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

const MAX = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export async function uploadReceipt(
  uid: string, txId: string, localUri: string, name: string, contentType: string,
  onProgress?: (pct: number) => void,
) {
  if (!ALLOWED.includes(contentType)) throw new Error('Tipo não permitido');

  const res = await fetch(localUri);
  const blob = await res.blob();
  if (blob.size > MAX) throw new Error('Arquivo excede 5MB');

  const path = `receipts/${uid}/${txId}/${Date.now()}-${name}`;
  const task = uploadBytesResumable(ref(storage, path), blob, { contentType });

  return new Promise<{ url: string; path: string; size: number }>((resolve, reject) => {
    task.on('state_changed',
      (s) => onProgress?.(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      reject,
      async () => resolve({ url: await getDownloadURL(task.snapshot.ref), path, size: blob.size }),
    );
  });
}

export const deleteReceipt = (path: string) => deleteObject(ref(storage, path));
```

## `storage.rules`

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /receipts/{uid}/{txId}/{file} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if request.auth != null && request.auth.uid == uid
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*|application/pdf');
      allow delete: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## Validação

- [ ] Upload de PNG/JPG (galeria/câmera) e PDF funciona **em device real**
- [ ] Progresso reportado (0→100%)
- [ ] `getDownloadURL` retorna URL exibível
- [ ] Arquivo >5MB ou tipo inválido rejeitado (service **e** rules)
- [ ] `delete` remove do bucket
- [ ] Outro usuário não lê/escreve em `receipts/{uid alheio}`

## Gotchas

1. **Blob no Expo Go/Hermes:** o padrão `fetch(uri) → blob → uploadBytesResumable` é o que funciona de forma confiável. Testar em **device real** cedo (não só emulador) — risco #2 do PLAN.
2. **`uploadBytesResumable`** (não `uploadBytes`) p/ ter progresso.
3. Validar tamanho/tipo **duas vezes**: no service (UX rápida) e nas rules (segurança real).
4. Se o gate S0 acionou `@react-native-firebase`, o upload usa `putFile(localUri)` (mais simples, sem blob) — ajustar o service.

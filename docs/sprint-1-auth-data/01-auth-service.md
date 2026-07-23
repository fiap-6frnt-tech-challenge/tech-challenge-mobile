# Task 01 — `auth.service` (Firebase Auth)

| | |
| --- | --- |
| **Sprint** | [Sprint 1](./README.md) |
| **Owner** | Dev 1 (Firebase & Data) |
| **Duração** | 1 dia |
| **Branch** | `dev1-fb/auth-service` |
| **Depende de** | S0-02 (firebase.ts) |
| **Desbloqueia** | Task 02 (AuthContext) |

---

## Contexto

Encapsula o Firebase Auth numa camada de serviço — telas e context nunca chamam `firebase/auth` direto. Registro também cria o doc de perfil em `users/{uid}`.

## Implementação

`src/services/auth.service.ts`:

```ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export const authService = {
  async signUp(email: string, password: string, name: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, 'users', cred.user.uid), {
      name, email, createdAt: serverTimestamp(),
    });
    return cred.user;
  },
  signIn: (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password).then((c) => c.user),
  signOut: () => fbSignOut(auth),
  subscribe: (cb: (u: User | null) => void) => onAuthStateChanged(auth, cb),
};
```

## Validação

- [ ] `signUp` cria usuário no Auth + doc `users/{uid}`
- [ ] `signIn`/`signOut` funcionam
- [ ] Erros do Firebase (`auth/email-already-in-use`, `auth/wrong-password`) propagam para tratamento na UI

## Gotchas

1. Mapear códigos de erro do Firebase → mensagens pt-BR (fazer na UI/Task 06, service só propaga).
2. `serverTimestamp()` p/ `createdAt` (relógio do servidor, não do device).

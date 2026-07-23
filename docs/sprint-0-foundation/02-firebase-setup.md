# Task 02 — Setup Firebase (console) + `firebase.ts` + env

| | |
| --- | --- |
| **Sprint** | [Sprint 0 — Foundation](./README.md) |
| **Owner** | Dev 1 (Firebase & Data) |
| **Duração estimada** | 1 dia |
| **Branch recomendada** | `dev1-fb/firebase-init` |
| **Depende de** | Conta Google |
| **PR só abre** | Após `firebase.ts` inicializar Auth+Firestore+Storage sem erro |

---

## Dependências

- **Bloqueia esta task:** nada.
- **Esta task desbloqueia:** todo o Sprint 1 (auth, Firestore) e o gate (Task 08).

---

## Contexto

Cria o projeto no **Firebase Console** e o cliente SDK no app. Usamos o **Firebase JS SDK** (roda em Expo Go, sem build nativo). Persistência de auth via AsyncStorage é crítica (risco #1 do PLAN).

---

## Implementação

### 1. Firebase Console

1. Criar projeto `bytebank-mobile`.
2. **Authentication** → habilitar provider **Email/Password**.
3. **Firestore Database** → criar em modo produção (rules restritivas — Task S1-03).
4. **Storage** → habilitar (rules — Task S3-02).
5. **Project settings → Your apps → Web app** (`</>`): registrar e copiar o objeto `firebaseConfig`.

### 2. Dependências

```bash
npx expo install firebase @react-native-async-storage/async-storage
```

### 3. `.env` (chaves públicas do cliente — prefixo `EXPO_PUBLIC_`)

`.env.example` (commitar) e `.env` (gitignore):

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=xxx
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=bytebank-mobile.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=bytebank-mobile
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=bytebank-mobile.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
EXPO_PUBLIC_FIREBASE_APP_ID=xxx
```

### 4. `src/services/firebase.ts`

```ts
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
export const storage = getStorage(app);
```

---

## Validação

- [ ] App importa `auth`/`db`/`storage` sem crash no boot
- [ ] Um `createUserWithEmailAndPassword` de teste cria usuário no console
- [ ] Após login de teste + reload do app, `auth.currentUser` continua preenchido (persistência ✅)
- [ ] `.env.example` commitado; `.env` no `.gitignore`

---

## Gotchas

1. **`initializeAuth` (não `getAuth`)** no RN — só ele aceita `persistence`. `getAuth` não persiste e loga o warning "Auth state will default to memory persistence".
2. **`EXPO_PUBLIC_`** é obrigatório para a env chegar no bundle do cliente. Essas chaves são públicas por design (segurança real fica nas **rules**, não nas chaves).
3. **`storageBucket`**: alguns projetos novos usam `*.firebasestorage.app` em vez de `*.appspot.com` — copiar exatamente o do console.
4. Não commitar `.env` real. As chaves não são segredo, mas evita poluição/rotação acidental.

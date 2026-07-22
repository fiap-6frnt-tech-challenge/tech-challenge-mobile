# Task 06 — Skeletons de Context (`AuthContext`, `TransactionContext`)

| | |
| --- | --- |
| **Sprint** | [Sprint 0 — Foundation](./README.md) |
| **Owner** | Dev 3 (Nav & Integration) |
| **Duração estimada** | 0.5 dia |
| **Branch recomendada** | `dev3-nav/context-skeletons` |
| **Depende de** | [Task 04](./04-navigation-skeleton.md) |
| **PR só abre** | Após providers montarem e `useAuth()`/`useTransactions()` retornarem o shape tipado |

---

## Dependências

- **Bloqueia esta task:** Task 04 (providers no root layout).
- **Esta task desbloqueia:** S1-02 (AuthContext real), S1-07 (TransactionContext real).

---

## Contexto

Cria os contexts vazios (com tipos e hooks de acesso) para o app montar. A lógica real entra no Sprint 1 — aqui só definimos a interface pública e os providers, satisfazendo o requisito de **Context API** como base de estado global.

---

## Implementação

### `src/contexts/AuthContext.tsx`

```tsx
import { createContext, useContext, ReactNode } from 'react';
import type { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // S1-02 preenche com onAuthStateChanged + auth.service
  const value: AuthState = {
    user: null,
    loading: false,
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {},
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

### `src/contexts/TransactionContext.tsx`

Mesma forma: estado `{ transactions, loading, error, create, update, remove, refresh }` com `useReducer` (ações no-op por enquanto). Hook `useTransactions()` com guard de provider.

---

## Validação

- [ ] `useAuth()` fora do provider lança erro claro
- [ ] `useTransactions()` retorna o shape tipado
- [ ] App monta com ambos providers (via Task 04) sem crash

---

## Gotchas

1. **Guard `if (!ctx) throw`** evita `undefined` silencioso — padrão obrigatório em todo context.
2. Tipar o context como `T | null` e checar no hook (melhor que default fake que mascara bug de provider ausente).

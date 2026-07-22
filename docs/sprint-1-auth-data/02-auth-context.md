# Task 02 — `AuthContext`

| | |
| --- | --- |
| **Sprint** | [Sprint 1](./README.md) |
| **Owner** | Dev 1 (Firebase & Data) |
| **Duração** | 1 dia |
| **Branch** | `dev1-fb/auth-context` |
| **Depende de** | Task 01 |
| **Desbloqueia** | Task 06 (telas), Task 08 (rotas protegidas) |

---

## Contexto

Preenche o skeleton do `AuthContext` (S0-06) com estado real de sessão via `onAuthStateChanged`. É a fonte única de verdade de auth — **exigência de Context API da spec**.

## Implementação

`src/contexts/AuthContext.tsx`:

```tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => authService.subscribe((u) => {
    setUser(u);
    setLoading(false);
  }), []);

  const value: AuthState = {
    user,
    loading,
    signIn: async (e, p) => { await authService.signIn(e, p); },
    signUp: async (e, p, n) => { await authService.signUp(e, p, n); },
    signOut: () => authService.signOut(),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

## Validação

- [ ] `loading = true` no boot até `onAuthStateChanged` resolver
- [ ] Após `signIn`, `user` reflete o usuário logado sem reload manual
- [ ] `signOut` zera `user`
- [ ] `subscribe` faz unsubscribe no unmount (retorno do `useEffect`)

## Gotchas

1. **`loading` inicial `true`** é o que evita "flash" da tela de login antes da sessão persistida resolver.
2. `subscribe` retorna a função de unsubscribe — retorná-la direto do `useEffect`.

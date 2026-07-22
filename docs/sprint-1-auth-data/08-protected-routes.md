# Task 08 — Wiring de rotas protegidas

| | |
| --- | --- |
| **Sprint** | [Sprint 1](./README.md) |
| **Owner** | Dev 3 (Nav & Integration) |
| **Duração** | 1 dia |
| **Branch** | `dev3-nav/protected-routes` |
| **Depende de** | Task 02 (AuthContext) |
| **Desbloqueia** | segurança de navegação |

---

## Contexto

Redireciona o usuário conforme o estado de auth: sem sessão → `(auth)/login`; com sessão → `(app)`. Enquanto `loading`, mostra splash (evita flash de tela errada).

## Implementação

Guard no `app/_layout.tsx` (dentro dos providers), usando `useSegments` + `useRouter` do Expo Router:

```tsx
function AuthGate({ children }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) router.replace('/(auth)/login');
    else if (user && inAuthGroup) router.replace('/(app)');
  }, [user, loading, segments]);

  if (loading) return <SplashScreen />;
  return children;
}
```

## Validação

- [ ] App fechado e reaberto com sessão → abre direto no `(app)` (sem piscar login)
- [ ] Sem sessão, tentar acessar `(app)` → redireciona p/ login
- [ ] Após logout, volta p/ login imediatamente
- [ ] Durante `loading`, mostra splash (não a tela de login)

## Gotchas

1. **Não redirecionar enquanto `loading`** — senão o usuário com sessão persistida vê um flash da tela de login.
2. `router.replace` (não `push`) p/ não empilhar histórico de auth.
3. O guard roda em `useEffect` após render — por isso o `SplashScreen` cobre o intervalo.

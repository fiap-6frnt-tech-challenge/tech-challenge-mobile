# Task 04 — Navegação (Expo Router: grupos `(auth)`/`(app)` + tabs)

| | |
| --- | --- |
| **Sprint** | [Sprint 0 — Foundation](./README.md) |
| **Owner** | Dev 3 (Nav & Integration) |
| **Duração estimada** | 1 dia |
| **Branch recomendada** | `dev3-nav/navigation-skeleton` |
| **Depende de** | [Task 01](./01-bootstrap-expo.md) |
| **PR só abre** | Após navegar entre login placeholder e tabs |

---

## Dependências

- **Bloqueia esta task:** Task 01.
- **Esta task desbloqueia:** Task 06 (context skeletons) e todas as telas.

---

## Contexto

Estrutura de rotas com Expo Router usando **route groups**: `(auth)` público e `(app)` protegido. O guard real (redirect por sessão) entra no Sprint 1; aqui montamos o esqueleto e os providers.

---

## Implementação

### Estrutura `app/`

```
app/
├── _layout.tsx            ← providers (Theme, Auth, Transaction) + Stack
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx          ← placeholder
│   └── register.tsx       ← placeholder
└── (app)/
    ├── _layout.tsx        ← Tabs: Dashboard | Transações
    ├── index.tsx          ← Dashboard placeholder
    └── transactions/
        ├── index.tsx      ← Lista placeholder
        ├── new.tsx        ← placeholder
        └── [id].tsx       ← placeholder
```

### `app/_layout.tsx`

```tsx
import { Stack } from 'expo-router';
import { ThemeProvider } from '@/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { TransactionProvider } from '@/contexts/TransactionContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TransactionProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </TransactionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

### `app/(app)/_layout.tsx` — Tabs

`Tabs` com duas telas: Dashboard (`index`) e Transações (`transactions`). Ícones via `@expo/vector-icons`. `tabBarAccessibilityLabel` em cada aba.

---

## Validação

- [ ] App abre e navega para `(auth)/login` (placeholder)
- [ ] `(app)` mostra tab bar com Dashboard e Transações
- [ ] `router.push('/transactions/new')` abre a tela de nova transação
- [ ] Providers montam sem erro (contexts vazios da Task 06)

---

## Gotchas

1. **Route groups `(nome)`** não aparecem na URL — servem só para agrupar layout/guard.
2. Ordem dos providers: `Theme` → `Auth` → `Transaction` (Transaction pode depender de auth futuramente).
3. `headerShown: false` no Stack raiz; cada grupo define seu próprio header/tabs.

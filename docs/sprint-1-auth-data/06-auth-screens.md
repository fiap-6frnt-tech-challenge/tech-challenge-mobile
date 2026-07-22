# Task 06 — Telas Login + Register (RHF + Zod)

| | |
| --- | --- |
| **Sprint** | [Sprint 1](./README.md) |
| **Owner** | Dev 2 (UI & DS) |
| **Duração** | 2 dias |
| **Branch** | `dev2-ui/auth-screens` |
| **Depende de** | Task 02 (AuthContext), Task 05 (DS forms) |
| **Desbloqueia** | fluxo de auth completo |

---

## Contexto

Telas públicas do grupo `(auth)`. Usam `useAuth()` + React Hook Form + Zod. Mapeiam erros do Firebase para mensagens pt-BR.

## Implementação

Instalar: `npx expo install react-hook-form @hookform/resolvers`.

`app/(auth)/login.tsx` (esboço):

```tsx
const { signIn } = useAuth();
const { control, handleSubmit } = useForm({ resolver: zodResolver(loginSchema) });

const onSubmit = async (data) => {
  try {
    await signIn(data.email, data.password);
    // guard (Task 08) redireciona para (app)
  } catch (e) {
    setFormError(mapFirebaseError(e)); // pt-BR
  }
};
```

Schemas em `src/domain/authSchema.ts`:

```ts
export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
export const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Informe seu nome'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Senhas não conferem', path: ['confirm'] });
```

`mapFirebaseError`: `auth/email-already-in-use` → "E-mail já cadastrado"; `auth/invalid-credential` → "E-mail ou senha incorretos"; etc.

## Validação

- [ ] Registrar cria conta e entra no app
- [ ] Login com credencial errada mostra erro pt-BR (não o código bruto)
- [ ] Validação client-side bloqueia submit inválido
- [ ] Link Login ↔ Register funciona
- [ ] Telas navegáveis por leitor de tela

## Gotchas

1. **`KeyboardAvoidingView`** p/ o teclado não cobrir os campos (behavior difere iOS/Android).
2. Botão de submit em `loading` durante a chamada — evita duplo submit.
3. Nunca logar `password`.

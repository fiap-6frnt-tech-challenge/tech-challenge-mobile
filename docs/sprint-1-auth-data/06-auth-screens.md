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

**Escopo estendido:** a tela de Perfil entrou nesta task. O logout é cobrado como critério de aceite da sprint e do projeto (`README.md` da sprint, `PLAN.md` item 12), mas nenhuma task do plano entregava a UI que hospeda esse botão — `(app)/profile` era só rota placeholder.

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

`src/screens/(app)/profile/ProfileScreen.tsx`: mostra nome/e-mail de `useAuth().user` e um botão "Sair da conta" que chama `signOut()`. Enquanto o guard da Task 08 não existir, o redirect é feito na própria tela (`router.replace('/login')`), mesmo padrão usado no sucesso de login/registro.

## Validação

- [x] Registrar cria conta e entra no app — conta criada no Auth + doc `users/{uid}` gravado, com `router.replace('/')` após o sucesso
- [x] Login com credencial errada mostra erro pt-BR (não o código bruto)
- [x] Validação client-side bloqueia submit inválido
- [x] Link Login ↔ Register funciona
- [x] Telas navegáveis por leitor de tela
- [x] Perfil mostra nome e e-mail da sessão
- [x] "Sair da conta" encerra a sessão e volta para o login
- [x] Sessão encerrada continua encerrada ao reabrir o app

## Gotchas

1. **`KeyboardAvoidingView`** p/ o teclado não cobrir os campos (behavior difere iOS/Android).
2. Botão de submit em `loading` durante a chamada — evita duplo submit.
3. Nunca logar `password`.

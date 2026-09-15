import { z } from 'zod';

const emailField = z.string().trim().min(1, 'Informe seu e-mail').pipe(z.email('E-mail inválido'));

const passwordField = z.string().min(6, 'Mínimo 6 caracteres');

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

export const registerSchema = loginSchema
  .extend({
    name: z.string().trim().min(2, 'Informe seu nome'),
    confirm: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((values) => values.password === values.confirm, {
    message: 'Senhas não conferem',
    path: ['confirm'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

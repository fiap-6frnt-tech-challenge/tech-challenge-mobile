import { z } from 'zod';

import { CATEGORIES } from './categories';
import { TRANSACTION_TYPE } from './constants';

const transactionTypes = [
  TRANSACTION_TYPE.DEPOSIT,
  TRANSACTION_TYPE.WITHDRAWAL,
  TRANSACTION_TYPE.TRANSFER,
] as const;

const categoryIds = CATEGORIES.map((category) => category.id) as [
  (typeof CATEGORIES)[number]['id'],
  ...(typeof CATEGORIES)[number]['id'][],
];

export const attachmentSchema = z.object({
  id: z.string().min(1, 'Anexo inválido'),
  url: z.string().url('URL inválida'),
  path: z.string().min(1, 'Caminho do anexo é obrigatório'),
  name: z.string().min(1, 'Nome do anexo é obrigatório'),
  size: z.number().positive('Tamanho do anexo deve ser positivo'),
  mimeType: z.string().min(1, 'Tipo do anexo é obrigatório'),
});

export const transactionFormSchema = z.object({
  type: z.enum(transactionTypes, { message: 'Tipo inválido' }),
  category: z.enum(categoryIds, { message: 'Categoria é obrigatória' }),
  amount: z.number({ message: 'Informe um valor' }).positive('Valor deve ser positivo'),
  date: z
    .string()
    .min(1, 'Data é obrigatória')
    .refine((value) => !value || new Date(value) <= new Date(), {
      message: 'Data não pode ser futura',
    }),
  description: z.string().min(3, 'Mínimo 3 caracteres').max(140, 'Máximo 140 caracteres'),
  attachments: z.array(attachmentSchema).max(5, 'Máximo 5 anexos').optional(),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

import { z } from 'zod';

import { CATEGORIES } from './categories';
import { TRANSACTION_TYPE } from './constants';

export const MAX_TRANSACTION_AMOUNT = 1_000_000;
export const MAX_TRANSACTION_ATTACHMENTS = 5;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const transactionTypes = [
  TRANSACTION_TYPE.DEPOSIT,
  TRANSACTION_TYPE.WITHDRAWAL,
  TRANSACTION_TYPE.TRANSFER,
] as const;

const categoryIds = CATEGORIES.map((category) => category.id) as [
  (typeof CATEGORIES)[number]['id'],
  ...(typeof CATEGORIES)[number]['id'][],
];

function isCalendarDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);

  return (
    parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day
  );
}

function todayISODate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export const attachmentSchema = z.object({
  id: z.string().min(1, 'Anexo inválido'),
  url: z.string().url('URL inválida'),
  path: z.string().min(1, 'Caminho do anexo é obrigatório'),
  name: z.string().min(1, 'Nome do anexo é obrigatório'),
  size: z.number().positive('Tamanho do anexo deve ser positivo'),
  mimeType: z.string().min(1, 'Tipo do anexo é obrigatório'),
});

export const transactionFormSchema = z.object({
  type: z.enum(transactionTypes, { message: 'Selecione o tipo' }),
  category: z.enum(categoryIds, { message: 'Selecione uma categoria' }),
  amount: z
    .number({ message: 'Informe um valor' })
    .positive('Valor deve ser maior que zero')
    .max(MAX_TRANSACTION_AMOUNT, 'Valor máximo é R$ 1.000.000,00'),
  date: z
    .string()
    .min(1, 'Data é obrigatória')
    .refine(isCalendarDate, { message: 'Data inválida' })
    .refine((value) => value <= todayISODate(), { message: 'Data não pode ser futura' }),
  description: z.string().trim().min(3, 'Mínimo 3 caracteres').max(140, 'Máximo 140 caracteres'),
  attachments: z
    .array(attachmentSchema)
    .max(MAX_TRANSACTION_ATTACHMENTS, 'Máximo 5 anexos')
    .optional(),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

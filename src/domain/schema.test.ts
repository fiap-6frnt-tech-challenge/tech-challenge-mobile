import { describe, expect, it } from 'vitest';

import {
  MAX_TRANSACTION_AMOUNT,
  MAX_TRANSACTION_ATTACHMENTS,
  attachmentSchema,
  transactionFormSchema,
} from './schema';

function isoDateOffsetByDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function firstMessage(input: unknown, field: string): string | undefined {
  const result = transactionFormSchema.safeParse(input);
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path[0] === field)?.message;
}

const validInput = {
  type: 'withdrawal',
  category: 'food',
  amount: 42.5,
  date: '2026-01-15',
  description: 'Mercado da esquina',
  attachments: [],
};

const validAttachment = {
  id: 'att-1',
  url: 'https://storage.test/recibo.pdf',
  path: 'receipts/user-1/tx-1/recibo.pdf',
  name: 'recibo.pdf',
  size: 1024,
  mimeType: 'application/pdf',
};

describe('transactionFormSchema valid cases', () => {
  it('validates a complete input', () => {
    expect(transactionFormSchema.parse(validInput)).toMatchObject(validInput);
  });

  it('accepts missing optional attachments', () => {
    const { attachments, ...withoutAttachments } = validInput;
    void attachments;

    expect(() => transactionFormSchema.parse(withoutAttachments)).not.toThrow();
  });

  it.each(['deposit', 'withdrawal', 'transfer'])('accepts type %s', (type) => {
    expect(() => transactionFormSchema.parse({ ...validInput, type })).not.toThrow();
  });

  it('accepts exactly 5 attachments', () => {
    const attachments = Array.from({ length: MAX_TRANSACTION_ATTACHMENTS }, (_, index) => ({
      ...validAttachment,
      id: `att-${index}`,
      path: `receipts/user-1/tx-1/recibo-${index}.pdf`,
    }));

    expect(() => transactionFormSchema.parse({ ...validInput, attachments })).not.toThrow();
  });

  it('accepts today as the transaction date', () => {
    expect(() =>
      transactionFormSchema.parse({ ...validInput, date: isoDateOffsetByDays(0) })
    ).not.toThrow();
  });

  it('accepts the maximum amount', () => {
    expect(() =>
      transactionFormSchema.parse({ ...validInput, amount: MAX_TRANSACTION_AMOUNT })
    ).not.toThrow();
  });

  it('accepts the smallest positive amount in cents', () => {
    expect(() => transactionFormSchema.parse({ ...validInput, amount: 0.01 })).not.toThrow();
  });

  it('trims the description before validating length', () => {
    const parsed = transactionFormSchema.parse({
      ...validInput,
      description: '   Mercado da esquina   ',
    });

    expect(parsed.description).toBe('Mercado da esquina');
  });

  it('accepts a description with exactly 140 characters', () => {
    expect(() =>
      transactionFormSchema.parse({ ...validInput, description: 'a'.repeat(140) })
    ).not.toThrow();
  });
});

describe('transactionFormSchema invalid cases', () => {
  it('rejects unknown category', () => {
    expect(() => transactionFormSchema.parse({ ...validInput, category: 'inexistente' })).toThrow();
  });

  it('rejects description with fewer than 3 characters', () => {
    expect(() => transactionFormSchema.parse({ ...validInput, description: 'ab' })).toThrow();
  });

  it('rejects description with more than 140 characters', () => {
    expect(() =>
      transactionFormSchema.parse({ ...validInput, description: 'a'.repeat(141) })
    ).toThrow();
  });

  it('rejects a description with only whitespace', () => {
    expect(() => transactionFormSchema.parse({ ...validInput, description: '     ' })).toThrow();
  });

  it('rejects future date', () => {
    expect(() => transactionFormSchema.parse({ ...validInput, date: '2099-01-01' })).toThrow();
  });

  it('rejects tomorrow', () => {
    expect(() =>
      transactionFormSchema.parse({ ...validInput, date: isoDateOffsetByDays(1) })
    ).toThrow();
  });

  it('rejects empty date', () => {
    expect(() => transactionFormSchema.parse({ ...validInput, date: '' })).toThrow();
  });

  it.each(['15/01/2026', '2026-1-5', '2026-01-15T00:00:00.000Z', 'ontem'])(
    'rejects malformed date %s',
    (date) => {
      expect(() => transactionFormSchema.parse({ ...validInput, date })).toThrow();
    }
  );

  it('rejects a date that does not exist in the calendar', () => {
    expect(() => transactionFormSchema.parse({ ...validInput, date: '2026-02-31' })).toThrow();
  });

  it('rejects amount equal to zero', () => {
    expect(() => transactionFormSchema.parse({ ...validInput, amount: 0 })).toThrow();
  });

  it('rejects negative amount', () => {
    expect(() => transactionFormSchema.parse({ ...validInput, amount: -10 })).toThrow();
  });

  it('rejects amount above the maximum', () => {
    expect(() =>
      transactionFormSchema.parse({ ...validInput, amount: MAX_TRANSACTION_AMOUNT + 0.01 })
    ).toThrow();
  });

  it.each([NaN, Infinity, '42,50', null, undefined])('rejects non-numeric amount %s', (amount) => {
    expect(() => transactionFormSchema.parse({ ...validInput, amount })).toThrow();
  });

  it('rejects invalid type', () => {
    expect(() => transactionFormSchema.parse({ ...validInput, type: 'pix' })).toThrow();
  });

  it('rejects missing type', () => {
    const { type, ...withoutType } = validInput;
    void type;

    expect(() => transactionFormSchema.parse(withoutType)).toThrow();
  });

  it('rejects missing category', () => {
    const { category, ...withoutCategory } = validInput;
    void category;

    expect(() => transactionFormSchema.parse(withoutCategory)).toThrow();
  });

  it('rejects a category label instead of a category id', () => {
    expect(() => transactionFormSchema.parse({ ...validInput, category: 'Alimentação' })).toThrow();
  });

  it('rejects more than 5 attachments', () => {
    const attachments = Array.from({ length: MAX_TRANSACTION_ATTACHMENTS + 1 }, (_, index) => ({
      ...validAttachment,
      id: `att-${index}`,
      path: `receipts/user-1/tx-1/recibo-${index}.pdf`,
    }));

    expect(() => transactionFormSchema.parse({ ...validInput, attachments })).toThrow();
  });

  it('reports invalid category path via safeParse', () => {
    const result = transactionFormSchema.safeParse({ ...validInput, category: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('category'))).toBe(true);
    }
  });
});

describe('transactionFormSchema messages', () => {
  it.each([
    [{ ...validInput, amount: 0 }, 'amount', 'Valor deve ser maior que zero'],
    [
      { ...validInput, amount: MAX_TRANSACTION_AMOUNT + 1 },
      'amount',
      'Valor máximo é R$ 1.000.000,00',
    ],
    [{ ...validInput, category: '' }, 'category', 'Selecione uma categoria'],
    [{ ...validInput, type: 'pix' }, 'type', 'Selecione o tipo'],
    [{ ...validInput, date: isoDateOffsetByDays(1) }, 'date', 'Data não pode ser futura'],
    [{ ...validInput, date: '31/12/2026' }, 'date', 'Data inválida'],
    [{ ...validInput, description: 'ab' }, 'description', 'Mínimo 3 caracteres'],
    [{ ...validInput, description: 'a'.repeat(141) }, 'description', 'Máximo 140 caracteres'],
  ])('reports %o as "%s: %s"', (input, field, message) => {
    expect(firstMessage(input, field)).toBe(message);
  });
});

describe('attachmentSchema', () => {
  it('validates a well-formed attachment', () => {
    expect(() => attachmentSchema.parse(validAttachment)).not.toThrow();
  });

  it('rejects invalid url', () => {
    expect(() => attachmentSchema.parse({ ...validAttachment, url: 'not-a-url' })).toThrow();
  });

  it('rejects empty path', () => {
    expect(() => attachmentSchema.parse({ ...validAttachment, path: '' })).toThrow();
  });

  it('rejects non-positive size', () => {
    expect(() => attachmentSchema.parse({ ...validAttachment, size: 0 })).toThrow();
  });
});

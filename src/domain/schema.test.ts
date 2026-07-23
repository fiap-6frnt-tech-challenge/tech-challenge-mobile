import { describe, expect, it } from 'vitest';

import { attachmentSchema, transactionFormSchema } from './schema';

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
    const attachments = Array.from({ length: 5 }, (_, index) => ({
      ...validAttachment,
      id: `att-${index}`,
      path: `receipts/user-1/tx-1/recibo-${index}.pdf`,
    }));

    expect(() => transactionFormSchema.parse({ ...validInput, attachments })).not.toThrow();
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

  it('rejects future date', () => {
    expect(() => transactionFormSchema.parse({ ...validInput, date: '2099-01-01' })).toThrow();
  });

  it('rejects empty date', () => {
    expect(() => transactionFormSchema.parse({ ...validInput, date: '' })).toThrow();
  });

  it('rejects amount equal to zero', () => {
    expect(() => transactionFormSchema.parse({ ...validInput, amount: 0 })).toThrow();
  });

  it('rejects invalid type', () => {
    expect(() => transactionFormSchema.parse({ ...validInput, type: 'pix' })).toThrow();
  });

  it('rejects more than 5 attachments', () => {
    const attachments = Array.from({ length: 6 }, (_, index) => ({
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

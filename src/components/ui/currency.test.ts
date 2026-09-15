import { describe, expect, it } from 'vitest';

import { formatBRL } from './currency';

describe('formatBRL', () => {
  it.each([
    [1234.56, 'R$ 1.234,56'],
    [0, 'R$ 0,00'],
    [-1240.9, '-R$ 1.240,90'],
    [-0, 'R$ 0,00'],
  ])('formats %s as %s', (value, expected) => {
    expect(formatBRL(value)).toBe(expected);
  });
});

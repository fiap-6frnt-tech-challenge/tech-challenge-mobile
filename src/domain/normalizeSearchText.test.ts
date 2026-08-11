import { describe, expect, it } from 'vitest';

import { normalizeSearchText } from './normalizeSearchText';

describe('normalizeSearchText', () => {
  it('lowercases text and removes Portuguese diacritics', () => {
    expect(normalizeSearchText('CAFÉ com PÃO')).toBe('cafe com pao');
  });

  it('trims and collapses all internal whitespace', () => {
    expect(normalizeSearchText('  Mercado\n\tCentral  ')).toBe('mercado central');
  });

  it('normalizes precomposed and decomposed Unicode equally', () => {
    expect(normalizeSearchText('café')).toBe(normalizeSearchText('cafe\u0301'));
  });

  it('returns an empty string for whitespace-only input', () => {
    expect(normalizeSearchText('   \n\t ')).toBe('');
  });
});

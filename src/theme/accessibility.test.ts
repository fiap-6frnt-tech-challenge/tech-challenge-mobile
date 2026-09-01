import { describe, expect, it } from 'vitest';

import { colors } from './tokens';

function relativeLuminance(hex: string): number {
  const value = hex.slice(1);
  const channels = [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
  const linearChannels = channels.map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * linearChannels[0] + 0.7152 * linearChannels[1] + 0.0722 * linearChannels[2];
}

function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (left, right) => right - left
  );

  return (lighter + 0.05) / (darker + 0.05);
}

describe('theme accessibility', () => {
  it.each([
    ['primary action', colors.primary, colors.surface],
    ['primary link', colors.primary, colors.background],
    ['body text', colors.text, colors.background],
    ['secondary text', colors.textSecondary, colors.background],
    ['error text', colors.danger, colors.background],
    ['success text', colors.success, colors.background],
    ['transfer badge', colors.badgeTransferText, colors.surface],
    ['withdraw badge', colors.badgeWithdrawText, colors.surface],
    ['deposit badge', colors.badgeDepositText, colors.surface],
  ])('%s has at least 4.5:1 contrast', (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
});

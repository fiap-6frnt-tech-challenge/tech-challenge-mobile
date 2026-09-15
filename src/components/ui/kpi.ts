import { Minus, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react-native';

import type { Theme } from '@/src/theme';

export type KpiTone = 'primary' | 'positive' | 'negative';

export type KpiTrend = 'up' | 'down' | 'neutral';

export interface KpiToneColors {
  accent: string;
  surface: string;
}

export function toneColors(theme: Theme, tone: KpiTone): KpiToneColors {
  switch (tone) {
    case 'positive':
      return { accent: theme.colors.success, surface: theme.colors.badgeDepositBg };
    case 'negative':
      return { accent: theme.colors.danger, surface: theme.colors.badgeWithdrawBg };
    case 'primary':
    default:
      return { accent: theme.colors.primary, surface: theme.colors.badgeTransferBg };
  }
}

export interface KpiTrendMeta {
  Icon: LucideIcon;
  label: string;
  a11yLabel: string;
}

export const TREND_META: Record<KpiTrend, KpiTrendMeta> = {
  up: { Icon: TrendingUp, label: 'Em alta', a11yLabel: 'em alta' },
  down: { Icon: TrendingDown, label: 'Em queda', a11yLabel: 'em queda' },
  neutral: { Icon: Minus, label: 'Estável', a11yLabel: 'estável' },
};

export function buildKpiAccessibilityLabel(
  label: string,
  formattedValue: string,
  trend?: KpiTrend,
  trendLabel?: string
): string {
  const base = `${label}: ${formattedValue}`;
  if (!trend) return base;
  return `${base}, ${trendLabel ?? TREND_META[trend].a11yLabel}`;
}

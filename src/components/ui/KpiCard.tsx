import type { LucideIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme, type Theme } from '@/src/theme';
import { Card } from './Card';
import { Text } from './Text';
import { formatBRL } from './currency';
import {
  buildKpiAccessibilityLabel,
  TREND_META,
  toneColors,
  type KpiTone,
  type KpiTrend,
} from './kpi';

export interface KpiCardProps {
  label: string;
  value: number;
  tone: KpiTone;
  trend?: KpiTrend;
  trendLabel?: string;
  icon?: LucideIcon;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function KpiCard({
  label,
  value,
  tone,
  trend,
  trendLabel,
  icon: Icon,
  accessibilityLabel,
  style,
  testID,
}: KpiCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { accent, surface } = toneColors(theme, tone);
  const formattedValue = formatBRL(value);
  const trendMeta = trend ? TREND_META[trend] : undefined;
  const TrendIcon = trendMeta?.Icon;

  return (
    <Card
      style={[styles.card, style]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={
        accessibilityLabel ?? buildKpiAccessibilityLabel(label, formattedValue, trend, trendLabel)
      }
      testID={testID}>
      <View style={styles.header}>
        <Text variant="caption" color="textSecondary" style={styles.label} numberOfLines={2}>
          {label}
        </Text>

        {Icon ? (
          <View style={[styles.iconBubble, { backgroundColor: surface }]}>
            <Icon size={18} color={accent} strokeWidth={2} />
          </View>
        ) : null}
      </View>

      <Text
        variant="h1"
        style={[styles.value, { color: accent }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}>
        {formattedValue}
      </Text>

      {trendMeta && TrendIcon ? (
        <View style={styles.trend}>
          <TrendIcon size={16} color={accent} strokeWidth={2} />
          <Text variant="caption" style={[styles.trendLabel, { color: accent }]} numberOfLines={1}>
            {trendLabel ?? trendMeta.label}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      padding: theme.spacing.lg,
      gap: theme.spacing.xs,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    label: {
      flexShrink: 1,
    },
    iconBubble: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    value: {
      marginTop: theme.spacing.xs,
    },
    trend: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    trendLabel: {
      flexShrink: 1,
    },
  });
}

import type { LucideIcon } from 'lucide-react-native';
import { memo, useMemo } from 'react';
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

export interface SummaryTileProps {
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

export const SummaryTile = memo(function SummaryTile({
  label,
  value,
  tone,
  trend,
  trendLabel,
  icon: Icon,
  accessibilityLabel,
  style,
  testID,
}: SummaryTileProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { accent, surface } = toneColors(theme, tone);

  const formattedValue = formatBRL(value);
  const trendMeta = trend ? TREND_META[trend] : undefined;
  const TrendIcon = trendMeta?.Icon;

  return (
    <Card
      style={[styles.tile, style]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={
        accessibilityLabel ?? buildKpiAccessibilityLabel(label, formattedValue, trend, trendLabel)
      }
      testID={testID}>
      <View style={styles.header}>
        {Icon ? (
          <View style={[styles.iconBubble, { backgroundColor: surface }]}>
            <Icon size={14} color={accent} strokeWidth={2} />
          </View>
        ) : null}
        <Text variant="caption" color="textSecondary" style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>

      <Text
        style={[styles.value, { color: accent }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}>
        {formattedValue}
      </Text>

      {trendMeta && TrendIcon ? (
        <View style={styles.trend}>
          <TrendIcon size={13} color={accent} strokeWidth={2} />
          <Text style={[styles.trendLabel, { color: accent }]} numberOfLines={1}>
            {trendLabel ?? trendMeta.label}
          </Text>
        </View>
      ) : null}
    </Card>
  );
});

function createStyles(theme: Theme) {
  return StyleSheet.create({
    tile: {
      flex: 1,
      flexBasis: 0,
      minWidth: 0,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    iconBubble: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      flexShrink: 1,
    },
    value: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: '700',
    },
    trend: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    trendLabel: {
      flexShrink: 1,
      fontSize: 11,
      fontWeight: '600',
    },
  });
}

import { useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { PieChart, type pieDataItem } from 'react-native-gifted-charts';
import { Text } from '@/src/components/ui/Text';
import { CATEGORIES, type CategoryId } from '@/src/domain/categories';
import type { CategoryAggregate } from '@/src/domain/transactions';
import { useTheme, type Theme } from '@/src/theme';
import { ChartFrame } from './ChartFrame';
import { ChartLegend, type ChartLegendItem } from './ChartLegend';
import { formatCurrency } from './format';
import { useChartWidth } from './useChartWidth';

const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category.label])
) as Record<CategoryId, string>;

export interface CategoryPieChartProps {
  data: CategoryAggregate[];
  title?: string;
  radius?: number;
  emptyMessage?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function CategoryPieChart({
  data,
  title,
  radius,
  emptyMessage = 'Nenhuma despesa categorizada no período.',
  style,
  testID,
}: CategoryPieChartProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const chartWidth = useChartWidth();
  const outerRadius = radius ?? Math.min(96, Math.floor(chartWidth / 2) - theme.spacing.xl);

  const { slices, legend, total, isEmpty } = useMemo(() => {
    const positive = data.filter((item) => item.total > 0);
    const sum = positive.reduce((acc, item) => acc + item.total, 0);
    const ordered = [...positive].sort((a, b) => b.total - a.total);
    const pie: pieDataItem[] = ordered.map((item) => ({
      value: item.total,
      color: theme.charts.categories[item.category],
    }));
    const legendItems: ChartLegendItem[] = ordered.map((item) => ({
      key: item.category,
      label: CATEGORY_LABELS[item.category] ?? item.category,
      color: theme.charts.categories[item.category],
      value: formatCurrency(item.total),
      share: `${Math.round((item.total / sum) * 100)}%`,
    }));

    return { slices: pie, legend: legendItems, total: sum, isEmpty: ordered.length === 0 };
  }, [data, theme]);

  const accessibilityLabel = useMemo(() => {
    if (legend.length === 0) return 'Gráfico de gastos por categoria, sem dados.';

    const detail = legend
      .map((item) => `${item.label}: ${item.value}, ${item.share} do total`)
      .join('. ');

    return `Gráfico de rosca de gastos por categoria. Total ${formatCurrency(total)}. ${detail}.`;
  }, [legend, total]);

  return (
    <ChartFrame
      title={title}
      accessibilityLabel={accessibilityLabel}
      isEmpty={isEmpty}
      emptyMessage={emptyMessage}
      style={style}
      testID={testID}
      footer={<ChartLegend items={legend} layout="list" />}>
      <View style={styles.pieWrapper}>
        <PieChart
          data={slices}
          donut
          radius={outerRadius}
          innerRadius={Math.round(outerRadius * 0.62)}
          innerCircleColor={theme.colors.surface}
          strokeColor={theme.colors.surface}
          strokeWidth={2}
          isAnimated
          animationDuration={400}
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <Text variant="caption" color="textSecondary">
                Total
              </Text>
              <Text variant="body" style={styles.centerValue}>
                {formatCurrency(total)}
              </Text>
            </View>
          )}
        />
      </View>
    </ChartFrame>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    pieWrapper: {
      alignItems: 'center',
    },
    centerLabel: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xs,
    },
    centerValue: {
      fontWeight: '700',
      textAlign: 'center',
    },
  });
}

import { memo, useMemo } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { BarChart, type barDataItem } from 'react-native-gifted-charts';
import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useTheme, type Theme } from '@/src/theme';
import type { MonthlyAggregate } from '@/src/domain';
import { ChartFrame } from './ChartFrame';
import { ChartLegend } from './ChartLegend';
import { axisLabels, formatCurrency, formatMonthLong, formatMonthShort } from './format';
import { buildAxisScale, buildBarGeometry } from './scale';
import { useChartWidth } from './useChartWidth';

const SECTIONS = 4;
const Y_AXIS_WIDTH = 44;
const INNER_GAP = 2;

const BAR_LIMITS = {
  innerGap: INNER_GAP,
  minBarWidth: 6,
  maxBarWidth: 22,
  minGroupSpacing: 8,
};

export interface ExpenseBarChartProps {
  data: MonthlyAggregate[];
  title?: string;
  height?: number;
  width?: number;
  emptyMessage?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const ExpenseBarChart = memo(function ExpenseBarChart({
  data,
  title,
  height = 200,
  width,
  emptyMessage = 'Nenhuma movimentação no período.',
  style,
  testID,
}: ExpenseBarChartProps) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const chartWidth = useChartWidth(width);

  const { bars, barWidth, groupSpacing, maxValue, stepValue, sectionsAbove, isEmpty } =
    useMemo(() => {
      const rawMax = data.reduce((max, item) => Math.max(max, item.income, item.expense), 0);
      const scale = buildAxisScale(
        data.flatMap((item) => [item.income, item.expense]),
        SECTIONS
      );
      const geometry = buildBarGeometry(chartWidth - Y_AXIS_WIDTH, data.length, BAR_LIMITS);

      const items: barDataItem[] = data.flatMap((item) => [
        {
          value: item.income,
          label: formatMonthShort(item.month),
          frontColor: theme.charts.income,
          spacing: INNER_GAP,
          labelWidth: geometry.barWidth * 2 + INNER_GAP,
          labelTextStyle: styles.axisLabel,
        },
        {
          value: item.expense,
          frontColor: theme.charts.expense,
        },
      ]);

      return {
        bars: items,
        ...geometry,
        ...scale,
        isEmpty: data.length === 0 || rawMax === 0,
      };
    }, [chartWidth, data, styles.axisLabel, theme]);

  const accessibilityLabel = useMemo(() => {
    if (data.length === 0) return 'Gráfico de receitas e despesas por mês, sem dados.';

    const detail = data
      .map(
        (item) =>
          `${formatMonthLong(item.month)}: receitas ${formatCurrency(item.income)}, despesas ${formatCurrency(item.expense)}`
      )
      .join('. ');

    return `Gráfico de barras de receitas e despesas em ${data.length} ${data.length === 1 ? 'mês' : 'meses'}. ${detail}.`;
  }, [data]);

  return (
    <ChartFrame
      title={title}
      accessibilityLabel={accessibilityLabel}
      isEmpty={isEmpty}
      emptyMessage={emptyMessage}
      style={style}
      testID={testID}
      footer={
        <ChartLegend
          items={[
            { key: 'income', label: 'Receitas', color: theme.charts.income },
            { key: 'expense', label: 'Despesas', color: theme.charts.expense },
          ]}
        />
      }>
      <BarChart
        data={bars}
        width={chartWidth - Y_AXIS_WIDTH}
        height={height}
        barWidth={barWidth}
        spacing={groupSpacing}
        initialSpacing={groupSpacing / 2}
        endSpacing={groupSpacing / 2}
        barBorderTopLeftRadius={4}
        barBorderTopRightRadius={4}
        maxValue={maxValue}
        stepValue={stepValue}
        noOfSections={sectionsAbove}
        yAxisLabelTexts={axisLabels(stepValue, sectionsAbove)}
        yAxisLabelWidth={Y_AXIS_WIDTH}
        yAxisTextStyle={styles.axisLabel}
        yAxisThickness={0}
        xAxisColor={theme.charts.axis}
        xAxisThickness={1}
        rulesColor={theme.charts.grid}
        rulesThickness={1}
        isAnimated={!reduceMotion}
        animationDuration={400}
        disablePress
        disableScroll
        showScrollIndicator={false}
      />
    </ChartFrame>
  );
});

function createStyles(theme: Theme) {
  return StyleSheet.create({
    axisLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
  });
}

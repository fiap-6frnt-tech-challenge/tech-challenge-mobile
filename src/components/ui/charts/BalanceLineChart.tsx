import { memo, useMemo } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LineChart, type lineDataItem } from 'react-native-gifted-charts';
import type { BalancePoint } from '@/src/domain';
import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useTheme, type Theme } from '@/src/theme';
import { ChartFrame } from './ChartFrame';
import { axisLabels, formatCurrency, formatDayFull, formatDayShort } from './format';
import { buildAxisScale, evenPositions, labelPositions } from './scale';
import { useChartWidth } from './useChartWidth';

const SECTIONS = 4;
const Y_AXIS_WIDTH = 48;
const EDGE_SPACING = 8;
const MAX_VISIBLE_POINTS = 12;
const MAX_PLOTTED_POINTS = 60;
const MAX_X_LABELS = 5;
const AREA_START_OPACITY = 0.25;
const AREA_END_OPACITY = 0.02;

export interface BalanceLineChartProps {
  data: BalancePoint[];
  title?: string;
  height?: number;
  width?: number;
  emptyMessage?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const BalanceLineChart = memo(function BalanceLineChart({
  data,
  title,
  height = 200,
  width,
  emptyMessage = 'Ainda não há movimentações suficientes para traçar a evolução do saldo.',
  style,
  testID,
}: BalanceLineChartProps) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const chartWidth = useChartWidth(width);
  const plotWidth = chartWidth - Y_AXIS_WIDTH;
  const isEmpty = data.length < 2;

  const { points, spacing, maxValue, mostNegativeValue, stepValue, sectionsAbove, sectionsBelow } =
    useMemo(() => {
      const scale = buildAxisScale(
        data.map((item) => item.balance),
        SECTIONS
      );
      const plotted =
        data.length > MAX_PLOTTED_POINTS
          ? evenPositions(data.length, MAX_PLOTTED_POINTS).map((index) => data[index])
          : data;
      const labelled = labelPositions(plotted.length, MAX_X_LABELS);
      const items: lineDataItem[] = plotted.map((item, index) => ({
        value: item.balance,
        label: labelled.has(index) ? formatDayShort(item.date) : '',
        hideDataPoint: plotted.length > MAX_VISIBLE_POINTS,
      }));

      return {
        points: items,
        spacing: (plotWidth - EDGE_SPACING * 2) / Math.max(plotted.length - 1, 1),
        ...scale,
      };
    }, [data, plotWidth]);

  const accessibilityLabel = useMemo(() => {
    if (data.length === 0) return 'Gráfico de evolução do saldo, sem dados.';

    const first = data[0];
    const last = data[data.length - 1];
    const balances = data.map((item) => item.balance);
    const trend =
      last.balance > first.balance
        ? 'alta'
        : last.balance < first.balance
          ? 'queda'
          : 'estabilidade';

    return (
      `Gráfico de linha da evolução do saldo em ${data.length} pontos, de ${formatDayFull(first.date)} a ${formatDayFull(last.date)}. ` +
      `Saldo inicial ${formatCurrency(first.balance)}, saldo final ${formatCurrency(last.balance)}, tendência de ${trend}. ` +
      `Mínimo ${formatCurrency(Math.min(...balances))}, máximo ${formatCurrency(Math.max(...balances))}.`
    );
  }, [data]);

  return (
    <ChartFrame
      title={title}
      accessibilityLabel={accessibilityLabel}
      isEmpty={isEmpty}
      emptyMessage={emptyMessage}
      style={style}
      testID={testID}>
      <LineChart
        data={points}
        width={plotWidth}
        height={height}
        spacing={spacing}
        initialSpacing={EDGE_SPACING}
        endSpacing={EDGE_SPACING}
        color={theme.charts.balance}
        thickness={2}
        curved
        areaChart
        startFillColor={theme.charts.balance}
        endFillColor={theme.charts.balance}
        startOpacity={AREA_START_OPACITY}
        endOpacity={AREA_END_OPACITY}
        dataPointsColor={theme.charts.balance}
        dataPointsRadius={4}
        maxValue={maxValue}
        mostNegativeValue={mostNegativeValue}
        stepValue={stepValue}
        noOfSections={sectionsAbove}
        noOfSectionsBelowXAxis={sectionsBelow}
        yAxisLabelTexts={axisLabels(stepValue, sectionsAbove, sectionsBelow)}
        yAxisLabelWidth={Y_AXIS_WIDTH}
        yAxisTextStyle={styles.axisLabel}
        xAxisLabelTextStyle={styles.axisLabel}
        yAxisThickness={0}
        xAxisColor={theme.charts.axis}
        xAxisThickness={1}
        rulesColor={theme.charts.grid}
        rulesThickness={1}
        isAnimated={!reduceMotion}
        animationDuration={400}
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

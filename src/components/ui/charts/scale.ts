import { niceAxisMax } from './format';

export interface AxisScale {
  stepValue: number;
  sectionsAbove: number;
  sectionsBelow: number;
  maxValue: number;
  mostNegativeValue: number;
}

export interface BarGeometry {
  barWidth: number;
  groupSpacing: number;
}

export function buildAxisScale(values: number[], sections = 4): AxisScale {
  const highest = Math.max(0, ...values);
  const lowest = Math.min(0, ...values);

  const step = niceAxisMax(Math.max(highest, -lowest), sections) / sections;
  const sectionsAbove = Math.max(1, Math.ceil(highest / step));
  const sectionsBelow = lowest < 0 ? Math.ceil(-lowest / step) : 0;

  return {
    stepValue: step,
    sectionsAbove,
    sectionsBelow,
    maxValue: step * sectionsAbove,
    mostNegativeValue: -step * sectionsBelow,
  };
}

export function buildBarGeometry(
  plotWidth: number,
  groupCount: number,
  { innerGap, minBarWidth, maxBarWidth, minGroupSpacing }: BarGeometryLimits
): BarGeometry {
  const perGroup = plotWidth / Math.max(groupCount, 1);
  const barWidth = Math.round(
    Math.max(minBarWidth, Math.min(maxBarWidth, (perGroup * 0.66 - innerGap) / 2))
  );

  return {
    barWidth,
    groupSpacing: Math.max(minGroupSpacing, perGroup - (barWidth * 2 + innerGap)),
  };
}

export interface BarGeometryLimits {
  innerGap: number;
  minBarWidth: number;
  maxBarWidth: number;
  minGroupSpacing: number;
}

export function evenPositions(length: number, maxPositions: number): number[] {
  if (length <= 1) return [0];

  const count = Math.min(length, maxPositions);
  if (count <= 1) return [0];

  return Array.from({ length: count }, (_, index) =>
    Math.round((index * (length - 1)) / (count - 1))
  );
}

export function labelPositions(length: number, maxLabels: number): Set<number> {
  return new Set(evenPositions(length, maxLabels));
}

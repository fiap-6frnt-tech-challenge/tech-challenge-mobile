import { useWindowDimensions } from 'react-native';

const DEFAULT_INSET = (16 + 12) * 2;
const MIN_WIDTH = 240;
const MAX_WIDTH = 640;

export function useChartWidth(explicitWidth?: number, inset = DEFAULT_INSET): number {
  const { width } = useWindowDimensions();

  if (explicitWidth !== undefined) return explicitWidth;

  return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, Math.floor(width - inset)));
}

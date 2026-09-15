const MONTHS_SHORT = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

const MONTHS_LONG = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatCurrency(value: number): string {
  const sign = value < 0 ? '-' : '';
  const [integer, decimals] = Math.abs(value).toFixed(2).split('.');
  return `${sign}R$ ${groupThousands(integer)},${decimals}`;
}

export function formatCompactCurrency(value: number): string {
  const sign = value < 0 ? '-' : '';
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000) return `${sign}${trimDecimal(absolute / 1_000_000)} mi`;
  if (absolute >= 1_000) return `${sign}${trimDecimal(absolute / 1_000)} mil`;
  return `${sign}${Math.round(absolute)}`;
}

function trimDecimal(value: number): string {
  const fixed = value.toFixed(1);
  return (fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed).replace('.', ',');
}

export function formatMonthShort(month: string): string {
  const index = monthIndex(month);
  return index === null ? month : MONTHS_SHORT[index];
}

export function formatMonthLong(month: string): string {
  const index = monthIndex(month);
  return index === null ? month : `${MONTHS_LONG[index]} de ${month.slice(0, 4)}`;
}

export function formatDayShort(date: string): string {
  const [, month, day] = date.slice(0, 10).split('-');
  return month && day ? `${day}/${month}` : date;
}

export function formatDayFull(date: string): string {
  const [year, month, day] = date.slice(0, 10).split('-');
  return year && month && day ? `${day}/${month}/${year}` : date;
}

function monthIndex(month: string): number | null {
  const parsed = Number(month.slice(5, 7));
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 12 ? parsed - 1 : null;
}

export function niceAxisMax(rawMax: number, sections: number): number {
  if (rawMax <= 0) return sections;

  const magnitude = 10 ** Math.floor(Math.log10(rawMax));
  const step = Math.ceil(rawMax / (sections * magnitude)) * magnitude;
  return step * sections;
}

export function axisLabels(step: number, sectionsAbove: number, sectionsBelow = 0): string[] {
  const total = sectionsBelow + sectionsAbove;
  return Array.from({ length: total + 1 }, (_, index) =>
    formatCompactCurrency(step * (index - sectionsBelow))
  );
}

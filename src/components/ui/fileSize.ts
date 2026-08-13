export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return 'tamanho desconhecido';
  if (bytes < 1024) return `${Math.round(bytes)} B`;

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) return `${formatDecimal(kilobytes)} KB`;

  return `${formatDecimal(kilobytes / 1024)} MB`;
}

function formatDecimal(value: number): string {
  const rounded = value >= 100 ? String(Math.round(value)) : value.toFixed(1);
  return rounded.replace(/\.0$/, '').replace('.', ',');
}

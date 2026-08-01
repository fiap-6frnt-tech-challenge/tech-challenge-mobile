const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatBRL(valueInReais: number): string {
  const value = Object.is(valueInReais, -0) ? 0 : valueInReais;
  return brlFormatter.format(value).replace(/ /g, ' ');
}

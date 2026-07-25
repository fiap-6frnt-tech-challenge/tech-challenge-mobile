export const colors = {
  // Brand
  primary: '#6841f2',
  primaryHover: '#5a35d1',
  brandDark: '#000b34',

  // Surfaces
  background: '#f3f3f3',
  surface: '#ffffff',
  surfaceHover: '#f8f8f8',

  // Content / typography
  text: '#000b34',
  textSecondary: '#5c6070',
  textInverse: '#ffffff',
  textOnBg: '#f3f3f3',

  // Feedback
  danger: '#b53418',
  success: '#107e3e',

  // Border
  border: '#c2c2c2',
  borderFocus: '#6841f2',

  // Icons
  iconDefault: '#000b34',
  iconSecondary: '#5c6070',
  iconAccent: '#b53418',

  // Forms
  placeholder: '#5c6070',

  // Badges
  badgeTransferBg: 'rgba(104, 65, 242, 0.1)',
  badgeTransferText: '#6841f2',
  badgeWithdrawBg: 'rgba(242, 72, 34, 0.1)',
  badgeWithdrawText: '#b53418',
  badgeDepositBg: 'rgba(31, 228, 113, 0.1)',
  badgeDepositText: '#0d7a3e',

  // Charts
  chartBrand: '#6841f2',
  chartBlue: '#0098f4',
  chartPink: '#ec4899',
  chartOrange: '#f97316',
  chartGreen: '#1cc060',
  chartRed: '#ff3631',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 };

export const radius = { default: 8 };

export const typography = {
  h1: { fontSize: 25, fontWeight: '700' as const },
  h2: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
};

import { createContext, useContext, type ReactNode } from 'react';

import { charts, colors, radius, spacing, typography } from './tokens';

export type Theme = {
  colors: typeof colors;
  charts: typeof charts;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
};

const theme: Theme = { colors, charts, spacing, radius, typography };

const ThemeContext = createContext<Theme | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

export * from './tokens';

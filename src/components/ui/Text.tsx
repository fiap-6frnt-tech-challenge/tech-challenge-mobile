import { useMemo } from 'react';
import { StyleSheet, Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme, type Theme } from '@/src/theme';

export type TextVariant = 'h1' | 'h2' | 'body' | 'caption';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: keyof Theme['colors'];
}

export function Text({ variant = 'body', color, style, ...rest }: TextProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <RNText
      style={[styles.base, styles[variant], color && { color: theme.colors[color] }, style]}
      {...rest}
    />
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    base: { color: theme.colors.text },
    h1: { ...theme.typography.h1 },
    h2: { ...theme.typography.h2 },
    body: { ...theme.typography.body },
    caption: { ...theme.typography.caption },
  });
}

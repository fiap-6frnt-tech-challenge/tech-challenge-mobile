import { Link, type LinkProps } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/src/components/ui/Text';
import { useTheme, type Theme } from '@/src/theme';

export interface AuthFooterLinkProps {
  prompt: string;
  label: string;
  href: LinkProps['href'];
  testID?: string;
}

export function AuthFooterLink({ prompt, label, href, testID }: AuthFooterLinkProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text color="textSecondary">{prompt}</Text>
      <Link
        href={href}
        style={styles.link}
        accessibilityRole="link"
        accessibilityLabel={label}
        testID={testID}>
        {label}
      </Link>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    link: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
      color: theme.colors.primary,
      fontSize: theme.typography.body.fontSize,
      fontWeight: '600',
    },
  });
}

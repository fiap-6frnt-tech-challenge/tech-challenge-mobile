import { Link, type LinkProps } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { useTheme, type Theme } from '@/src/theme';

interface AuthFooterLinkBaseProps {
  prompt: string;
  label: string;
  testID?: string;
}

export type AuthFooterLinkProps = AuthFooterLinkBaseProps &
  ({ href: LinkProps['href']; onPress?: never } | { onPress: () => void; href?: never });

export function AuthFooterLink({ prompt, label, href, onPress, testID }: AuthFooterLinkProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const pressable = (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.linkPressable}
      testID={testID}>
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text color="textSecondary">{prompt}</Text>
      {href ? (
        <Link href={href} asChild>
          {pressable}
        </Link>
      ) : (
        pressable
      )}
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
    linkPressable: {
      minHeight: 44,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
    },
    link: {
      color: theme.colors.primary,
      fontSize: theme.typography.body.fontSize,
      fontWeight: '600',
    },
  });
}

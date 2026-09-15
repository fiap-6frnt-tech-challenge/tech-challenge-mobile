import { useMemo, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { useTheme, type Theme } from '@/src/theme';

export interface ChartFrameProps {
  title?: string;
  accessibilityLabel: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  footer?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function ChartFrame({
  title,
  accessibilityLabel,
  isEmpty = false,
  emptyMessage = 'Sem dados para exibir.',
  footer,
  children,
  style,
  testID,
}: ChartFrameProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.container, style]} testID={testID}>
      {title ? (
        <Text variant="h2" style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      ) : null}

      {isEmpty ? (
        <View style={styles.empty} accessibilityRole="text">
          <Text variant="body" color="textSecondary" style={styles.emptyText}>
            {emptyMessage}
          </Text>
        </View>
      ) : (
        <>
          <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
            {children}
          </View>
          {footer}
        </>
      )}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      gap: theme.spacing.md,
    },
    title: {
      color: theme.colors.text,
    },
    empty: {
      minHeight: 120,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    emptyText: {
      textAlign: 'center',
    },
  });
}

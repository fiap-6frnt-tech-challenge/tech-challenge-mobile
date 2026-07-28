import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { useTheme, type Theme } from '@/src/theme';

export interface ChartLegendItem {
  key: string;
  label: string;
  color: string;
  value?: string;
  share?: string;
}

export interface ChartLegendProps {
  items: ChartLegendItem[];
  layout?: 'inline' | 'list';
  testID?: string;
}

export function ChartLegend({ items, layout = 'inline', testID }: ChartLegendProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={layout === 'inline' ? styles.inline : styles.list} testID={testID}>
      {items.map((item) => (
        <View
          key={item.key}
          style={layout === 'inline' ? styles.inlineItem : styles.listItem}
          accessible
          accessibilityRole="text"
          accessibilityLabel={[item.label, item.value, item.share].filter(Boolean).join(', ')}>
          <View style={[styles.swatch, { backgroundColor: item.color }]} />
          <Text variant="caption" style={styles.label} numberOfLines={layout === 'list' ? 1 : 2}>
            {item.label}
          </Text>
          {item.value ? (
            <Text variant="caption" style={[styles.value, layout === 'list' && styles.valuePushed]}>
              {item.value}
            </Text>
          ) : null}
          {item.share ? (
            <Text variant="caption" color="textSecondary" style={styles.share}>
              {item.share}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    inline: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: theme.spacing.lg,
      rowGap: theme.spacing.xs,
    },
    inlineItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    list: {
      gap: theme.spacing.sm,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    swatch: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    label: {
      flexShrink: 1,
      color: theme.colors.text,
    },
    value: {
      color: theme.colors.text,
      fontWeight: '600',
    },
    valuePushed: {
      marginLeft: 'auto',
    },
    share: {
      minWidth: 42,
      textAlign: 'right',
    },
  });
}

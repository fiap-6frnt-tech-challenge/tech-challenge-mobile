import { useEffect, useMemo, useState } from 'react';
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Card } from '@/src/components/ui/Card';
import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useTheme, type Theme } from '@/src/theme';

interface SkeletonBlockProps {
  shimmer: Animated.Value;
  style?: StyleProp<ViewStyle>;
}

function SkeletonBlock({ shimmer, style }: SkeletonBlockProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-96, 320],
  });

  return (
    <View style={[styles.block, style]}>
      <Animated.View style={[styles.highlight, { transform: [{ translateX }] }]} />
    </View>
  );
}

export function DashboardSkeleton() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const reduceMotion = useReduceMotion();
  const [shimmer] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion) return;

    shimmer.setValue(0);
    const animation = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      { resetBeforeIteration: true }
    );

    animation.start();
    return () => animation.stop();
  }, [reduceMotion, shimmer]);

  return (
    <View
      testID="dashboard-skeleton"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Carregando dashboard financeiro"
      accessibilityState={{ busy: true }}
      accessibilityLiveRegion="polite"
      style={styles.root}>
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.decorativeContent}>
        <View style={styles.header}>
          <SkeletonBlock shimmer={shimmer} style={styles.greeting} />
          <SkeletonBlock shimmer={shimmer} style={styles.caption} />
        </View>

        <Card style={styles.balanceCard}>
          <SkeletonBlock shimmer={shimmer} style={styles.balanceLabel} />
          <SkeletonBlock shimmer={shimmer} style={styles.balanceValue} />
          <SkeletonBlock shimmer={shimmer} style={styles.balanceCaption} />
        </Card>

        <View style={styles.summaryRow}>
          <Card style={styles.summaryTile}>
            <SkeletonBlock shimmer={shimmer} style={styles.summaryLabel} />
            <SkeletonBlock shimmer={shimmer} style={styles.summaryValue} />
          </Card>
          <Card style={styles.summaryTile}>
            <SkeletonBlock shimmer={shimmer} style={styles.summaryLabel} />
            <SkeletonBlock shimmer={shimmer} style={styles.summaryValue} />
          </Card>
        </View>

        {[0, 1, 2].map((index) => (
          <Card key={index} style={styles.chartCard}>
            <SkeletonBlock shimmer={shimmer} style={styles.chartTitle} />
            <SkeletonBlock shimmer={shimmer} style={styles.chartArea} />
          </Card>
        ))}
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    root: {
      width: '100%',
    },
    decorativeContent: {
      gap: theme.spacing.lg,
    },
    header: {
      gap: theme.spacing.xs,
    },
    greeting: {
      height: 24,
      width: '48%',
    },
    caption: {
      height: 16,
      width: '62%',
    },
    balanceCard: {
      gap: theme.spacing.sm,
    },
    balanceLabel: {
      height: 16,
      width: '38%',
    },
    balanceValue: {
      height: 32,
      width: '58%',
    },
    balanceCaption: {
      height: 16,
      width: '44%',
    },
    summaryRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    summaryTile: {
      flex: 1,
      gap: theme.spacing.sm,
    },
    summaryLabel: {
      height: 16,
      width: '72%',
    },
    summaryValue: {
      height: 28,
      width: '84%',
    },
    chartCard: {
      gap: theme.spacing.md,
      minHeight: 220,
    },
    chartTitle: {
      height: 20,
      width: '52%',
    },
    chartArea: {
      flex: 1,
      minHeight: 160,
      width: '100%',
    },
    block: {
      backgroundColor: theme.colors.border,
      borderRadius: theme.radius.default,
      overflow: 'hidden',
    },
    highlight: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 72,
      backgroundColor: theme.colors.surfaceHover,
    },
  });
}

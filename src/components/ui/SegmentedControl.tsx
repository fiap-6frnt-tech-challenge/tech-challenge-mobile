import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useTheme, type Theme } from '@/src/theme';
import { MOTION, MOTION_EASING } from './motion/motion';
import { Text } from './Text';

export interface SegmentedControlOption<T extends string> {
  label: string;
  value: T;
  accessibilityLabel?: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
  reduceMotion?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  reduceMotion,
  style,
  testID,
}: SegmentedControlProps<T>) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const systemReduceMotion = useReduceMotion();
  const shouldReduceMotion = reduceMotion ?? systemReduceMotion;

  const [trackWidth, setTrackWidth] = useState(0);
  const segmentWidth = options.length > 0 ? trackWidth / options.length : 0;

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  const [translateX] = useState(() => new Animated.Value(0));
  const hasMeasured = useRef(false);

  useEffect(() => {
    if (segmentWidth === 0) return;

    const toValue = selectedIndex * segmentWidth;

    if (!hasMeasured.current || shouldReduceMotion) {
      hasMeasured.current = true;
      translateX.setValue(toValue);
      return;
    }

    const animation = Animated.timing(translateX, {
      toValue,
      duration: MOTION.indicatorDuration,
      easing: MOTION_EASING.enter,
      useNativeDriver: true,
    });

    animation.start();

    return () => animation.stop();
  }, [selectedIndex, segmentWidth, shouldReduceMotion, translateX]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      testID={testID}>
      <View style={styles.track} onLayout={handleLayout}>
        {segmentWidth > 0 ? (
          <Animated.View
            style={[styles.indicator, { width: segmentWidth, transform: [{ translateX }] }]}
            pointerEvents="none"
          />
        ) : null}

        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="tab"
              accessibilityLabel={option.accessibilityLabel ?? option.label}
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => [styles.segment, pressed && styles.segmentPressed]}
              testID={testID ? `${testID}-${option.value}` : undefined}>
              <Text
                variant="body"
                numberOfLines={1}
                style={[styles.label, isSelected && styles.labelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.default,
      padding: theme.spacing.xs,
    },
    track: {
      flexDirection: 'row',
      position: 'relative',
    },
    indicator: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.default,
    },
    segment: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
    },
    segmentPressed: {
      opacity: 0.7,
    },
    label: {
      color: theme.colors.textSecondary,
    },
    labelSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });
}

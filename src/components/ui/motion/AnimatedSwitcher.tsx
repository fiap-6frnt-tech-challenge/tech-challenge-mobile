import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useOptionalAnimatedSectionGroup } from './AnimatedSectionGroup';
import { MOTION, MOTION_EASING } from './motion';

export interface AnimatedSwitcherProps<T> {
   value: T;
  children: (value: T) => ReactNode;
  duration?: number;
  distance?: number;
  minHeight?: number;
  reduceMotion?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function AnimatedSwitcher<T>({
  value,
  children,
  duration = MOTION.switchDuration,
  distance = MOTION.switchDistance,
  minHeight,
  reduceMotion,
  style,
  testID,
}: AnimatedSwitcherProps<T>) {
  const group = useOptionalAnimatedSectionGroup();
  const systemReduceMotion = useReduceMotion();
  const shouldReduceMotion = reduceMotion ?? group?.reduceMotion ?? systemReduceMotion;
  const [displayed, setDisplayed] = useState<T>(value);
  const displayedValue = shouldReduceMotion ? value : displayed;
  const [opacity] = useState(() => new Animated.Value(1));
  const [translateY] = useState(() => new Animated.Value(0));
  const runningRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (value === displayed) return;

    if (shouldReduceMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    const half = Math.max(1, Math.round(duration / 2));

    const exit = Animated.timing(opacity, {
      toValue: 0,
      duration: half,
      easing: MOTION_EASING.exit,
      useNativeDriver: true,
    });

    runningRef.current = exit;

    exit.start(({ finished }) => {
      if (!finished) return;

      setDisplayed(value);
      translateY.setValue(distance);

      const enter = Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: half,
          easing: MOTION_EASING.enter,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: half,
          easing: MOTION_EASING.enter,
          useNativeDriver: true,
        }),
      ]);

      runningRef.current = enter;
      enter.start();
    });
  }, [value, displayed, shouldReduceMotion, duration, distance, opacity, translateY]);

  useEffect(() => {
    return () => {
      runningRef.current?.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        style,
        minHeight !== undefined && { minHeight },
        { opacity, transform: [{ translateY }] },
      ]}
      testID={testID}>
      {children(displayedValue)}
    </Animated.View>
  );
}

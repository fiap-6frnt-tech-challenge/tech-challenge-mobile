import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useOptionalAnimatedSectionGroup } from './AnimatedSectionGroup';
import { MOTION, MOTION_EASING } from './motion';

export interface AnimatedSectionHandle {
  replay: () => void;
}

export interface AnimatedSectionProps {
  children: ReactNode;
  index?: number;
  duration?: number;
  staggerStep?: number;
  distance?: number;
  reduceMotion?: boolean;
  onAnimationComplete?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  ref?: Ref<AnimatedSectionHandle>;
}

export function AnimatedSection({
  children,
  index = 0,
  duration = MOTION.sectionDuration,
  staggerStep = MOTION.sectionStagger,
  distance = MOTION.sectionDistance,
  reduceMotion,
  onAnimationComplete,
  style,
  testID,
  ref,
}: AnimatedSectionProps) {
  const group = useOptionalAnimatedSectionGroup();
  const systemReduceMotion = useReduceMotion();
  const shouldReduceMotion = reduceMotion ?? group?.reduceMotion ?? systemReduceMotion;
  const [localToken, setLocalToken] = useState(0);
  const replayToken = (group?.replayToken ?? 0) + localToken;
  const [progress] = useState(() => new Animated.Value(0));
  const onAnimationCompleteRef = useRef(onAnimationComplete);

  useEffect(() => {
    onAnimationCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  const replay = useCallback(() => setLocalToken((token) => token + 1), []);
  useImperativeHandle(ref, () => ({ replay }), [replay]);

  useEffect(() => {
    if (shouldReduceMotion) {
      progress.setValue(1);
      onAnimationCompleteRef.current?.();
      return;
    }

    progress.setValue(0);

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay: index * staggerStep,
      easing: MOTION_EASING.enter,
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished) onAnimationCompleteRef.current?.();
    });

    return () => animation.stop();
  }, [replayToken, shouldReduceMotion, duration, index, staggerStep, progress]);

  const translateY = useMemo(
    () => progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }),
    [progress, distance]
  );

  return (
    <Animated.View
      style={[style, { opacity: progress, transform: [{ translateY }] }]}
      testID={testID}>
      {children}
    </Animated.View>
  );
}

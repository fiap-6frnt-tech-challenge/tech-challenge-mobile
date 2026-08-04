import { Easing } from 'react-native';

export const MOTION = {
  sectionDuration: 350,
  sectionStagger: 120,
  sectionDistance: 20,
  switchDuration: 240,
  switchDistance: 12,
  indicatorDuration: 200,
} as const;

export const MOTION_EASING = {
  enter: Easing.out(Easing.cubic),
  exit: Easing.in(Easing.quad),
} as const;

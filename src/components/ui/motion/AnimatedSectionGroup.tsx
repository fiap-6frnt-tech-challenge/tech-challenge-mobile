import {
  createContext,
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useState,
  type ReactNode,
  type Ref,
} from 'react';

export interface AnimatedSectionGroupHandle {
  replay: () => void;
}

export interface AnimatedSectionGroupValue {
  replayToken: number;
  replay: () => void;
  reduceMotion?: boolean;
}

const AnimatedSectionGroupContext = createContext<AnimatedSectionGroupValue | undefined>(undefined);

export function useAnimatedSectionGroup(): AnimatedSectionGroupValue {
  const ctx = useContext(AnimatedSectionGroupContext);
  if (!ctx) {
    throw new Error('useAnimatedSectionGroup must be used within an AnimatedSectionGroup');
  }
  return ctx;
}

export function useOptionalAnimatedSectionGroup(): AnimatedSectionGroupValue | undefined {
  return useContext(AnimatedSectionGroupContext);
}

export interface AnimatedSectionGroupProps {
  children: ReactNode;
  reduceMotion?: boolean;
  ref?: Ref<AnimatedSectionGroupHandle>;
}

export function AnimatedSectionGroup({ children, reduceMotion, ref }: AnimatedSectionGroupProps) {
  const [replayToken, setReplayToken] = useState(0);

  const replay = useCallback(() => setReplayToken((token) => token + 1), []);

  useImperativeHandle(ref, () => ({ replay }), [replay]);

  const value = useMemo<AnimatedSectionGroupValue>(
    () => ({ replayToken, replay, reduceMotion }),
    [replayToken, replay, reduceMotion]
  );

  return (
    <AnimatedSectionGroupContext.Provider value={value}>
      {children}
    </AnimatedSectionGroupContext.Provider>
  );
}

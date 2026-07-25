import { registerRootComponent } from 'expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { view } from './storybook.requires';

/**
 * This file is user-editable.
 *
 * When EXPO_PUBLIC_STORYBOOK is enabled, the Expo dev client loads this file
 * directly as the bundle entry point (not `expo-router/entry` -> `app/_layout.tsx`),
 * so it must self-register via `registerRootComponent`. It also exports the
 * component as default so `app/storybook.tsx` can re-export it for in-app navigation.
 */
const StorybookUIRoot = view.getStorybookUI({
  shouldPersistSelection: true,
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
});

registerRootComponent(StorybookUIRoot);

export default StorybookUIRoot;

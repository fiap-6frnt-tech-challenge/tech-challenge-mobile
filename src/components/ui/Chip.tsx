import { X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type AccessibilityRole,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme, type Theme } from '@/src/theme';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  onRemove?: () => void;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  removeAccessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Chip({
  label,
  onRemove,
  onPress,
  selected = false,
  disabled = false,
  accessibilityLabel,
  accessibilityRole = 'button',
  removeAccessibilityLabel,
  style,
  testID,
}: ChipProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [pressed, setPressed] = useState(false);

  const containerStyle = [
    styles.chip,
    selected && styles.chipSelected,
    disabled && styles.chipDisabled,
    style,
  ];

  const labelStyle = [styles.label, selected && styles.labelSelected];

  const content = (
    <>
      <Text variant="caption" numberOfLines={1} style={labelStyle}>
        {label}
      </Text>
      {onRemove ? (
        <Pressable
          onPress={disabled ? undefined : onRemove}
          disabled={disabled}
          hitSlop={15}
          accessibilityRole="button"
          accessibilityLabel={removeAccessibilityLabel ?? `Remover ${label}`}
          accessibilityState={{ disabled }}
          testID={testID ? `${testID}-remove` : undefined}
          style={styles.removeButton}>
          <X
            size={14}
            color={selected ? theme.colors.primary : theme.colors.iconSecondary}
            strokeWidth={2.5}
          />
        </Pressable>
      ) : null}
    </>
  );

  if (!onPress) {
    return (
      <View style={containerStyle} testID={testID}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={
        accessibilityRole === 'checkbox' || accessibilityRole === 'radio'
          ? { disabled, selected, checked: selected }
          : { disabled, selected }
      }
      testID={testID}
      style={[...containerStyle, pressed && !disabled && styles.pressed]}>
      {content}
    </Pressable>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    chip: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    chipSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.badgeTransferBg,
    },
    chipDisabled: { opacity: 0.5 },
    pressed: { opacity: 0.7 },
    label: { color: theme.colors.text, flexShrink: 1 },
    labelSelected: { color: theme.colors.primary, fontWeight: '600' },
    removeButton: { alignItems: 'center', justifyContent: 'center' },
  });
}

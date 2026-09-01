import { Check, ChevronDown } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme, type Theme } from '@/src/theme';

import { Text } from './Text';

export interface SelectOption<TValue extends string = string> {
  label: string;
  value: TValue;
}

export interface SelectProps<TValue extends string = string> {
  label?: string;
  placeholder?: string;
  value?: TValue;
  options: SelectOption<TValue>[];
  onChange: (value: TValue) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Select<TValue extends string = string>({
  label,
  placeholder = 'Selecionar',
  value,
  options,
  onChange,
  onBlur,
  error,
  disabled = false,
  accessibilityLabel,
  style,
  testID,
}: SelectProps<TValue>) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  function handleOpen() {
    if (disabled) return;
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    onBlur?.();
  }

  function handleSelect(option: SelectOption<TValue>) {
    onChange(option.value);
    setOpen(false);
    onBlur?.();
  }

  return (
    <View style={style}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={handleOpen}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
        accessibilityState={{ disabled, expanded: open }}
        accessibilityValue={selectedOption ? { text: selectedOption.label } : undefined}
        testID={testID}
        style={[styles.field, !!error && styles.fieldError, disabled && styles.fieldDisabled]}>
        <Text style={selectedOption ? styles.value : styles.placeholder} numberOfLines={1}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={20} color={theme.colors.iconSecondary} />
      </Pressable>
      {error ? (
        <Text
          style={styles.error}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          testID={testID ? `${testID}-error` : undefined}>
          {error}
        </Text>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={handleClose}>
        <Pressable
          style={styles.backdrop}
          onPress={handleClose}
          accessibilityLabel="Fechar seleção"
          accessibilityRole="button"
        />
        <View style={styles.sheet}>
          {label ? <Text style={styles.sheetTitle}>{label}</Text> : null}
          <FlatList
            data={options}
            keyExtractor={(option) => option.value}
            renderItem={({ item }) => {
              const isSelected = item.value === value;
              return (
                <Pressable
                  onPress={() => handleSelect(item)}
                  accessibilityRole="radio"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected: isSelected }}
                  style={styles.option}>
                  <Text style={isSelected ? styles.optionLabelSelected : styles.optionLabel}>
                    {item.label}
                  </Text>
                  {isSelected ? <Check size={20} color={theme.colors.primary} /> : null}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    label: {
      marginBottom: theme.spacing.xs,
      color: theme.colors.text,
      fontWeight: '600',
    },
    field: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.default,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
    },
    fieldError: { borderColor: theme.colors.danger },
    fieldDisabled: { backgroundColor: theme.colors.surfaceHover, opacity: 0.5 },
    value: { color: theme.colors.text, fontSize: theme.typography.body.fontSize, flexShrink: 1 },
    placeholder: {
      color: theme.colors.placeholder,
      fontSize: theme.typography.body.fontSize,
      flexShrink: 1,
    },
    error: { marginTop: theme.spacing.xs, color: theme.colors.danger },
    backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)' },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radius.default * 2,
      borderTopRightRadius: theme.radius.default * 2,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing['2xl'],
      paddingHorizontal: theme.spacing.lg,
      maxHeight: '70%',
    },
    sheetTitle: {
      ...theme.typography.h2,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    option: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    optionLabel: { color: theme.colors.text, fontSize: theme.typography.body.fontSize },
    optionLabelSelected: {
      color: theme.colors.primary,
      fontSize: theme.typography.body.fontSize,
      fontWeight: '600',
    },
  });
}

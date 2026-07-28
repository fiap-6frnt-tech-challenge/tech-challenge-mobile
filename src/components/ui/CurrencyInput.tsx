import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme, type Theme } from '@/src/theme';
import { Text } from './Text';

export interface CurrencyInputProps {
  label?: string;
  placeholder?: string;
  value: number;
  onChangeValue: (value: number) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatBRL(valueInReais: number): string {
  return currencyFormatter.format(valueInReais).replace(/ /g, ' ');
}

export function CurrencyInput({
  label,
  placeholder = 'R$ 0,00',
  value,
  onChangeValue,
  onBlur,
  error,
  disabled = false,
  accessibilityLabel,
  style,
  testID,
}: CurrencyInputProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [focused, setFocused] = useState(false);

  const displayValue = formatBRL(value);

  function handleChangeText(text: string) {
    const digits = text.replace(/\D/g, '');
    const nextValue = digits ? Number(digits) / 100 : 0;
    onChangeValue(nextValue);
  }

  return (
    <View style={style}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={displayValue}
        onChangeText={handleChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        selection={{ start: displayValue.length, end: displayValue.length }}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholder}
        keyboardType="numeric"
        editable={!disabled}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled }}
        testID={testID}
        style={[
          styles.input,
          focused && styles.inputFocused,
          !!error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
      />
      {error ? (
        <Text
          style={styles.error}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          testID={testID ? `${testID}-error` : undefined}>
          {error}
        </Text>
      ) : null}
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
    input: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.default,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      fontSize: theme.typography.body.fontSize,
    },
    inputFocused: { borderColor: theme.colors.borderFocus },
    inputError: { borderColor: theme.colors.danger },
    inputDisabled: { backgroundColor: theme.colors.surfaceHover, opacity: 0.5 },
    error: { marginTop: theme.spacing.xs, color: theme.colors.danger },
  });
}

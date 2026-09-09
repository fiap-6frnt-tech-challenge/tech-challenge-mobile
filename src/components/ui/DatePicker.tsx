import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme, type Theme } from '@/src/theme';

import { Button } from './Button';
import { Text } from './Text';

export interface DatePickerProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange: (isoDate: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  maximumDate?: Date;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseISODate(iso?: string): Date | undefined {
  if (!iso) return undefined;
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDisplayDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

export function DatePicker({
  label,
  placeholder = 'Selecionar data',
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  maximumDate,
  accessibilityLabel,
  style,
  testID,
}: DatePickerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<Date>(() => parseISODate(value) ?? new Date());

  const maxDate = maximumDate ?? new Date();
  const selectedDate = parseISODate(value);
  const displayValue = formatDisplayDate(value);

  function handleOpen() {
    if (disabled) return;
    setDraftDate(selectedDate ?? new Date());
    setOpen(true);
  }

  function handleAndroidChange(_event: DateTimePickerChangeEvent, date: Date) {
    setOpen(false);
    onChange(toISODate(date));
    onBlur?.();
  }

  function handleAndroidDismiss() {
    setOpen(false);
    onBlur?.();
  }

  function handleIOSChange(_event: DateTimePickerChangeEvent, date: Date) {
    setDraftDate(date);
  }

  function handleConfirmIOS() {
    onChange(toISODate(draftDate));
    setOpen(false);
    onBlur?.();
  }

  function handleCancel() {
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
        accessibilityState={{ disabled }}
        accessibilityValue={displayValue ? { text: displayValue } : undefined}
        testID={testID}
        style={[styles.field, !!error && styles.fieldError, disabled && styles.fieldDisabled]}>
        <Text style={displayValue ? styles.value : styles.placeholder}>
          {displayValue ?? placeholder}
        </Text>
        <Calendar size={20} color={theme.colors.iconSecondary} accessible={false} />
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

      {open && Platform.OS === 'android' ? (
        <DateTimePicker
          value={selectedDate ?? new Date()}
          mode="date"
          display="default"
          maximumDate={maxDate}
          onValueChange={handleAndroidChange}
          onDismiss={handleAndroidDismiss}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={open} transparent animationType="slide" onRequestClose={handleCancel}>
          <Pressable
            style={styles.backdrop}
            onPress={handleCancel}
            accessibilityLabel="Fechar seletor de data"
            accessibilityRole="button"
          />
          <View style={styles.sheet} accessibilityViewIsModal>
            {label ? (
              <Text style={styles.sheetTitle} accessibilityRole="header">
                {label}
              </Text>
            ) : null}
            <DateTimePicker
              value={draftDate}
              mode="date"
              display="inline"
              maximumDate={maxDate}
              onValueChange={handleIOSChange}
              accentColor={theme.colors.primary}
            />
            <Button title="Concluir" onPress={handleConfirmIOS} style={styles.confirmButton} />
          </View>
        </Modal>
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
    value: { color: theme.colors.text, fontSize: theme.typography.body.fontSize },
    placeholder: { color: theme.colors.placeholder, fontSize: theme.typography.body.fontSize },
    error: { marginTop: theme.spacing.xs, color: theme.colors.danger },
    backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)' },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radius.default * 2,
      borderTopRightRadius: theme.radius.default * 2,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing['2xl'],
      paddingHorizontal: theme.spacing.lg,
    },
    sheetTitle: {
      ...theme.typography.h2,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    confirmButton: { marginTop: theme.spacing.lg },
  });
}

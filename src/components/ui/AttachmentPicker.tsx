import { Camera, FileText, ImageIcon, Paperclip } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme, type Theme } from '@/src/theme';

import {
  expoAttachmentSource,
  type AttachmentSource,
  type PickedAttachment,
  type PickResult,
} from './AttachmentPicker.source';
import { Button } from './Button';
import { Text } from './Text';

export type { AttachmentSource, PickedAttachment, PickResult };

export interface AttachmentPickerProps {
  onPick: (attachment: PickedAttachment) => void;
  /** Called when a permission is denied or the picker fails. */
  onError?: (message: string) => void;
  label?: string;
  disabled?: boolean;
  source?: AttachmentSource;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

type OptionId = 'camera' | 'library' | 'document';

const OPTIONS: { id: OptionId; label: string; icon: typeof Camera }[] = [
  { id: 'camera', label: 'Tirar foto', icon: Camera },
  { id: 'library', label: 'Escolher da galeria', icon: ImageIcon },
  { id: 'document', label: 'Escolher arquivo', icon: FileText },
];

const GENERIC_ERROR = 'Não foi possível abrir o seletor. Tente novamente.';

export function AttachmentPicker({
  onPick,
  onError,
  label = 'Adicionar anexo',
  disabled = false,
  source = expoAttachmentSource,
  accessibilityLabel,
  style,
  testID,
}: AttachmentPickerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [triggerPressed, setTriggerPressed] = useState(false);

  function fail(message: string) {
    setError(message);
    onError?.(message);
  }

  async function handleSelect(option: OptionId) {
    setOpen(false);
    setError(undefined);
    setPending(true);

    try {
      const result: PickResult =
        option === 'camera'
          ? await source.pickFromCamera()
          : option === 'library'
            ? await source.pickFromLibrary()
            : await source.pickDocument();

      if (result.status === 'picked') onPick(result.attachment);
      else if (result.status === 'denied') fail(result.message);
    } catch {
      fail(GENERIC_ERROR);
    } finally {
      setPending(false);
    }
  }

  return (
    <View style={style}>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled || pending}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint="Abre as opções de câmera, galeria e arquivos"
        accessibilityState={{ disabled: disabled || pending, busy: pending, expanded: open }}
        testID={testID}
        onPressIn={() => setTriggerPressed(true)}
        onPressOut={() => setTriggerPressed(false)}
        style={[
          styles.trigger,
          !!error && styles.triggerError,
          (disabled || pending) && styles.triggerDisabled,
          triggerPressed && !disabled && !pending && styles.pressed,
        ]}>
        <Paperclip size={20} color={theme.colors.primary} />
        <Text style={styles.triggerLabel}>{pending ? 'Abrindo…' : label}</Text>
      </Pressable>

      {error ? (
        <Text
          variant="caption"
          style={styles.error}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          testID={testID ? `${testID}-error` : undefined}>
          {error}
        </Text>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(false)}
          accessibilityLabel="Fechar opções de anexo"
          accessibilityRole="button"
        />
        <View style={styles.sheet}>
          <Text variant="h2" style={styles.sheetTitle} accessibilityRole="header">
            {label}
          </Text>

          {OPTIONS.map(({ id, label: optionLabel, icon: Icon }) => (
            <Pressable
              key={id}
              onPress={() => handleSelect(id)}
              accessibilityRole="button"
              accessibilityLabel={optionLabel}
              testID={testID ? `${testID}-${id}` : undefined}
              android_ripple={{ color: theme.colors.surfaceHover }}
              style={styles.option}>
              <Icon size={20} color={theme.colors.iconDefault} />
              <Text style={styles.optionLabel}>{optionLabel}</Text>
            </Pressable>
          ))}

          <Button
            title="Cancelar"
            variant="secondary"
            onPress={() => setOpen(false)}
            style={styles.cancelButton}
            testID={testID ? `${testID}-cancel` : undefined}
          />
        </View>
      </Modal>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    trigger: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radius.default,
      borderWidth: StyleSheet.hairlineWidth,
      borderStyle: 'dashed',
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surface,
    },
    triggerError: { borderColor: theme.colors.danger },
    triggerDisabled: { opacity: 0.5 },
    pressed: { opacity: 0.7 },
    triggerLabel: { color: theme.colors.primary, fontWeight: '600' },
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
    sheetTitle: { color: theme.colors.text, marginBottom: theme.spacing.md },
    option: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    optionLabel: { color: theme.colors.text, fontSize: theme.typography.body.fontSize },
    cancelButton: { marginTop: theme.spacing.lg },
  });
}

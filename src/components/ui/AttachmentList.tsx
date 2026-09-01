import { Image } from 'expo-image';
import { FileText, Trash2, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme, type Theme } from '@/src/theme';

import { formatFileSize } from './fileSize';
import { Text } from './Text';

export type AttachmentStatus = 'uploading' | 'ready' | 'error';

export interface AttachmentItem {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url?: string;
  uri?: string;
  path?: string;
  status?: AttachmentStatus;
  progress?: number;
  errorMessage?: string;
}

export interface AttachmentListProps {
  attachments: AttachmentItem[];
  onRemove?: (attachment: AttachmentItem) => void;
  readonly?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const OPEN_ERROR = 'Não foi possível abrir o anexo.';

const IMAGE_CACHE_POLICY = 'memory-disk';
const IMAGE_TRANSITION_MS = 120;

function isImage(attachment: AttachmentItem): boolean {
  return attachment.mimeType.startsWith('image/');
}

function sourceUri(attachment: AttachmentItem): string | undefined {
  return attachment.url ?? attachment.uri;
}

function clampProgress(progress = 0): number {
  return Math.min(100, Math.max(0, Math.round(progress)));
}

export function AttachmentList({
  attachments,
  onRemove,
  readonly = false,
  style,
  testID,
}: AttachmentListProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [preview, setPreview] = useState<AttachmentItem>();
  const [openError, setOpenError] = useState<string>();

  if (attachments.length === 0) return null;

  async function handlePress(attachment: AttachmentItem) {
    setOpenError(undefined);

    const uri = sourceUri(attachment);
    if (!uri) return;

    if (isImage(attachment)) {
      setPreview(attachment);
      return;
    }

    try {
      await Linking.openURL(uri);
    } catch {
      setOpenError(OPEN_ERROR);
    }
  }

  const previewUri = preview ? sourceUri(preview) : undefined;

  return (
    <View style={style} testID={testID}>
      <View style={styles.list}>
        {attachments.map((attachment) => (
          <AttachmentRow
            key={attachment.id}
            attachment={attachment}
            onPress={() => handlePress(attachment)}
            onRemove={onRemove ? () => onRemove(attachment) : undefined}
            readonly={readonly}
            testID={testID ? `${testID}-${attachment.id}` : undefined}
          />
        ))}
      </View>

      {openError ? (
        <Text
          variant="caption"
          style={styles.listError}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          testID={testID ? `${testID}-error` : undefined}>
          {openError}
        </Text>
      ) : null}

      <Modal
        visible={!!previewUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreview(undefined)}>
        <View style={styles.previewBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setPreview(undefined)}
            accessibilityRole="button"
            accessibilityLabel="Fechar visualização"
            testID={testID ? `${testID}-preview-backdrop` : undefined}
          />

          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={styles.previewImage}
              contentFit="contain"
              cachePolicy={IMAGE_CACHE_POLICY}
              recyclingKey={preview?.id}
              transition={IMAGE_TRANSITION_MS}
              accessible
              accessibilityRole="image"
              accessibilityLabel={`Visualização de ${preview?.name}`}
              testID={testID ? `${testID}-preview-image` : undefined}
            />
          ) : null}

          <Pressable
            onPress={() => setPreview(undefined)}
            hitSlop={theme.spacing.md}
            accessibilityRole="button"
            accessibilityLabel="Fechar visualização"
            style={styles.previewClose}
            testID={testID ? `${testID}-preview-close` : undefined}>
            <X size={24} color={theme.colors.textInverse} />
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

interface AttachmentRowProps {
  attachment: AttachmentItem;
  onPress: () => void;
  onRemove?: () => void;
  readonly: boolean;
  testID?: string;
}

function AttachmentRow({ attachment, onPress, onRemove, readonly, testID }: AttachmentRowProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [pressed, setPressed] = useState(false);

  const uploading = attachment.status === 'uploading';
  const failed = attachment.status === 'error';
  const percent = clampProgress(attachment.progress);
  const sizeLabel = formatFileSize(attachment.size);
  const thumbnailUri = isImage(attachment) ? sourceUri(attachment) : undefined;
  const openable = !uploading && !failed && !!sourceUri(attachment);

  const stateLabel = uploading
    ? `, enviando ${percent}%`
    : failed
      ? ', falha no envio'
      : ', enviado';

  return (
    <View style={[styles.row, failed && styles.rowError]} testID={testID}>
      <Pressable
        onPress={openable ? onPress : undefined}
        disabled={!openable}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        accessibilityRole="button"
        accessibilityLabel={`Recibo ${attachment.name}, ${sizeLabel}${stateLabel}`}
        accessibilityHint={
          openable
            ? isImage(attachment)
              ? 'Abre a visualização da imagem'
              : 'Abre o arquivo'
            : undefined
        }
        accessibilityState={{ disabled: !openable, busy: uploading }}
        style={[styles.rowContent, pressed && openable && styles.pressed]}
        testID={testID ? `${testID}-open` : undefined}>
        {thumbnailUri ? (
          <Image
            source={{ uri: thumbnailUri }}
            style={styles.thumbnail}
            contentFit="cover"
            cachePolicy={IMAGE_CACHE_POLICY}
            recyclingKey={attachment.id}
            transition={IMAGE_TRANSITION_MS}
          />
        ) : (
          <View style={styles.thumbnailFallback}>
            <FileText size={20} color={theme.colors.iconSecondary} />
          </View>
        )}

        <View style={styles.info}>
          <Text numberOfLines={1} style={styles.name}>
            {attachment.name}
          </Text>

          {uploading ? (
            <View style={styles.progress}>
              <View
                style={styles.progressTrack}
                accessibilityRole="progressbar"
                accessibilityValue={{ min: 0, max: 100, now: percent }}>
                <View
                  style={[styles.progressFill, { width: `${percent}%` }]}
                  testID={testID ? `${testID}-progress` : undefined}
                />
              </View>
              <Text variant="caption" color="textSecondary" style={styles.percent}>
                {percent}%
              </Text>
            </View>
          ) : (
            <Text variant="caption" color={failed ? 'danger' : 'textSecondary'}>
              {failed ? (attachment.errorMessage ?? 'Falha no envio') : sizeLabel}
            </Text>
          )}
        </View>
      </Pressable>

      {!readonly && onRemove ? (
        <Pressable
          onPress={onRemove}
          hitSlop={theme.spacing.sm}
          accessibilityRole="button"
          accessibilityLabel={`Recibo ${attachment.name}, ${sizeLabel}, botão remover`}
          style={styles.removeButton}
          testID={testID ? `${testID}-remove` : undefined}>
          <Trash2 size={18} color={theme.colors.iconAccent} />
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    list: { gap: theme.spacing.sm },
    listError: { marginTop: theme.spacing.xs, color: theme.colors.danger },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingRight: theme.spacing.md,
      borderRadius: theme.radius.default,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    rowError: { borderColor: theme.colors.danger },
    rowContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      padding: theme.spacing.sm,
    },
    pressed: { opacity: 0.7 },
    thumbnail: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.default,
      backgroundColor: theme.colors.surfaceHover,
    },
    thumbnailFallback: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.default,
      backgroundColor: theme.colors.surfaceHover,
    },
    info: { flex: 1, gap: theme.spacing.xs },
    name: { color: theme.colors.text, fontWeight: '600' },
    progress: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    progressTrack: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      overflow: 'hidden',
      backgroundColor: theme.colors.border,
    },
    progressFill: { height: '100%', borderRadius: 2, backgroundColor: theme.colors.primary },
    percent: { minWidth: 36, textAlign: 'right' },
    removeButton: {
      minWidth: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xs,
    },
    previewBackdrop: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    previewImage: { width: '100%', height: '80%' },
    previewClose: {
      minWidth: 44,
      minHeight: 44,
      position: 'absolute',
      top: theme.spacing['2xl'],
      right: theme.spacing.lg,
      padding: theme.spacing.sm,
    },
  });
}

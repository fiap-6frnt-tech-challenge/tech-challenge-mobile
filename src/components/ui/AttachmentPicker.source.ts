import type { DocumentPickerAsset } from 'expo-document-picker';
import type { ImagePickerAsset, ImagePickerResult } from 'expo-image-picker';

export interface PickedAttachment {
  uri: string;
  name: string;
  contentType: string;
  size?: number;
}

export type PickResult =
  | { status: 'picked'; attachment: PickedAttachment }
  | { status: 'canceled' }
  | { status: 'denied'; message: string };

export interface AttachmentSource {
  pickFromCamera: () => Promise<PickResult>;
  pickFromLibrary: () => Promise<PickResult>;
  pickDocument: () => Promise<PickResult>;
}

const CAMERA_DENIED =
  'Permissão de câmera negada. Habilite o acesso nos ajustes do dispositivo para tirar fotos.';
const LIBRARY_DENIED =
  'Permissão de galeria negada. Habilite o acesso nos ajustes do dispositivo para escolher imagens.';

function nameFromUri(uri: string, fallback: string): string {
  const lastSegment = uri.split('?')[0].split('#')[0].split('/').pop();
  return lastSegment && lastSegment.includes('.') ? decodeURIComponent(lastSegment) : fallback;
}

function extensionFor(asset: ImagePickerAsset): string {
  const subtype = asset.mimeType?.split('/')[1];
  if (subtype) return subtype === 'jpeg' ? 'jpg' : subtype;

  const fromUri = asset.uri.split('?')[0].split('#')[0].split('.').pop();
  return fromUri && fromUri.length <= 5 ? fromUri : 'jpg';
}

/** `recibo-20260825-134500.jpg` — readable in the list and sortable in Storage. */
function receiptName(extension: string): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `recibo-${date}-${time}.${extension}`;
}

/**
 * Android's photo picker reports the MediaStore row id as the display name
 * (`34.jpg`), which tells the user nothing. Treat a stem without letters as
 * missing so it falls back to a generated name.
 */
function isDescriptiveName(name: string | null | undefined): name is string {
  if (!name) return false;
  return /[a-z]/i.test(name.replace(/\.[^.]+$/, ''));
}

function fromImageAsset(asset: ImagePickerAsset, origin: 'camera' | 'library'): PickedAttachment {
  return {
    uri: asset.uri,
    // A camera capture has no original filename — expo-image-picker names the cache
    // file after a UUID — so always generate one rather than surfacing that.
    name:
      origin === 'library' && isDescriptiveName(asset.fileName)
        ? asset.fileName
        : receiptName(extensionFor(asset)),
    contentType: asset.mimeType ?? 'image/jpeg',
    size: asset.fileSize,
  };
}

function fromDocumentAsset(asset: DocumentPickerAsset): PickedAttachment {
  return {
    uri: asset.uri,
    name: asset.name || nameFromUri(asset.uri, `arquivo-${Date.now()}`),
    contentType: asset.mimeType ?? 'application/octet-stream',
    size: asset.size,
  };
}

function fromImageResult(result: ImagePickerResult, origin: 'camera' | 'library'): PickResult {
  const asset = result.canceled ? undefined : result.assets?.[0];
  if (!asset) return { status: 'canceled' };
  return { status: 'picked', attachment: fromImageAsset(asset, origin) };
}

const loadImagePicker = () => import('expo-image-picker');
const loadDocumentPicker = () => import('expo-document-picker');

export const expoAttachmentSource: AttachmentSource = {
  async pickFromCamera() {
    const ImagePicker = await loadImagePicker();

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return { status: 'denied', message: CAMERA_DENIED };

    return fromImageResult(
      await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 }),
      'camera'
    );
  },

  async pickFromLibrary() {
    const ImagePicker = await loadImagePicker();

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return { status: 'denied', message: LIBRARY_DENIED };

    return fromImageResult(
      await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 }),
      'library'
    );
  },

  async pickDocument() {
    const DocumentPicker = await loadDocumentPicker();

    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    const asset = result.canceled ? undefined : result.assets?.[0];
    if (!asset) return { status: 'canceled' };
    return { status: 'picked', attachment: fromDocumentAsset(asset) };
  },
};

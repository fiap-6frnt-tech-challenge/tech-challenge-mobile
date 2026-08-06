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

function fromImageAsset(asset: ImagePickerAsset): PickedAttachment {
  return {
    uri: asset.uri,
    name: asset.fileName ?? nameFromUri(asset.uri, `foto-${Date.now()}.jpg`),
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

function fromImageResult(result: ImagePickerResult): PickResult {
  const asset = result.canceled ? undefined : result.assets?.[0];
  if (!asset) return { status: 'canceled' };
  return { status: 'picked', attachment: fromImageAsset(asset) };
}

const loadImagePicker = () => import('expo-image-picker');
const loadDocumentPicker = () => import('expo-document-picker');

export const expoAttachmentSource: AttachmentSource = {
  async pickFromCamera() {
    const ImagePicker = await loadImagePicker();

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return { status: 'denied', message: CAMERA_DENIED };

    return fromImageResult(
      await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 })
    );
  },

  async pickFromLibrary() {
    const ImagePicker = await loadImagePicker();

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return { status: 'denied', message: LIBRARY_DENIED };

    return fromImageResult(
      await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 })
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

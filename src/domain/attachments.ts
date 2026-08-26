import { MAX_TRANSACTION_ATTACHMENTS } from './schema';

/** Storage rules reject anything bigger; keep both sides in sync. */
export const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

export const ATTACHMENT_TYPE_ERROR = 'Tipo não permitido. Use JPG, PNG, WEBP ou PDF.';
export const ATTACHMENT_SIZE_ERROR = 'Arquivo excede o limite de 5 MB.';
export const ATTACHMENT_LIMIT_ERROR = `Máximo de ${MAX_TRANSACTION_ATTACHMENTS} anexos por transação.`;

export interface AttachmentCandidate {
  mimeType: string;
  /** Pickers do not always report a size; the upload re-checks the blob. */
  size?: number;
}

export function isAllowedAttachmentType(mimeType: string): boolean {
  return (ALLOWED_ATTACHMENT_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function isAllowedAttachmentSize(size: number): boolean {
  return size <= MAX_ATTACHMENT_SIZE_BYTES;
}

/** Returns the message to show the user, or `null` when the file can be uploaded. */
export function validateAttachmentCandidate(
  candidate: AttachmentCandidate,
  currentCount: number
): string | null {
  if (currentCount >= MAX_TRANSACTION_ATTACHMENTS) return ATTACHMENT_LIMIT_ERROR;
  if (!isAllowedAttachmentType(candidate.mimeType)) return ATTACHMENT_TYPE_ERROR;
  if (candidate.size !== undefined && !isAllowedAttachmentSize(candidate.size)) {
    return ATTACHMENT_SIZE_ERROR;
  }
  return null;
}

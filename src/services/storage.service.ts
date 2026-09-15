import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import {
  ATTACHMENT_SIZE_ERROR,
  ATTACHMENT_TYPE_ERROR,
  isAllowedAttachmentSize,
  isAllowedAttachmentType,
} from '../domain';

export const storageService = {
  async uploadReceipt(
    uid: string,
    txId: string,
    localUri: string,
    name: string,
    contentType: string,
    onProgress?: (pct: number) => void
  ) {
    if (!isAllowedAttachmentType(contentType)) throw new Error(ATTACHMENT_TYPE_ERROR);

    const res = await fetch(localUri);
    const blob = await res.blob();
    if (!isAllowedAttachmentSize(blob.size)) throw new Error(ATTACHMENT_SIZE_ERROR);

    const path = `receipts/${uid}/${txId}/${Date.now()}-${name}`;
    const task = uploadBytesResumable(ref(storage, path), blob, { contentType });

    return new Promise<{ url: string; path: string; size: number }>((resolve, reject) => {
      task.on(
        'state_changed',
        (s) => onProgress?.(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
        reject,
        async () => resolve({ url: await getDownloadURL(task.snapshot.ref), path, size: blob.size })
      );
    });
  },

  async deleteReceipt(path: string) {
    await deleteObject(ref(storage, path));
  },
};

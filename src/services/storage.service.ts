import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

const MAX = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const storageService = {
  async uploadReceipt(
    uid: string,
    txId: string,
    localUri: string,
    name: string,
    contentType: string,
    onProgress?: (pct: number) => void
  ) {
    if (!ALLOWED.includes(contentType)) throw new Error('Tipo não permitido');

    const res = await fetch(localUri);
    const blob = await res.blob();
    if (blob.size > MAX) throw new Error('Arquivo excede 5MB');

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

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { deleteObject, getDownloadURL, getMetadata, ref, uploadBytes } from 'firebase/storage';

import { auth, storage } from '@/src/services/firebase';

export type SpikeAuthResult = {
  uid: string | null;
  email: string | null;
  isAuthenticated: boolean;
  operation: 'created' | 'signed-in' | 'current-session' | 'signed-out' | 'none';
};

export type SpikeStorageResult = {
  fullPath: string;
  downloadUrl: string;
  contentType: string | undefined;
  size: number;
  deleted: boolean;
};

function toAuthResult(user: User | null, operation: SpikeAuthResult['operation']): SpikeAuthResult {
  return {
    uid: user?.uid ?? null,
    email: user?.email ?? null,
    isAuthenticated: Boolean(user),
    operation,
  };
}

function isEmailAlreadyInUse(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'auth/email-already-in-use'
  );
}

export function waitForAuthState(): Promise<User | null> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
}

export async function signInOrCreateSpikeUser(
  email: string,
  password: string
): Promise<SpikeAuthResult> {
  const normalizedEmail = email.trim();

  try {
    const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    return toAuthResult(credential.user, 'created');
  } catch (error) {
    if (!isEmailAlreadyInUse(error)) throw error;
  }

  const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
  return toAuthResult(credential.user, 'signed-in');
}

export function getCurrentSpikeSession(): SpikeAuthResult {
  return toAuthResult(auth.currentUser, auth.currentUser ? 'current-session' : 'none');
}

export async function signOutSpikeUser(): Promise<void> {
  await signOut(auth);
}

export async function runStorageUploadDeleteSpike(uid: string): Promise<SpikeStorageResult> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fullPath = `receipts/${uid}/spike/firebase-storage-spike-${timestamp}.txt`;
  const storageRef = ref(storage, fullPath);
  const blob = new Blob([`bytebank firebase storage spike ${timestamp}`], {
    type: 'text/plain',
  });

  const uploadResult = await uploadBytes(storageRef, blob, {
    contentType: 'text/plain',
    customMetadata: {
      source: 'firebase-risk-spike',
    },
  });

  try {
    const [metadata, downloadUrl] = await Promise.all([
      getMetadata(uploadResult.ref),
      getDownloadURL(uploadResult.ref),
    ]);

    return {
      fullPath,
      downloadUrl,
      contentType: metadata.contentType,
      size: metadata.size,
      deleted: true,
    };
  } finally {
    await deleteObject(uploadResult.ref);
  }
}

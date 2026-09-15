import { beforeEach, describe, expect, it, vi } from 'vitest';

import { runStorageUploadDeleteSpike, signInOrCreateSpikeUser } from './firebaseRiskSpike';

const firebaseAuth = vi.hoisted(() => ({
  createUserWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}));

const firebaseService = vi.hoisted(() => ({
  auth: {},
  storage: {},
}));

const firebaseStorage = vi.hoisted(() => ({
  deleteObject: vi.fn(),
  getDownloadURL: vi.fn(),
  getMetadata: vi.fn(),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
}));

vi.mock('firebase/auth', () => firebaseAuth);

vi.mock('firebase/storage', () => firebaseStorage);

vi.mock('@/src/services/firebase', () => firebaseService);

describe('signInOrCreateSpikeUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new user without relying on sign-in error enumeration', async () => {
    firebaseAuth.signInWithEmailAndPassword.mockRejectedValue(
      Object.assign(new Error('Invalid credentials'), {
        code: 'auth/invalid-credential',
      })
    );
    firebaseAuth.createUserWithEmailAndPassword.mockResolvedValue({
      user: {
        uid: 'new-user-id',
        email: 'new-user@example.com',
      },
    });

    await expect(signInOrCreateSpikeUser(' new-user@example.com ', 'secret123')).resolves.toEqual({
      uid: 'new-user-id',
      email: 'new-user@example.com',
      isAuthenticated: true,
      operation: 'created',
    });
  });

  it('signs in when the account already exists', async () => {
    firebaseAuth.createUserWithEmailAndPassword.mockRejectedValue(
      Object.assign(new Error('Email already in use'), {
        code: 'auth/email-already-in-use',
      })
    );
    firebaseAuth.signInWithEmailAndPassword.mockResolvedValue({
      user: {
        uid: 'existing-user-id',
        email: 'existing-user@example.com',
      },
    });

    await expect(
      signInOrCreateSpikeUser(' existing-user@example.com ', 'secret123')
    ).resolves.toEqual({
      uid: 'existing-user-id',
      email: 'existing-user@example.com',
      isAuthenticated: true,
      operation: 'signed-in',
    });
    expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      firebaseService.auth,
      'existing-user@example.com',
      'secret123'
    );
    expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
      firebaseService.auth,
      'existing-user@example.com',
      'secret123'
    );
  });

  it('preserves account creation errors without attempting sign-in', async () => {
    const creationError = Object.assign(new Error('Password is too weak'), {
      code: 'auth/weak-password',
    });
    firebaseAuth.createUserWithEmailAndPassword.mockRejectedValue(creationError);

    await expect(signInOrCreateSpikeUser('new-user@example.com', 'weak')).rejects.toBe(
      creationError
    );
    expect(firebaseAuth.signInWithEmailAndPassword).not.toHaveBeenCalled();
  });
});

describe('runStorageUploadDeleteSpike', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads an allowed PDF, reads it, and removes it from Storage', async () => {
    const storageRef = { fullPath: 'receipts/user-id/spike/firebase-storage-spike.pdf' };
    const uploadedRef = { ...storageRef };

    firebaseStorage.ref.mockReturnValue(storageRef);
    firebaseStorage.uploadBytes.mockResolvedValue({ ref: uploadedRef });
    firebaseStorage.getMetadata.mockResolvedValue({
      contentType: 'application/pdf',
      size: 64,
    });
    firebaseStorage.getDownloadURL.mockResolvedValue('https://storage.test/spike.pdf');
    firebaseStorage.deleteObject.mockResolvedValue(undefined);

    const result = await runStorageUploadDeleteSpike('user-id');

    expect(firebaseStorage.ref).toHaveBeenCalledWith(
      firebaseService.storage,
      expect.stringMatching(/^receipts\/user-id\/spike\/firebase-storage-spike-.+\.pdf$/)
    );
    expect(firebaseStorage.uploadBytes).toHaveBeenCalledWith(
      storageRef,
      expect.any(Blob),
      expect.objectContaining({
        contentType: 'application/pdf',
      })
    );
    expect(firebaseStorage.getMetadata).toHaveBeenCalledWith(uploadedRef);
    expect(firebaseStorage.getDownloadURL).toHaveBeenCalledWith(uploadedRef);
    expect(firebaseStorage.deleteObject).toHaveBeenCalledWith(uploadedRef);
    expect(result).toEqual({
      fullPath: expect.stringMatching(/^receipts\/user-id\/spike\/firebase-storage-spike-.+\.pdf$/),
      downloadUrl: 'https://storage.test/spike.pdf',
      contentType: 'application/pdf',
      size: 64,
      deleted: true,
    });
  });
});

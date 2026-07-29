import { beforeEach, describe, expect, it, vi } from 'vitest';

import { signInOrCreateSpikeUser } from './firebaseRiskSpike';

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

vi.mock('firebase/auth', () => firebaseAuth);

vi.mock('firebase/storage', () => ({
  deleteObject: vi.fn(),
  getDownloadURL: vi.fn(),
  getMetadata: vi.fn(),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
}));

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

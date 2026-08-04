import { beforeEach, describe, expect, it, vi } from 'vitest';

import { authService } from './auth.service';

const firebaseInstances = vi.hoisted(() => ({
  auth: { name: 'auth-instance' },
  db: { name: 'firestore-instance' },
}));

const firebaseAuth = vi.hoisted(() => ({
  createUserWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}));

const firestore = vi.hoisted(() => ({
  doc: vi.fn(),
  serverTimestamp: vi.fn(),
  setDoc: vi.fn(),
}));

vi.mock('./firebase', () => firebaseInstances);
vi.mock('firebase/auth', () => firebaseAuth);
vi.mock('firebase/firestore', () => firestore);

describe('authService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('creates an Auth user, updates the display name, and writes the profile document', async () => {
    const user = {
      uid: 'user-123',
      email: 'erick@example.com',
    };
    const profileRef = { path: 'users/user-123' };
    const createdAt = { kind: 'server-timestamp' };

    firebaseAuth.createUserWithEmailAndPassword.mockResolvedValue({ user });
    firebaseAuth.updateProfile.mockResolvedValue(undefined);
    firestore.doc.mockReturnValue(profileRef);
    firestore.serverTimestamp.mockReturnValue(createdAt);
    firestore.setDoc.mockResolvedValue(undefined);

    await expect(authService.signUp('erick@example.com', 'secret123', 'Erick')).resolves.toBe(user);

    expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      firebaseInstances.auth,
      'erick@example.com',
      'secret123'
    );
    expect(firebaseAuth.updateProfile).toHaveBeenCalledWith(user, {
      displayName: 'Erick',
    });
    expect(firestore.doc).toHaveBeenCalledWith(firebaseInstances.db, 'users', 'user-123');
    expect(firestore.setDoc).toHaveBeenCalledWith(profileRef, {
      name: 'Erick',
      email: 'erick@example.com',
      createdAt,
    });
  });

  it('returns the authenticated user on sign in', async () => {
    const user = { uid: 'user-123' };
    firebaseAuth.signInWithEmailAndPassword.mockResolvedValue({ user });

    await expect(authService.signIn('erick@example.com', 'secret123')).resolves.toBe(user);
    expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
      firebaseInstances.auth,
      'erick@example.com',
      'secret123'
    );
  });

  it('signs out from the configured Auth instance', async () => {
    firebaseAuth.signOut.mockResolvedValue(undefined);

    await expect(authService.signOut()).resolves.toBeUndefined();
    expect(firebaseAuth.signOut).toHaveBeenCalledWith(firebaseInstances.auth);
  });

  it('subscribes to auth changes and returns the Firebase unsubscribe function', () => {
    const callback = vi.fn();
    const unsubscribe = vi.fn();
    firebaseAuth.onAuthStateChanged.mockReturnValue(unsubscribe);

    expect(authService.subscribe(callback)).toBe(unsubscribe);
    expect(firebaseAuth.onAuthStateChanged).toHaveBeenCalledWith(firebaseInstances.auth, callback);
  });

  it('propagates sign-up errors unchanged', async () => {
    const error = Object.assign(new Error('email already in use'), {
      code: 'auth/email-already-in-use',
    });
    firebaseAuth.createUserWithEmailAndPassword.mockRejectedValue(error);

    await expect(authService.signUp('erick@example.com', 'secret123', 'Erick')).rejects.toBe(error);
  });

  it('propagates sign-in errors unchanged', async () => {
    const error = Object.assign(new Error('wrong password'), {
      code: 'auth/wrong-password',
    });
    firebaseAuth.signInWithEmailAndPassword.mockRejectedValue(error);

    await expect(authService.signIn('erick@example.com', 'wrong')).rejects.toBe(error);
  });
});

import type { User } from 'firebase/auth';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthStateSubscriber } from '../services/auth.service';
import { AuthProvider, useAuth } from './AuthContext';

const authServiceMocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
  subscribe: vi.fn(),
}));

vi.mock('../services/auth.service', () => ({
  authService: authServiceMocks,
}));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

type AuthValue = ReturnType<typeof useAuth>;

const signedInUser = { uid: 'user-123', email: 'erick@example.com' } as User;
const unsubscribe = vi.fn();

let authSubscriber: AuthStateSubscriber | undefined;
let latestAuthValue: AuthValue | undefined;
let renderer: ReactTestRenderer | undefined;

function AuthProbe() {
  // The probe intentionally exposes the current context value to the test.
  // eslint-disable-next-line react-hooks/globals
  latestAuthValue = useAuth();
  return null;
}

function currentAuth(): AuthValue {
  if (!latestAuthValue) throw new Error('AuthProvider has not rendered');
  return latestAuthValue;
}

function renderProvider(): void {
  act(() => {
    renderer = create(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );
  });
}

function emitAuthState(user: User | null): void {
  if (!authSubscriber) throw new Error('Auth subscription is not active');
  act(() => authSubscriber?.(user));
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authSubscriber = undefined;
    latestAuthValue = undefined;
    renderer = undefined;
    authServiceMocks.subscribe.mockImplementation((subscriber: AuthStateSubscriber) => {
      authSubscriber = subscriber;
      return unsubscribe;
    });
  });

  afterEach(() => {
    if (renderer) {
      act(() => renderer?.unmount());
      renderer = undefined;
    }
  });

  it('keeps loading true until the first auth-state emission', () => {
    renderProvider();

    expect(currentAuth().user).toBeNull();
    expect(currentAuth().loading).toBe(true);
    expect(authServiceMocks.subscribe).toHaveBeenCalledOnce();

    emitAuthState(null);

    expect(currentAuth().user).toBeNull();
    expect(currentAuth().loading).toBe(false);
  });

  it('reflects an authenticated user emitted by Firebase', () => {
    renderProvider();

    emitAuthState(signedInUser);

    expect(currentAuth().user).toBe(signedInUser);
    expect(currentAuth().loading).toBe(false);
  });

  it('unsubscribes when the provider unmounts', () => {
    renderProvider();

    act(() => renderer?.unmount());
    renderer = undefined;

    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it('delegates sign in and reflects the subsequent authenticated emission', async () => {
    authServiceMocks.signIn.mockResolvedValue(signedInUser);
    renderProvider();
    emitAuthState(null);

    await act(async () => {
      await currentAuth().signIn('erick@example.com', 'secret123');
    });

    expect(authServiceMocks.signIn).toHaveBeenCalledWith('erick@example.com', 'secret123');
    expect(currentAuth().user).toBeNull();

    emitAuthState(signedInUser);

    expect(currentAuth().user).toBe(signedInUser);
  });

  it('delegates sign up with the profile name', async () => {
    authServiceMocks.signUp.mockResolvedValue(signedInUser);
    renderProvider();

    await act(async () => {
      await currentAuth().signUp('erick@example.com', 'secret123', 'Erick');
    });

    expect(authServiceMocks.signUp).toHaveBeenCalledWith('erick@example.com', 'secret123', 'Erick');
  });

  it('delegates sign out and clears the user after the signed-out emission', async () => {
    authServiceMocks.signOut.mockResolvedValue(undefined);
    renderProvider();
    emitAuthState(signedInUser);

    await act(async () => {
      await currentAuth().signOut();
    });

    expect(authServiceMocks.signOut).toHaveBeenCalledOnce();
    expect(currentAuth().user).toBe(signedInUser);

    emitAuthState(null);

    expect(currentAuth().user).toBeNull();
  });

  it('propagates authentication action errors unchanged', async () => {
    const error = Object.assign(new Error('wrong password'), {
      code: 'auth/wrong-password',
    });
    authServiceMocks.signIn.mockRejectedValue(error);
    renderProvider();

    await expect(currentAuth().signIn('erick@example.com', 'wrong')).rejects.toBe(error);
  });
});

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
});

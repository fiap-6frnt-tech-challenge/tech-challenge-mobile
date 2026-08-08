import { FirebaseError } from 'firebase/app';
import { describe, expect, it } from 'vitest';

import { AUTH_ERROR_FALLBACK, mapAuthError } from './auth.errors';

describe('mapAuthError', () => {
  it.each([
    ['auth/email-already-in-use', 'E-mail já cadastrado'],
    ['auth/invalid-credential', 'E-mail ou senha incorretos'],
    ['auth/wrong-password', 'E-mail ou senha incorretos'],
    ['auth/network-request-failed', 'Sem conexão. Verifique sua internet e tente novamente'],
  ])('maps %s to a pt-BR message', (code, message) => {
    expect(mapAuthError(new FirebaseError(code, 'raw firebase message'))).toBe(message);
  });

  it('maps plain error objects carrying a Firebase code', () => {
    const error = Object.assign(new Error('wrong password'), { code: 'auth/wrong-password' });

    expect(mapAuthError(error)).toBe('E-mail ou senha incorretos');
  });

  it('never leaks the raw Firebase code for unknown errors', () => {
    expect(mapAuthError(new FirebaseError('auth/internal-error', 'boom'))).toBe(
      AUTH_ERROR_FALLBACK
    );
  });

  it.each([[new Error('boom')], [undefined], [null], ['auth/invalid-credential'], [{ code: 42 }]])(
    'falls back for non-Firebase failures (%s)',
    (error) => {
      expect(mapAuthError(error)).toBe(AUTH_ERROR_FALLBACK);
    }
  );
});

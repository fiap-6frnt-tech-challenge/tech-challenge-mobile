import { describe, expect, it } from 'vitest';

import { loginSchema, registerSchema } from './authSchema';

const validLogin = {
  email: 'erick@example.com',
  password: 'secret123',
};

const validRegister = {
  ...validLogin,
  name: 'Erick',
  confirm: 'secret123',
};

function firstIssue(result: {
  success: boolean;
  error?: { issues: { path: PropertyKey[]; message: string }[] };
}) {
  return result.error?.issues[0];
}

describe('loginSchema', () => {
  it('accepts a valid credential pair', () => {
    expect(loginSchema.parse(validLogin)).toEqual(validLogin);
  });

  it('trims surrounding whitespace from the e-mail', () => {
    expect(loginSchema.parse({ ...validLogin, email: '  erick@example.com  ' }).email).toBe(
      'erick@example.com'
    );
  });

  it.each(['erick', 'erick@', '@example.com', 'erick @example.com'])(
    'rejects the malformed e-mail %s',
    (email) => {
      const result = loginSchema.safeParse({ ...validLogin, email });

      expect(result.success).toBe(false);
      expect(firstIssue(result)).toMatchObject({ path: ['email'], message: 'E-mail inválido' });
    }
  );

  it('asks for an e-mail when the field is empty', () => {
    const result = loginSchema.safeParse({ ...validLogin, email: '   ' });

    expect(firstIssue(result)).toMatchObject({ message: 'Informe seu e-mail' });
  });

  it('rejects passwords shorter than 6 characters', () => {
    const result = loginSchema.safeParse({ ...validLogin, password: '12345' });

    expect(result.success).toBe(false);
    expect(firstIssue(result)).toMatchObject({
      path: ['password'],
      message: 'Mínimo 6 caracteres',
    });
  });

  it('keeps the password untouched', () => {
    expect(loginSchema.parse({ ...validLogin, password: ' spaced ' }).password).toBe(' spaced ');
  });
});

describe('registerSchema', () => {
  it('accepts a valid registration', () => {
    expect(registerSchema.parse(validRegister)).toEqual(validRegister);
  });

  it('rejects a name shorter than 2 characters', () => {
    const result = registerSchema.safeParse({ ...validRegister, name: 'E' });

    expect(result.success).toBe(false);
    expect(firstIssue(result)).toMatchObject({ path: ['name'], message: 'Informe seu nome' });
  });

  it('reports mismatching passwords on the confirm field', () => {
    const result = registerSchema.safeParse({ ...validRegister, confirm: 'secret124' });

    expect(result.success).toBe(false);
    expect(firstIssue(result)).toMatchObject({
      path: ['confirm'],
      message: 'Senhas não conferem',
    });
  });

  it('inherits the login e-mail and password rules', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      email: 'nope',
      password: '123',
      confirm: '123',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual(
      expect.arrayContaining(['email', 'password'])
    );
  });
});

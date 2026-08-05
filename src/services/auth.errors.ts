import { FirebaseError } from 'firebase/app';

export const AUTH_ERROR_FALLBACK = 'Não foi possível concluir. Tente novamente.';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'E-mail já cadastrado',
  'auth/invalid-credential': 'E-mail ou senha incorretos',
  'auth/invalid-email': 'E-mail inválido',
  'auth/user-not-found': 'E-mail ou senha incorretos',
  'auth/wrong-password': 'E-mail ou senha incorretos',
  'auth/missing-password': 'Informe sua senha',
  'auth/weak-password': 'Senha muito fraca — use ao menos 6 caracteres',
  'auth/user-disabled': 'Esta conta está desativada',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente',
  'auth/network-request-failed': 'Sem conexão. Verifique sua internet e tente novamente',
  'auth/operation-not-allowed': 'Login por e-mail e senha não está habilitado',
  'auth/requires-recent-login': 'Entre novamente para concluir esta ação',
};

function errorCode(error: unknown): string | undefined {
  if (error instanceof FirebaseError) return error.code;
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const { code } = error as { code: unknown };
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

export function mapAuthError(error: unknown): string {
  const code = errorCode(error);
  return (code && AUTH_ERROR_MESSAGES[code]) || AUTH_ERROR_FALLBACK;
}

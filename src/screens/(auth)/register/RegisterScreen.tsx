import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View, type TextInput } from 'react-native';

import { AuthFooterLink } from '@/src/components/features/auth/AuthFooterLink';
import { AuthFormError } from '@/src/components/features/auth/AuthFormError';
import { AuthScreenLayout } from '@/src/components/features/auth/AuthScreenLayout';
import { Button } from '@/src/components/ui/Button';
import { TextField } from '@/src/components/ui/TextField';
import { useAuth } from '@/src/contexts/AuthContext';
import { registerSchema } from '@/src/domain/authSchema';
import { mapAuthError } from '@/src/services/auth.errors';
import { useTheme, type Theme } from '@/src/theme';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirm: '' },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setFormError(null);
    try {
      await signUp(email, password, name);
      router.replace('/');
    } catch (error) {
      setFormError(mapAuthError(error));
    }
  });

  return (
    <AuthScreenLayout
      title="Criar conta"
      subtitle="Leva menos de um minuto para começar."
      testID="register-screen">
      <View style={styles.form}>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
              label="Nome"
              placeholder="Como podemos te chamar?"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              disabled={isSubmitting}
              testID="register-name"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
              ref={emailRef}
              label="E-mail"
              placeholder="voce@email.com"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              disabled={isSubmitting}
              testID="register-email"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
              ref={passwordRef}
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              disabled={isSubmitting}
              testID="register-password"
            />
          )}
        />

        <Controller
          control={control}
          name="confirm"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
              ref={confirmRef}
              label="Confirmar senha"
              placeholder="Repita a senha"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="go"
              onSubmitEditing={onSubmit}
              disabled={isSubmitting}
              testID="register-confirm"
            />
          )}
        />

        {formError ? <AuthFormError message={formError} testID="register-form-error" /> : null}

        <Button
          title="Criar conta"
          onPress={onSubmit}
          loading={isSubmitting}
          style={styles.submit}
          testID="register-submit"
        />
      </View>

      <AuthFooterLink
        prompt="Já tem uma conta?"
        label="Entrar"
        href="/login"
        testID="register-login-link"
      />
    </AuthScreenLayout>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    form: { gap: theme.spacing.lg },
    submit: { marginTop: theme.spacing.xs },
  });
}

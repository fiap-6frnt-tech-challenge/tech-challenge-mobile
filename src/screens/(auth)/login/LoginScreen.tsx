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
import { loginSchema } from '@/src/domain/authSchema';
import { mapAuthError } from '@/src/services/auth.errors';
import { useTheme, type Theme } from '@/src/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const passwordRef = useRef<TextInput>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFormError(null);
    try {
      await signIn(email, password);
      router.replace('/');
    } catch (error) {
      setFormError(mapAuthError(error));
    }
  });

  return (
    <AuthScreenLayout
      title="Entrar"
      subtitle="Acesse sua conta para acompanhar suas finanças."
      testID="login-screen">
      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
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
              testID="login-email"
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
              placeholder="Sua senha"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={onSubmit}
              disabled={isSubmitting}
              testID="login-password"
            />
          )}
        />

        {formError ? <AuthFormError message={formError} testID="login-form-error" /> : null}

        <Button
          title="Entrar"
          onPress={onSubmit}
          loading={isSubmitting}
          style={styles.submit}
          testID="login-submit"
        />
      </View>

      <AuthFooterLink
        prompt="Ainda não tem conta?"
        label="Criar conta"
        href="/register"
        testID="login-register-link"
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

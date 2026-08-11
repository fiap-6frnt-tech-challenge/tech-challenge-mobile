import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/ui/Button';
import { Chip } from '@/src/components/ui/Chip';
import { CurrencyInput } from '@/src/components/ui/CurrencyInput';
import { DatePicker } from '@/src/components/ui/DatePicker';
import { SegmentedControl } from '@/src/components/ui/SegmentedControl';
import { Select } from '@/src/components/ui/Select';
import { Text } from '@/src/components/ui/Text';
import { TextField } from '@/src/components/ui/TextField';
import {
  CATEGORIES,
  TRANSACTION_TYPE,
  TRANSACTION_TYPE_OPTIONS,
  suggestCategory,
  transactionFormSchema,
  type TransactionFormValues,
} from '@/src/domain';
import { useTheme, type Theme } from '@/src/theme';

const CATEGORY_OPTIONS = CATEGORIES.map(({ id, label }) => ({ value: id, label }));

function todayISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export interface TransactionFormProps {
  initialValues?: Partial<TransactionFormValues>;
  submitLabel?: string;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  footer?: ReactNode;
  testID?: string;
}

export function TransactionForm({
  initialValues,
  submitLabel = 'Salvar',
  onSubmit,
  footer,
  testID = 'transaction-form',
}: TransactionFormProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [formError, setFormError] = useState<string | null>(null);
  const [categoryTouched, setCategoryTouched] = useState(Boolean(initialValues?.category));

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: TRANSACTION_TYPE.WITHDRAWAL,
      amount: 0,
      date: todayISO(),
      description: '',
      ...initialValues,
    },
    mode: 'onTouched',
  });

  const description = useWatch({ control, name: 'description' });
  const category = useWatch({ control, name: 'category' });
  const suggestion = useMemo(() => suggestCategory(description ?? ''), [description]);

  useEffect(() => {
    if (categoryTouched || !suggestion || suggestion === category) return;
    setValue('category', suggestion, { shouldValidate: true });
  }, [categoryTouched, suggestion, category, setValue]);

  const showSuggestion = !categoryTouched && suggestion !== null && category === suggestion;

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch {
      setFormError('Não foi possível salvar a transação. Tente novamente.');
    }
  });

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.select({ ios: 'padding', default: undefined })}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        testID={testID}>
        <Controller
          control={control}
          name="type"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <View>
              <Text style={styles.label}>Tipo</Text>
              <SegmentedControl
                options={TRANSACTION_TYPE_OPTIONS}
                value={value}
                onChange={onChange}
                accessibilityLabel="Tipo da transação"
                testID={`${testID}-type`}
              />
              {error ? (
                <Text
                  style={styles.error}
                  accessibilityLiveRegion="polite"
                  accessibilityRole="alert">
                  {error.message}
                </Text>
              ) : null}
            </View>
          )}
        />

        <Controller
          control={control}
          name="amount"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <CurrencyInput
              label="Valor"
              value={value}
              onChangeValue={onChange}
              onBlur={onBlur}
              error={error?.message}
              disabled={isSubmitting}
              testID={`${testID}-amount`}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
              label="Descrição"
              placeholder="Ex.: Uber para o trabalho"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              autoCapitalize="sentences"
              returnKeyType="next"
              disabled={isSubmitting}
              testID={`${testID}-description`}
            />
          )}
        />

        <Controller
          control={control}
          name="category"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <View>
              <Select
                label="Categoria"
                placeholder="Selecionar categoria"
                options={CATEGORY_OPTIONS}
                value={value}
                onChange={(next) => {
                  setCategoryTouched(true);
                  onChange(next);
                }}
                onBlur={onBlur}
                error={error?.message}
                disabled={isSubmitting}
                testID={`${testID}-category`}
              />
              {showSuggestion ? (
                <Chip
                  label="Sugerido pela descrição"
                  style={styles.suggestion}
                  testID={`${testID}-category-suggestion`}
                />
              ) : null}
            </View>
          )}
        />

        <Controller
          control={control}
          name="date"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <DatePicker
              label="Data"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={error?.message}
              disabled={isSubmitting}
              testID={`${testID}-date`}
            />
          )}
        />

        {formError ? (
          <Text
            style={styles.error}
            color="danger"
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            testID={`${testID}-error`}>
            {formError}
          </Text>
        ) : null}

        <Button
          title={submitLabel}
          onPress={submit}
          loading={isSubmitting}
          style={styles.submit}
          testID={`${testID}-submit`}
        />

        {footer}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    fill: { flex: 1 },
    content: {
      flexGrow: 1,
      padding: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    label: {
      marginBottom: theme.spacing.xs,
      color: theme.colors.text,
      fontWeight: '600',
    },
    suggestion: { marginTop: theme.spacing.sm },
    error: { marginTop: theme.spacing.xs, color: theme.colors.danger },
    submit: { marginTop: theme.spacing.xs },
  });
}

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AttachmentList, type AttachmentItem } from '@/src/components/ui/AttachmentList';
import { AttachmentPicker, type PickedAttachment } from '@/src/components/ui/AttachmentPicker';
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
  MAX_TRANSACTION_ATTACHMENTS,
  TRANSACTION_TYPE,
  TRANSACTION_TYPE_OPTIONS,
  suggestCategory,
  transactionFormSchema,
  type Attachment,
  type TransactionFormValues,
} from '@/src/domain';
import { useTheme, type Theme } from '@/src/theme';

const CATEGORY_OPTIONS = CATEGORIES.map(({ id, label }) => ({ value: id, label }));
const ATTACHMENT_HINT = `Até ${MAX_TRANSACTION_ATTACHMENTS} arquivos JPG, PNG, WEBP ou PDF de até 5 MB.`;

function isStored(item: AttachmentItem): item is AttachmentItem & Pick<Attachment, 'url' | 'path'> {
  return Boolean(item.url && item.path);
}

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
  attachments?: AttachmentItem[];
  onPickAttachment?: (picked: PickedAttachment) => void;
  onRemoveAttachment?: (item: AttachmentItem) => void;
  onAttachmentError?: (message: string) => void;
  attachmentError?: string | null;
  canAddAttachment?: boolean;
  attachmentsBusy?: boolean;
  testID?: string;
}

export function TransactionForm({
  initialValues,
  submitLabel = 'Salvar',
  onSubmit,
  footer,
  attachments,
  onPickAttachment,
  onRemoveAttachment,
  onAttachmentError,
  attachmentError,
  canAddAttachment = true,
  attachmentsBusy = false,
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
    formState: { isSubmitting, errors },
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

  const storedAttachments = useMemo<Attachment[]>(
    () =>
      (attachments ?? []).filter(isStored).map(({ id, name, size, mimeType, url, path }) => ({
        id,
        name,
        size,
        mimeType,
        url,
        path,
      })),
    [attachments]
  );

  useEffect(() => {
    setValue('attachments', storedAttachments, { shouldValidate: true });
  }, [setValue, storedAttachments]);

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

        {onPickAttachment ? (
          <View style={styles.attachments}>
            <Text style={styles.label}>Anexos</Text>

            <AttachmentList
              attachments={attachments ?? []}
              onRemove={onRemoveAttachment}
              readonly={isSubmitting}
              testID={`${testID}-attachments`}
            />

            <AttachmentPicker
              onPick={onPickAttachment}
              onError={onAttachmentError}
              disabled={isSubmitting || attachmentsBusy || !canAddAttachment}
              label={canAddAttachment ? 'Adicionar anexo' : 'Limite de anexos atingido'}
              testID={`${testID}-attachment-picker`}
            />

            {attachmentError || errors.attachments ? (
              <Text
                variant="caption"
                color="danger"
                accessibilityLiveRegion="polite"
                accessibilityRole="alert"
                testID={`${testID}-attachment-error`}>
                {attachmentError ?? errors.attachments?.message}
              </Text>
            ) : (
              <Text variant="caption" color="textSecondary">
                {ATTACHMENT_HINT}
              </Text>
            )}
          </View>
        ) : null}

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
          disabled={attachmentsBusy}
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
    attachments: { gap: theme.spacing.sm },
    error: { marginTop: theme.spacing.xs, color: theme.colors.danger },
    submit: { marginTop: theme.spacing.xs },
  });
}

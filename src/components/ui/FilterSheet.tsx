import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { CATEGORIES, type CategoryId } from '@/src/domain/categories';
import { TRANSACTION_TYPE_OPTIONS } from '@/src/domain/constants';
import type { TransactionType } from '@/src/domain/transaction';
import { useTheme, type Theme } from '@/src/theme';
import { Button } from './Button';
import { Chip } from './Chip';
import { DatePicker } from './DatePicker';
import { Text } from './Text';

export interface FilterSheetValue {
  type?: TransactionType;
  categories?: CategoryId[];
  dateFrom?: string;
  dateTo?: string;
}

export interface FilterSheetProps {
  visible: boolean;
  value?: FilterSheetValue;
  onApply: (value: FilterSheetValue) => void;
  onClear?: () => void;
  onClose: () => void;
  title?: string;
  testID?: string;
}

const EMPTY_FILTER: FilterSheetValue = {};

export function FilterSheet({
  visible,
  value = EMPTY_FILTER,
  onApply,
  onClear,
  onClose,
  title = 'Filtros',
  testID,
}: FilterSheetProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [draft, setDraft] = useState<FilterSheetValue>(value);

  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setDraft(value);
  }

  const selectedCategories = draft.categories ?? [];
  const invalidRange = !!draft.dateFrom && !!draft.dateTo && draft.dateTo < draft.dateFrom;

  function toggleType(type: TransactionType) {
    setDraft((current) => ({ ...current, type: current.type === type ? undefined : type }));
  }

  function toggleCategory(id: CategoryId) {
    setDraft((current) => {
      const categories = current.categories ?? [];
      const next = categories.includes(id)
        ? categories.filter((item) => item !== id)
        : [...categories, id];
      return { ...current, categories: next.length > 0 ? next : undefined };
    });
  }

  function handleClear() {
    setDraft(EMPTY_FILTER);
    onClear?.();
  }

  function handleApply() {
    if (invalidRange) return;
    onApply(draft);
    onClose();
  }

  const activeCount =
    (draft.type ? 1 : 0) +
    selectedCategories.length +
    (draft.dateFrom ? 1 : 0) +
    (draft.dateTo ? 1 : 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityLabel="Fechar filtros"
        accessibilityRole="button"
        testID={testID ? `${testID}-backdrop` : undefined}
      />
      <View style={styles.sheet} testID={testID}>
        <View style={styles.handle} />
        <Text variant="h2" style={styles.title} accessibilityRole="header">
          {title}
        </Text>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Período
            </Text>
            <DatePicker
              label="De"
              placeholder="Data inicial"
              value={draft.dateFrom}
              onChange={(dateFrom) => setDraft((current) => ({ ...current, dateFrom }))}
              testID={testID ? `${testID}-date-from` : undefined}
            />
            <DatePicker
              label="Até"
              placeholder="Data final"
              value={draft.dateTo}
              onChange={(dateTo) => setDraft((current) => ({ ...current, dateTo }))}
              error={invalidRange ? 'A data final deve ser posterior à inicial' : undefined}
              testID={testID ? `${testID}-date-to` : undefined}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Tipo
            </Text>
            <View
              style={styles.chipRow}
              accessibilityRole="radiogroup"
              accessibilityLabel="Tipo de transação">
              {TRANSACTION_TYPE_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={draft.type === option.value}
                  onPress={() => toggleType(option.value)}
                  accessibilityRole="radio"
                  testID={testID ? `${testID}-type-${option.value}` : undefined}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Categorias
            </Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map((category) => (
                <Chip
                  key={category.id}
                  label={category.label}
                  selected={selectedCategories.includes(category.id)}
                  onPress={() => toggleCategory(category.id)}
                  accessibilityRole="checkbox"
                  testID={testID ? `${testID}-category-${category.id}` : undefined}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Limpar"
            variant="secondary"
            onPress={handleClear}
            disabled={activeCount === 0}
            accessibilityLabel="Limpar filtros"
            style={styles.footerButton}
            testID={testID ? `${testID}-clear` : undefined}
          />
          <Button
            title="Aplicar"
            onPress={handleApply}
            disabled={invalidRange}
            accessibilityLabel={
              activeCount > 0 ? `Aplicar ${activeCount} filtros` : 'Aplicar filtros'
            }
            style={styles.footerButton}
            testID={testID ? `${testID}-apply` : undefined}
          />
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)' },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radius.default * 2,
      borderTopRightRadius: theme.radius.default * 2,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing['2xl'],
      paddingHorizontal: theme.spacing.lg,
      maxHeight: '85%',
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      marginBottom: theme.spacing.md,
    },
    title: { color: theme.colors.text, marginBottom: theme.spacing.lg },
    scroll: { flexGrow: 0 },
    scrollContent: { gap: theme.spacing.xl, paddingBottom: theme.spacing.lg },
    section: { gap: theme.spacing.md },
    sectionTitle: { color: theme.colors.text, fontWeight: '600' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
    footer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      paddingTop: theme.spacing.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    footerButton: { flex: 1 },
  });
}

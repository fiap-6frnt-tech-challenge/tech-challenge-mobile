import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { CATEGORIES } from '@/src/domain/categories';
import { BADGE_LABEL_MAP } from '@/src/domain/constants';
import { Button } from './Button';
import { Chip } from './Chip';
import { FilterSheet, type FilterSheetValue } from './FilterSheet';
import { Text } from './Text';

function categoryLabel(id: string) {
  return CATEGORIES.find((category) => category.id === id)?.label ?? id;
}

function FilterSheetDemo({ initialValue }: { initialValue?: FilterSheetValue }) {
  const [visible, setVisible] = useState(false);
  const [applied, setApplied] = useState<FilterSheetValue>(initialValue ?? {});

  const activeChips = [
    ...(applied.dateFrom ? [{ key: 'dateFrom', label: `De ${applied.dateFrom}` }] : []),
    ...(applied.dateTo ? [{ key: 'dateTo', label: `Até ${applied.dateTo}` }] : []),
    ...(applied.type ? [{ key: 'type', label: BADGE_LABEL_MAP[applied.type] }] : []),
    ...(applied.categories ?? []).map((id) => ({
      key: `category:${id}`,
      label: categoryLabel(id),
    })),
  ];

  function removeChip(key: string) {
    setApplied((current) => {
      if (key === 'dateFrom') return { ...current, dateFrom: undefined };
      if (key === 'dateTo') return { ...current, dateTo: undefined };
      if (key === 'type') return { ...current, type: undefined };
      const id = key.replace('category:', '');
      const categories = (current.categories ?? []).filter((item) => item !== id);
      return { ...current, categories: categories.length > 0 ? categories : undefined };
    });
  }

  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Button title="Abrir filtros" onPress={() => setVisible(true)} />

      {activeChips.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {activeChips.map((chip) => (
            <Chip key={chip.key} label={chip.label} onRemove={() => removeChip(chip.key)} />
          ))}
        </View>
      ) : (
        <Text variant="caption" color="textSecondary">
          Nenhum filtro ativo
        </Text>
      )}

      <Text variant="caption" color="textSecondary">
        Emitido: {JSON.stringify(applied)}
      </Text>

      <FilterSheet
        visible={visible}
        value={applied}
        onApply={setApplied}
        onClose={() => setVisible(false)}
        testID="filter-sheet"
      />
    </View>
  );
}

const meta = {
  title: 'ui/FilterSheet',
  component: FilterSheetDemo,
} satisfies Meta<typeof FilterSheetDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithActiveFilters: Story = {
  args: {
    initialValue: {
      type: 'withdrawal',
      categories: ['food', 'transport'],
      dateFrom: '2026-07-01',
      dateTo: '2026-07-31',
    },
  },
};

export const AllStates: Story = {
  render: () => (
    <View style={{ gap: 24 }}>
      <View>
        <Text variant="caption" color="textSecondary" style={{ paddingHorizontal: 16 }}>
          Sem filtros aplicados
        </Text>
        <FilterSheetDemo />
      </View>
      <View>
        <Text variant="caption" color="textSecondary" style={{ paddingHorizontal: 16 }}>
          Com filtros aplicados (chips removíveis)
        </Text>
        <FilterSheetDemo
          initialValue={{ type: 'deposit', categories: ['salary'], dateFrom: '2026-07-01' }}
        />
      </View>
    </View>
  ),
};

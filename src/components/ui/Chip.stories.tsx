import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { Chip } from './Chip';

const meta = {
  title: 'ui/Chip',
  component: Chip,
  args: { label: 'Alimentação' },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Removable: Story = {
  args: { onRemove: () => {} },
};

export const Selectable: Story = {
  args: { onPress: () => {} },
};

export const Selected: Story = {
  args: { onPress: () => {}, selected: true },
};

export const Disabled: Story = {
  args: { onRemove: () => {}, disabled: true },
};

function ActiveFiltersDemo() {
  const [filters, setFilters] = useState(['Alimentação', 'Transporte', 'Últimos 30 dias']);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {filters.map((filter) => (
        <Chip
          key={filter}
          label={filter}
          onRemove={() => setFilters((current) => current.filter((item) => item !== filter))}
        />
      ))}
    </View>
  );
}

function MultiSelectDemo() {
  const [selected, setSelected] = useState<string[]>(['food']);
  const options = [
    { id: 'food', label: 'Alimentação' },
    { id: 'transport', label: 'Transporte' },
    { id: 'leisure', label: 'Lazer' },
  ];

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((option) => (
        <Chip
          key={option.id}
          label={option.label}
          selected={selected.includes(option.id)}
          onPress={() =>
            setSelected((current) =>
              current.includes(option.id)
                ? current.filter((id) => id !== option.id)
                : [...current, option.id]
            )
          }
        />
      ))}
    </View>
  );
}

export const AllStates: Story = {
  render: () => (
    <View style={{ gap: 16, padding: 16 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Chip label="Removível" onRemove={() => {}} />
        <Chip label="Selecionável" onPress={() => {}} />
        <Chip label="Selecionado" onPress={() => {}} selected />
        <Chip label="Desabilitado" onRemove={() => {}} disabled />
        <Chip label="Estático" />
      </View>
      <ActiveFiltersDemo />
      <MultiSelectDemo />
    </View>
  ),
};

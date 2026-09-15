import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Select, type SelectOption, type SelectProps } from './Select';

const CATEGORY_OPTIONS: SelectOption[] = [
  { label: 'Alimentação', value: 'food' },
  { label: 'Transporte', value: 'transport' },
  { label: 'Lazer', value: 'leisure' },
  { label: 'Saúde', value: 'health' },
  { label: 'Outros', value: 'other' },
];

function SelectDemo(props: Omit<SelectProps, 'value' | 'onChange' | 'options'>) {
  const [value, setValue] = useState<string | undefined>(undefined);
  return <Select {...props} options={CATEGORY_OPTIONS} value={value} onChange={setValue} />;
}

const meta = {
  title: 'ui/Select',
  component: SelectDemo,
  args: { label: 'Categoria', placeholder: 'Selecionar categoria' },
} satisfies Meta<typeof SelectDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {};

export const WithError: Story = {
  args: { error: 'Selecione uma categoria' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AllStates: Story = {
  render: () => (
    <View style={{ gap: 16, padding: 16 }}>
      <SelectDemo label="Normal" placeholder="Selecionar categoria" />
      <SelectDemo
        label="Com erro"
        placeholder="Selecionar categoria"
        error="Selecione uma categoria"
      />
      <SelectDemo label="Desabilitado" placeholder="Selecionar categoria" disabled />
    </View>
  ),
};

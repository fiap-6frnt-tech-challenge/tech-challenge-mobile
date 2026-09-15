import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { DatePicker, type DatePickerProps } from './DatePicker';

function DatePickerDemo(props: Omit<DatePickerProps, 'value' | 'onChange'>) {
  const [value, setValue] = useState<string | undefined>(undefined);
  return <DatePicker {...props} value={value} onChange={setValue} />;
}

const meta = {
  title: 'ui/DatePicker',
  component: DatePickerDemo,
  args: { label: 'Data da transação' },
} satisfies Meta<typeof DatePickerDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {};

export const WithValue: Story = {
  render: () => {
    function WithValueDemo() {
      const [value, setValue] = useState('2026-07-20');
      return <DatePicker label="Data da transação" value={value} onChange={setValue} />;
    }
    return <WithValueDemo />;
  },
};

export const WithError: Story = {
  args: { error: 'Selecione uma data válida' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AllStates: Story = {
  render: () => (
    <View style={{ gap: 16, padding: 16 }}>
      <DatePickerDemo label="Normal" />
      <DatePickerDemo label="Com erro" error="Selecione uma data válida" />
      <DatePickerDemo label="Desabilitado" disabled />
    </View>
  ),
};

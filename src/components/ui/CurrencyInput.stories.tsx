import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { CurrencyInput, type CurrencyInputProps } from './CurrencyInput';

function CurrencyInputDemo(props: Omit<CurrencyInputProps, 'value' | 'onChangeValue'>) {
  const [value, setValue] = useState(0);
  return <CurrencyInput {...props} value={value} onChangeValue={setValue} />;
}

const meta = {
  title: 'ui/CurrencyInput',
  component: CurrencyInputDemo,
  args: { label: 'Valor' },
} satisfies Meta<typeof CurrencyInputDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {};

export const WithValue: Story = {
  render: () => {
    function WithValueDemo() {
      const [value, setValue] = useState(1234.5);
      return <CurrencyInput label="Valor" value={value} onChangeValue={setValue} />;
    }
    return <WithValueDemo />;
  },
};

export const WithError: Story = {
  args: { error: 'Informe um valor maior que zero' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AllStates: Story = {
  render: () => (
    <View style={{ gap: 16, padding: 16 }}>
      <CurrencyInputDemo label="Normal" />
      <CurrencyInputDemo label="Com erro" error="Informe um valor maior que zero" />
      <CurrencyInputDemo label="Desabilitado" disabled />
    </View>
  ),
};

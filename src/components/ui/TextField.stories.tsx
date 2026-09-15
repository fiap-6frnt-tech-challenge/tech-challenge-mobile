import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { TextField, type TextFieldProps } from './TextField';

function TextFieldDemo(props: Omit<TextFieldProps, 'value' | 'onChangeText'>) {
  const [value, setValue] = useState('');
  return <TextField {...props} value={value} onChangeText={setValue} />;
}

const meta = {
  title: 'ui/TextField',
  component: TextFieldDemo,
  args: { label: 'Nome', placeholder: 'Digite seu nome' },
} satisfies Meta<typeof TextFieldDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {};

export const WithError: Story = {
  args: { error: 'Este campo é obrigatório' },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: 'Campo desabilitado' },
};

export const Password: Story = {
  args: { label: 'Senha', placeholder: 'Digite sua senha', secureTextEntry: true },
};

export const AllStates: Story = {
  render: () => (
    <View style={{ gap: 16, padding: 16 }}>
      <TextFieldDemo label="Normal" placeholder="Digite algo" />
      <TextFieldDemo label="Com erro" placeholder="Digite algo" error="Este campo é obrigatório" />
      <TextFieldDemo label="Desabilitado" placeholder="Campo desabilitado" disabled />
    </View>
  ),
};

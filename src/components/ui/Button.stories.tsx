import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { Button } from './Button';

const meta = {
  title: 'ui/Button',
  component: Button,
  args: { title: 'Continuar', variant: 'primary', loading: false, disabled: false },
  argTypes: {
    variant: { control: { type: 'select' }, options: ['primary', 'secondary', 'tertiary'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Tertiary: Story = { args: { variant: 'tertiary' } };
export const Loading: Story = { args: { variant: 'primary', loading: true } };
export const Disabled: Story = { args: { variant: 'primary', disabled: true } };

export const AllVariantsAndStates: Story = {
  render: () => (
    <View style={{ gap: 12, padding: 16 }}>
      <Button title="Primary" variant="primary" />
      <Button title="Primary loading" variant="primary" loading />
      <Button title="Primary disabled" variant="primary" disabled />
      <Button title="Secondary" variant="secondary" />
      <Button title="Secondary loading" variant="secondary" loading />
      <Button title="Secondary disabled" variant="secondary" disabled />
      <Button title="Tertiary" variant="tertiary" />
      <Button title="Tertiary loading" variant="tertiary" loading />
      <Button title="Tertiary disabled" variant="tertiary" disabled />
    </View>
  ),
};

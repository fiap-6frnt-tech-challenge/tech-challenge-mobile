import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { Text } from './Text';

const meta = {
  title: 'ui/Text',
  component: Text,
  args: { children: 'Bytebank', variant: 'body' },
  argTypes: { variant: { control: { type: 'select' }, options: ['h1', 'h2', 'body', 'caption'] } },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H1: Story = { args: { variant: 'h1', children: 'Título H1' } };
export const H2: Story = { args: { variant: 'h2', children: 'Título H2' } };
export const Body: Story = { args: { variant: 'body', children: 'Texto padrão' } };
export const Caption: Story = { args: { variant: 'caption', children: 'Legenda' } };

export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 8, padding: 16 }}>
      <Text variant="h1">Título H1</Text>
      <Text variant="h2">Título H2</Text>
      <Text variant="body">Texto padrão (body)</Text>
      <Text variant="caption">Legenda (caption)</Text>
    </View>
  ),
};

import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { Card } from './Card';
import { Text } from './Text';

const meta = {
  title: 'ui/Card',
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <View style={{ padding: 16 }}>
      <Card>
        <Text variant="h2">Saldo</Text>
        <Text variant="body">R$ 1.234,56</Text>
      </Card>
    </View>
  ),
};

export const WithLongContent: Story = {
  render: () => (
    <View style={{ padding: 16 }}>
      <Card>
        <Text variant="h2">Título</Text>
        <Text variant="body">
          Conteúdo mais longo dentro do card para validar quebra de linha e espaçamento interno.
        </Text>
      </Card>
    </View>
  ),
};

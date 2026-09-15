import type { Meta, StoryObj } from '@storybook/react-native';
import { ScrollView, View } from 'react-native';
import { Card } from '@/src/components/ui/Card';
import { BalanceLineChart } from './BalanceLineChart';
import { balanceDenseFixture, balanceFixture, balanceWithNegativeFixture } from './fixtures';

const meta = {
  title: 'ui/charts/BalanceLineChart',
  component: BalanceLineChart,
  decorators: [
    (Story) => (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Story />
      </ScrollView>
    ),
  ],
} satisfies Meta<typeof BalanceLineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: balanceFixture,
    title: 'Evolução do saldo',
  },
  render: (args) => (
    <Card>
      <BalanceLineChart {...args} />
    </Card>
  ),
};

export const WithNegativeBalance: Story = {
  args: {
    data: balanceWithNegativeFixture,
    title: 'Evolução do saldo',
  },
  render: (args) => (
    <Card>
      <BalanceLineChart {...args} />
    </Card>
  ),
};

export const DenseSeries: Story = {
  args: {
    data: balanceDenseFixture,
    title: 'Evolução do saldo (30 dias)',
  },
  render: (args) => (
    <Card>
      <BalanceLineChart {...args} />
    </Card>
  ),
};

export const Empty: Story = {
  args: {
    data: [],
    title: 'Evolução do saldo',
  },
  render: (args) => (
    <Card>
      <BalanceLineChart {...args} />
    </Card>
  ),
};

export const SinglePoint: Story = {
  args: {
    data: [balanceFixture[0]],
    title: 'Evolução do saldo',
  },
  render: (args) => (
    <Card>
      <BalanceLineChart {...args} />
    </Card>
  ),
};

export const AllStates: Story = {
  args: { data: balanceFixture },
  render: () => (
    <View style={{ gap: 16 }}>
      <Card>
        <BalanceLineChart data={balanceFixture} title="Saldo positivo" />
      </Card>
      <Card>
        <BalanceLineChart data={balanceWithNegativeFixture} title="Cruzando o zero" />
      </Card>
      <Card>
        <BalanceLineChart data={balanceDenseFixture} title="Série longa" />
      </Card>
      <Card>
        <BalanceLineChart data={[]} title="Vazio" />
      </Card>
    </View>
  ),
};

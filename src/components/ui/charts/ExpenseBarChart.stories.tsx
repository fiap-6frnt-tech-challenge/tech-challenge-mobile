import type { Meta, StoryObj } from '@storybook/react-native';
import { ScrollView, View } from 'react-native';
import { Card } from '@/src/components/ui/Card';
import { ExpenseBarChart } from './ExpenseBarChart';
import { monthlyFixture, monthlyWithGapFixture } from './fixtures';

const meta = {
  title: 'ui/charts/ExpenseBarChart',
  component: ExpenseBarChart,
  decorators: [
    (Story) => (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Story />
      </ScrollView>
    ),
  ],
} satisfies Meta<typeof ExpenseBarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: monthlyFixture,
    title: 'Receita × Despesa',
  },
  render: (args) => (
    <Card>
      <ExpenseBarChart {...args} />
    </Card>
  ),
};

export const WithEmptyMonth: Story = {
  args: {
    data: monthlyWithGapFixture,
    title: 'Últimos 3 meses',
  },
  render: (args) => (
    <Card>
      <ExpenseBarChart {...args} />
    </Card>
  ),
};

export const SingleMonth: Story = {
  args: {
    data: [monthlyFixture[monthlyFixture.length - 1]],
    title: 'Mês atual',
  },
  render: (args) => (
    <Card>
      <ExpenseBarChart {...args} />
    </Card>
  ),
};

export const Empty: Story = {
  args: {
    data: [],
    title: 'Receita × Despesa',
  },
  render: (args) => (
    <Card>
      <ExpenseBarChart {...args} />
    </Card>
  ),
};

export const AllStates: Story = {
  args: { data: monthlyFixture },
  render: () => (
    <View style={{ gap: 16 }}>
      <Card>
        <ExpenseBarChart data={monthlyFixture} title="Com dados" />
      </Card>
      <Card>
        <ExpenseBarChart data={monthlyWithGapFixture} title="Com mês zerado" />
      </Card>
      <Card>
        <ExpenseBarChart data={[]} title="Vazio" />
      </Card>
    </View>
  ),
};

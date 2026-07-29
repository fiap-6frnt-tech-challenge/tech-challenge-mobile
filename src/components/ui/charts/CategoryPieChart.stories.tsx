import type { Meta, StoryObj } from '@storybook/react-native';
import { ScrollView, View } from 'react-native';
import { Card } from '@/src/components/ui/Card';
import { CategoryPieChart } from './CategoryPieChart';
import { categoryFixture, categoryShortFixture } from './fixtures';

const meta = {
  title: 'ui/charts/CategoryPieChart',
  component: CategoryPieChart,
  decorators: [
    (Story) => (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Story />
      </ScrollView>
    ),
  ],
} satisfies Meta<typeof CategoryPieChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: categoryFixture,
    title: 'Gastos por categoria',
  },
  render: (args) => (
    <Card>
      <CategoryPieChart {...args} />
    </Card>
  ),
};

export const FewCategories: Story = {
  args: {
    data: categoryShortFixture,
    title: 'Gastos por categoria',
  },
  render: (args) => (
    <Card>
      <CategoryPieChart {...args} />
    </Card>
  ),
};

export const SingleCategory: Story = {
  args: {
    data: [{ category: 'food', total: 512.4 }],
    title: 'Gastos por categoria',
  },
  render: (args) => (
    <Card>
      <CategoryPieChart {...args} />
    </Card>
  ),
};

export const Empty: Story = {
  args: {
    data: [],
    title: 'Gastos por categoria',
  },
  render: (args) => (
    <Card>
      <CategoryPieChart {...args} />
    </Card>
  ),
};

export const AllStates: Story = {
  args: { data: categoryFixture },
  render: () => (
    <View style={{ gap: 16 }}>
      <Card>
        <CategoryPieChart data={categoryFixture} title="Sete categorias" />
      </Card>
      <Card>
        <CategoryPieChart data={categoryShortFixture} title="Três categorias" />
      </Card>
      <Card>
        <CategoryPieChart data={[]} title="Vazio" />
      </Card>
    </View>
  ),
};

import type { Meta, StoryObj } from '@storybook/react-native';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { SummaryTile } from './SummaryTile';
import { Text } from './Text';

const meta = {
  title: 'ui/SummaryTile',
  component: SummaryTile,
  args: {
    label: 'Entradas',
    value: 4200,
    tone: 'positive',
    icon: ArrowDownLeft,
  },
  argTypes: {
    tone: { control: 'radio', options: ['primary', 'positive', 'negative'] },
    trend: { control: 'radio', options: ['up', 'down', 'neutral'] },
  },
  decorators: [
    (Story) => (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Story />
      </ScrollView>
    ),
  ],
} satisfies Meta<typeof SummaryTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TonePrimary: Story = {
  args: { label: 'Saldo', value: 1234.56, tone: 'primary', trend: 'up', icon: Wallet },
};

export const TonePositive: Story = {
  args: { label: 'Entradas', value: 4200, tone: 'positive', trend: 'up', icon: ArrowDownLeft },
};

export const ToneNegative: Story = {
  args: { label: 'Saídas', value: 2965.4, tone: 'negative', trend: 'down', icon: ArrowUpRight },
};

export const TrendUp: Story = {
  args: { trend: 'up' },
};

export const TrendDown: Story = {
  args: { trend: 'down' },
};

export const TrendNeutral: Story = {
  args: { trend: 'neutral' },
};

export const WithoutTrend: Story = {
  args: { trend: undefined },
};

export const ThreeInARow: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <SummaryTile label="Saldo" value={1234.56} tone="primary" trend="up" icon={Wallet} />
      <SummaryTile label="Entradas" value={4200} tone="positive" trend="up" icon={ArrowDownLeft} />
      <SummaryTile label="Saídas" value={2965.4} tone="negative" trend="down" icon={ArrowUpRight} />
    </View>
  ),
};

export const ThreeInARowNarrow: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Text variant="caption" color="textSecondary">
        Largura útil de uma tela 360px (328px)
      </Text>
      <View style={{ width: 328, flexDirection: 'row', gap: 8 }}>
        <SummaryTile label="Saldo" value={12345.67} tone="primary" trend="up" icon={Wallet} />
        <SummaryTile
          label="Entradas"
          value={98765.43}
          tone="positive"
          trend="up"
          icon={ArrowDownLeft}
        />
        <SummaryTile
          label="Saídas"
          value={86419.75}
          tone="negative"
          trend="down"
          icon={ArrowUpRight}
        />
      </View>

      <Text variant="caption" color="textSecondary">
        Mesma linha sem ícones
      </Text>
      <View style={{ width: 328, flexDirection: 'row', gap: 8 }}>
        <SummaryTile label="Saldo" value={12345.67} tone="primary" trend="up" />
        <SummaryTile label="Entradas" value={98765.43} tone="positive" trend="up" />
        <SummaryTile label="Saídas" value={86419.75} tone="negative" trend="down" />
      </View>
    </View>
  ),
};

export const NegativeValue: Story = {
  args: { label: 'Saldo', value: -1240.9, tone: 'negative', trend: 'down', icon: Wallet },
};

export const AllStates: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <SummaryTile label="Primary · alta" value={1234.56} tone="primary" trend="up" />
        <SummaryTile label="Primary · queda" value={1234.56} tone="primary" trend="down" />
        <SummaryTile label="Primary · estável" value={1234.56} tone="primary" trend="neutral" />
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <SummaryTile label="Positive · alta" value={4200} tone="positive" trend="up" />
        <SummaryTile label="Positive · queda" value={4200} tone="positive" trend="down" />
        <SummaryTile label="Positive · estável" value={4200} tone="positive" trend="neutral" />
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <SummaryTile label="Negative · alta" value={2965.4} tone="negative" trend="up" />
        <SummaryTile label="Negative · queda" value={2965.4} tone="negative" trend="down" />
        <SummaryTile label="Negative · estável" value={2965.4} tone="negative" trend="neutral" />
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <SummaryTile label="Sem tendência" value={1234.56} tone="primary" icon={Wallet} />
        <SummaryTile label="Com rótulo" value={4200} tone="positive" trend="up" trendLabel="+12%" />
        <SummaryTile label="Zerado" value={0} tone="primary" trend="neutral" />
      </View>
    </View>
  ),
};

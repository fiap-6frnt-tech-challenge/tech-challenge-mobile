import type { Meta, StoryObj } from '@storybook/react-native';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { KpiCard } from './KpiCard';

const meta = {
  title: 'ui/KpiCard',
  component: KpiCard,
  args: {
    label: 'Saldo atual',
    value: 1234.56,
    tone: 'primary',
    icon: Wallet,
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
} satisfies Meta<typeof KpiCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TonePrimary: Story = {
  args: { label: 'Saldo atual', value: 1234.56, tone: 'primary', trend: 'up', icon: Wallet },
};

export const TonePositive: Story = {
  args: {
    label: 'Entradas do mês',
    value: 4200,
    tone: 'positive',
    trend: 'up',
    icon: ArrowDownLeft,
  },
};

export const ToneNegative: Story = {
  args: {
    label: 'Saídas do mês',
    value: 2965.4,
    tone: 'negative',
    trend: 'down',
    icon: ArrowUpRight,
  },
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

export const CustomTrendLabel: Story = {
  args: { trend: 'up', trendLabel: '+12% vs. mês anterior' },
};

export const WithoutIcon: Story = {
  args: { icon: undefined, trend: 'neutral' },
};

export const NegativeValue: Story = {
  args: { label: 'Saldo atual', value: -1240.9, tone: 'negative', trend: 'down', icon: Wallet },
};

export const ZeroValue: Story = {
  args: { label: 'Saldo atual', value: 0, tone: 'primary', trend: 'neutral', icon: Wallet },
};

export const LargeValue: Story = {
  args: { label: 'Patrimônio investido', value: 1987654.32, tone: 'primary', trend: 'up' },
};

export const AllStates: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <KpiCard label="Primary · alta" value={1234.56} tone="primary" trend="up" icon={Wallet} />
      <KpiCard label="Primary · queda" value={1234.56} tone="primary" trend="down" icon={Wallet} />
      <KpiCard
        label="Primary · estável"
        value={1234.56}
        tone="primary"
        trend="neutral"
        icon={Wallet}
      />
      <KpiCard
        label="Positive · alta"
        value={4200}
        tone="positive"
        trend="up"
        icon={ArrowDownLeft}
      />
      <KpiCard
        label="Positive · queda"
        value={4200}
        tone="positive"
        trend="down"
        icon={ArrowDownLeft}
      />
      <KpiCard
        label="Positive · estável"
        value={4200}
        tone="positive"
        trend="neutral"
        icon={ArrowDownLeft}
      />
      <KpiCard
        label="Negative · alta"
        value={2965.4}
        tone="negative"
        trend="up"
        icon={ArrowUpRight}
      />
      <KpiCard
        label="Negative · queda"
        value={2965.4}
        tone="negative"
        trend="down"
        icon={ArrowUpRight}
      />
      <KpiCard
        label="Negative · estável"
        value={2965.4}
        tone="negative"
        trend="neutral"
        icon={ArrowUpRight}
      />
      <KpiCard label="Sem tendência e sem ícone" value={1234.56} tone="primary" />
    </View>
  ),
};

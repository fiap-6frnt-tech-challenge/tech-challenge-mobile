import type { Meta, StoryObj } from '@storybook/react-native';
import { useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { Card } from './Card';
import {
  SegmentedControl,
  type SegmentedControlOption,
  type SegmentedControlProps,
} from './SegmentedControl';
import { Text } from './Text';

type DemoValue = 'overview' | 'category' | 'month' | 'quarter' | 'year';

const TABS: SegmentedControlOption<DemoValue>[] = [
  { label: 'Visão geral', value: 'overview' },
  { label: 'Por categoria', value: 'category' },
];

const RANGE_OPTIONS: SegmentedControlOption<DemoValue>[] = [
  { label: 'Mês', value: 'month' },
  { label: 'Trimestre', value: 'quarter' },
  { label: 'Ano', value: 'year' },
];

const LONG_LABEL_OPTIONS: SegmentedControlOption<DemoValue>[] = [
  { label: 'Receitas e despesas', value: 'overview' },
  { label: 'Gastos por categoria', value: 'category' },
];

const meta = {
  title: 'ui/SegmentedControl',
  component: SegmentedControl,
  args: {
    options: TABS,
    value: 'overview',
    onChange: () => {},
    accessibilityLabel: 'Seções do dashboard',
  },
  argTypes: {
    value: { control: 'radio', options: ['overview', 'category'] },
    reduceMotion: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Story />
      </ScrollView>
    ),
  ],
} satisfies Meta<typeof SegmentedControl<DemoValue>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <ControlledSegmentedControl key={args.value} {...args} />,
};

export const ThreeOptions: Story = {
  args: { options: RANGE_OPTIONS, value: 'month' },
  render: (args) => <ControlledSegmentedControl key={args.value} {...args} />,
};

export const LongLabels: Story = {
  args: { options: LONG_LABEL_OPTIONS },
  render: (args) => <ControlledSegmentedControl key={args.value} {...args} />,
};

export const InsideCard: Story = {
  render: (args) => (
    <Card style={{ gap: 12 }}>
      <Text variant="h2">Dashboard</Text>
      <ControlledSegmentedControl key={args.value} {...args} />
    </Card>
  ),
};

export const ReduceMotion: Story = {
  args: { reduceMotion: true },
  render: (args) => <ControlledSegmentedControl key={args.value} {...args} />,
};

export const Narrow: Story = {
  render: (args) => (
    <View style={{ width: 328 }}>
      <ControlledSegmentedControl key={args.value} {...args} />
    </View>
  ),
};

export const AllStates: Story = {
  render: () => (
    <View style={{ gap: 20 }}>
      <Variant label="2 opções">
        <ControlledSegmentedControl
          options={TABS}
          value="overview"
          onChange={() => {}}
          accessibilityLabel="Seções do dashboard"
        />
      </Variant>

      <Variant label="3 opções">
        <ControlledSegmentedControl options={RANGE_OPTIONS} value="quarter" onChange={() => {}} />
      </Variant>

      <Variant label="Rótulos longos (truncam em 1 linha)">
        <ControlledSegmentedControl
          options={LONG_LABEL_OPTIONS}
          value="overview"
          onChange={() => {}}
        />
      </Variant>

      <Variant label="Reduce motion (indicador sem deslize)">
        <ControlledSegmentedControl
          options={TABS}
          value="overview"
          onChange={() => {}}
          reduceMotion
        />
      </Variant>

      <Variant label="Largura de tela 360px">
        <View style={{ width: 328 }}>
          <ControlledSegmentedControl options={TABS} value="category" onChange={() => {}} />
        </View>
      </Variant>
    </View>
  ),
};

function Variant({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text variant="caption" color="textSecondary">
        {label}
      </Text>
      {children}
    </View>
  );
}

function ControlledSegmentedControl<T extends string>(props: SegmentedControlProps<T>) {
  const [value, setValue] = useState(props.value);

  return (
    <SegmentedControl
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange(next);
      }}
    />
  );
}

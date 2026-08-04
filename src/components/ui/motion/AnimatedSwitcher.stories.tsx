import type { Meta, StoryObj } from '@storybook/react-native';
import { useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { Card } from '@/src/components/ui/Card';
import {
  SegmentedControl,
  type SegmentedControlOption,
} from '@/src/components/ui/SegmentedControl';
import { Text } from '@/src/components/ui/Text';
import { AnimatedSection } from './AnimatedSection';
import { AnimatedSectionGroup } from './AnimatedSectionGroup';
import { AnimatedSwitcher } from './AnimatedSwitcher';
import { BarSection, KpiSection, LineSection, PieSection } from './fixtures';

type DashboardTab = 'overview' | 'category';

const TABS: SegmentedControlOption<DashboardTab>[] = [
  { label: 'Visão geral', value: 'overview' },
  { label: 'Por categoria', value: 'category' },
];

const meta = {
  title: 'ui/motion/AnimatedSwitcher',
  component: AnimatedSwitcher,
  args: {
    value: 'overview',
    children: (displayed: DashboardTab) => (
      <Card>
        <Text variant="h2">{displayed === 'overview' ? 'Visão geral' : 'Por categoria'}</Text>
      </Card>
    ),
  },
  argTypes: {
    duration: { control: { type: 'number', min: 0, max: 2000, step: 40 } },
    distance: { control: { type: 'number', min: 0, max: 120, step: 4 } },
    reduceMotion: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 16, gap: 16 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof AnimatedSwitcher<DashboardTab>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <SwitcherDemo duration={args.duration} distance={args.distance} />,
};

export const Slow: Story = {
  render: () => <SwitcherDemo duration={900} distance={32} />,
};

export const ReduceMotion: Story = {
  render: () => <SwitcherDemo reduceMotion />,
};

export const WithStaggeredSections: Story = {
  render: () => <SwitcherWithCascadeDemo />,
};

export const AllStates: Story = {
  render: () => <AllStatesDemo />,
};

interface SwitcherDemoProps {
  duration?: number;
  distance?: number;
  reduceMotion?: boolean;
}

function SwitcherDemo({ duration, distance, reduceMotion }: SwitcherDemoProps) {
  const [tab, setTab] = useState<DashboardTab>('overview');

  return (
    <View style={{ flex: 1, gap: 16 }}>
      <SegmentedControl
        options={TABS}
        value={tab}
        onChange={setTab}
        accessibilityLabel="Seções do dashboard"
        reduceMotion={reduceMotion}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <AnimatedSwitcher
          value={tab}
          duration={duration}
          distance={distance}
          reduceMotion={reduceMotion}
          minHeight={320}>
          {(displayed) =>
            displayed === 'overview' ? (
              <View style={{ gap: 16 }}>
                <KpiSection />
                <BarSection />
              </View>
            ) : (
              <View style={{ gap: 16 }}>
                <PieSection />
                <LineSection />
              </View>
            )
          }
        </AnimatedSwitcher>
      </ScrollView>
    </View>
  );
}

function SwitcherWithCascadeDemo() {
  const [tab, setTab] = useState<DashboardTab>('overview');

  return (
    <View style={{ flex: 1, gap: 16 }}>
      <SegmentedControl
        options={TABS}
        value={tab}
        onChange={setTab}
        accessibilityLabel="Seções do dashboard"
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <AnimatedSwitcher value={tab} minHeight={320}>
          {(displayed) => (
            // A `key` remonta o grupo a cada troca, então a cascata roda de novo.
            <AnimatedSectionGroup key={displayed}>
              <View style={{ gap: 16 }}>
                {displayed === 'overview' ? (
                  <>
                    <AnimatedSection index={0}>
                      <KpiSection />
                    </AnimatedSection>
                    <AnimatedSection index={1}>
                      <BarSection />
                    </AnimatedSection>
                  </>
                ) : (
                  <>
                    <AnimatedSection index={0}>
                      <PieSection />
                    </AnimatedSection>
                    <AnimatedSection index={1}>
                      <LineSection />
                    </AnimatedSection>
                  </>
                )}
              </View>
            </AnimatedSectionGroup>
          )}
        </AnimatedSwitcher>
      </ScrollView>
    </View>
  );
}

function AllStatesDemo() {
  return (
    <ScrollView contentContainerStyle={{ gap: 20, paddingBottom: 24 }}>
      <VariantBlock label="Padrão — 240ms, 12px">
        <MiniSwitcher />
      </VariantBlock>

      <VariantBlock label="Lenta — 900ms, 32px">
        <MiniSwitcher duration={900} distance={32} />
      </VariantBlock>

      <VariantBlock label="Sem deslocamento — só fade">
        <MiniSwitcher distance={0} />
      </VariantBlock>

      <VariantBlock label="Reduce motion — troca instantânea">
        <MiniSwitcher reduceMotion />
      </VariantBlock>
    </ScrollView>
  );
}

function VariantBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text variant="caption" color="textSecondary">
        {label}
      </Text>
      {children}
    </View>
  );
}

function MiniSwitcher({ duration, distance, reduceMotion }: SwitcherDemoProps) {
  const [tab, setTab] = useState<DashboardTab>('overview');

  return (
    <View style={{ gap: 8 }}>
      <SegmentedControl
        options={TABS}
        value={tab}
        onChange={setTab}
        accessibilityLabel="Seções do dashboard"
        reduceMotion={reduceMotion}
      />
      <AnimatedSwitcher
        value={tab}
        duration={duration}
        distance={distance}
        reduceMotion={reduceMotion}
        minHeight={92}>
        {(displayed) => (
          <Card>
            <Text variant="h2">{displayed === 'overview' ? 'Visão geral' : 'Por categoria'}</Text>
            <Text color="textSecondary">
              {displayed === 'overview'
                ? 'Saldo, entradas e saídas do mês.'
                : 'Distribuição das despesas por categoria.'}
            </Text>
          </Card>
        )}
      </AnimatedSwitcher>
    </View>
  );
}

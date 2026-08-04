import type { Meta, StoryObj } from '@storybook/react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Text } from '@/src/components/ui/Text';
import {
  AnimatedSection,
  type AnimatedSectionHandle,
  type AnimatedSectionProps,
} from './AnimatedSection';
import {
  AnimatedSectionGroup,
  useAnimatedSectionGroup,
  type AnimatedSectionGroupHandle,
} from './AnimatedSectionGroup';
import { BarSection, KpiSection, LineSection, PieSection } from './fixtures';

const meta = {
  title: 'ui/motion/AnimatedSection',
  component: AnimatedSection,
  args: {
    index: 0,
    children: (
      <Card>
        <Text variant="h2">Seção do dashboard</Text>
        <Text color="textSecondary">Entra com fade-in + slide-up.</Text>
      </Card>
    ),
  },
  argTypes: {
    index: { control: { type: 'number', min: 0, max: 6 } },
    duration: { control: { type: 'number', min: 0, max: 2000, step: 50 } },
    staggerStep: { control: { type: 'number', min: 0, max: 600, step: 20 } },
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
} satisfies Meta<typeof AnimatedSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <SingleSectionDemo {...args} />,
};

export const Cascade: Story = {
  render: () => <CascadeDemo />,
};

export const PullToRefresh: Story = {
  render: () => <PullToRefreshDemo />,
};

export const ReduceMotion: Story = {
  render: () => <CascadeDemo reduceMotion />,
};

export const SlowAndFar: Story = {
  render: () => <CascadeDemo duration={700} staggerStep={260} distance={48} />,
};

export const AllStates: Story = {
  render: () => <AllStatesDemo />,
};

function SingleSectionDemo(args: AnimatedSectionProps) {
  const sectionRef = useRef<AnimatedSectionHandle>(null);

  return (
    <View style={{ gap: 16 }}>
      <Button title="Repetir animação" onPress={() => sectionRef.current?.replay()} />
      <AnimatedSection ref={sectionRef} {...args} />
    </View>
  );
}

interface CascadeDemoProps {
  reduceMotion?: boolean;
  duration?: number;
  staggerStep?: number;
  distance?: number;
}

function CascadeDemo({ reduceMotion, duration, staggerStep, distance }: CascadeDemoProps) {
  const sectionProps = { duration, staggerStep, distance };

  return (
    <AnimatedSectionGroup reduceMotion={reduceMotion}>
      <View style={{ flex: 1, gap: 16 }}>
        <ReplayButton />

        <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
          <AnimatedSection index={0} {...sectionProps}>
            <KpiSection />
          </AnimatedSection>
          <AnimatedSection index={1} {...sectionProps}>
            <BarSection />
          </AnimatedSection>
          <AnimatedSection index={2} {...sectionProps}>
            <PieSection />
          </AnimatedSection>
          <AnimatedSection index={3} {...sectionProps}>
            <LineSection />
          </AnimatedSection>
        </ScrollView>
      </View>
    </AnimatedSectionGroup>
  );
}

function ReplayButton() {
  const { replay } = useAnimatedSectionGroup();
  return <Button title="Repetir animação" onPress={replay} />;
}

function PullToRefreshDemo() {
  const groupRef = useRef<AnimatedSectionGroupHandle>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timeout = timeoutRef;
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    timeoutRef.current = setTimeout(() => {
      setRefreshing(false);
      groupRef.current?.replay();
    }, 1200);
  }, []);

  return (
    <AnimatedSectionGroup ref={groupRef}>
      <ScrollView
        contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        <Text variant="caption" color="textSecondary">
          Puxe a lista para baixo: ao terminar o &quot;carregamento&quot;, a cascata roda de novo.
        </Text>

        <AnimatedSection index={0}>
          <KpiSection />
        </AnimatedSection>
        <AnimatedSection index={1}>
          <BarSection />
        </AnimatedSection>
        <AnimatedSection index={2}>
          <PieSection />
        </AnimatedSection>
        <AnimatedSection index={3}>
          <LineSection />
        </AnimatedSection>
      </ScrollView>
    </AnimatedSectionGroup>
  );
}

function AllStatesDemo() {
  const groupRef = useRef<AnimatedSectionGroupHandle>(null);

  return (
    <View style={{ flex: 1, gap: 12 }}>
      <Button title="Repetir todas" onPress={() => groupRef.current?.replay()} />

      <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        <AnimatedSectionGroup ref={groupRef}>
          <VariantLabel text="Padrão — 350ms, stagger 120ms, 20px" />
          <AnimatedSection index={0}>
            <VariantCard text="index 0" />
          </AnimatedSection>
          <AnimatedSection index={1}>
            <VariantCard text="index 1" />
          </AnimatedSection>
          <AnimatedSection index={2}>
            <VariantCard text="index 2" />
          </AnimatedSection>

          <VariantLabel text="Sem stagger — todas juntas" />
          <AnimatedSection index={0} staggerStep={0}>
            <VariantCard text="staggerStep 0" />
          </AnimatedSection>
          <AnimatedSection index={1} staggerStep={0}>
            <VariantCard text="staggerStep 0" />
          </AnimatedSection>

          <VariantLabel text="Lenta e longe — 700ms, 48px" />
          <AnimatedSection index={0} duration={700} distance={48}>
            <VariantCard text="duration 700 · distance 48" />
          </AnimatedSection>

          <VariantLabel text="Reduce motion — sem animação" />
          <AnimatedSection index={0} reduceMotion>
            <VariantCard text="reduceMotion" />
          </AnimatedSection>
          <AnimatedSection index={1} reduceMotion>
            <VariantCard text="reduceMotion" />
          </AnimatedSection>
        </AnimatedSectionGroup>
      </ScrollView>
    </View>
  );
}

function VariantLabel({ text }: { text: string }) {
  return (
    <Text variant="caption" color="textSecondary">
      {text}
    </Text>
  );
}

function VariantCard({ text }: { text: string }) {
  return (
    <Card>
      <Text>{text}</Text>
    </Card>
  );
}

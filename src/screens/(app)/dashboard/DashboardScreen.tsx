import { ArrowDownLeft, ArrowUpRight, Lightbulb, Wallet } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DashboardFeedback } from '@/src/components/features/dashboard/DashboardFeedback';
import { DashboardSkeleton } from '@/src/components/features/dashboard/DashboardSkeleton';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { KpiCard } from '@/src/components/ui/KpiCard';
import { SummaryTile } from '@/src/components/ui/SummaryTile';
import { Text } from '@/src/components/ui/Text';
import { BalanceLineChart, CategoryPieChart, ExpenseBarChart } from '@/src/components/ui/charts';
import { formatBRL } from '@/src/components/ui/currency';
import type { KpiTrend } from '@/src/components/ui/kpi';
import {
  AnimatedSection,
  AnimatedSectionGroup,
  type AnimatedSectionGroupHandle,
} from '@/src/components/ui/motion';
import { useAuth } from '@/src/contexts/AuthContext';
import { CATEGORIES, type CategoryId, type MonthlyAggregate } from '@/src/domain';
import { useDashboardData } from '@/src/hooks/useDashboardData';
import { spacing, useTheme, type Theme } from '@/src/theme';
import { getDashboardViewState, runDashboardRefresh } from './dashboardState';

const CHART_MAX_WIDTH = 640;
const CONTENT_MAX_WIDTH = CHART_MAX_WIDTH + (spacing.lg + spacing.md) * 2;

const EMPTY_MONTH: MonthlyAggregate = { month: '', income: 0, expense: 0 };

const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category.label])
) as Record<CategoryId, string>;

function firstName(displayName?: string | null, email?: string | null): string | null {
  const name = displayName?.trim().split(/\s+/)[0];
  if (name) return name;

  return email?.split('@')[0]?.trim() || null;
}

function monthTrend(current: number, previous: number): KpiTrend {
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'neutral';
}

function monthTrendLabel(current: number, previous: number): string {
  if (previous === 0) return current === 0 ? 'sem movimento' : 'novo neste mês';

  const delta = Math.round(((current - previous) / previous) * 100);
  if (delta === 0) return 'igual ao mês anterior';

  return `${delta > 0 ? '+' : '-'}${Math.abs(delta)}% vs. mês anterior`;
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const {
    totals,
    byMonth,
    byCategory,
    balanceOverTime,
    topCategory,
    loading,
    error,
    refresh,
    isEmpty,
  } = useDashboardData();
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const sectionsRef = useRef<AnimatedSectionGroupHandle>(null);
  const [refreshing, setRefreshing] = useState(false);
  const viewState = getDashboardViewState({ loading, refreshing, error, isEmpty });

  const handleRefresh = useCallback(
    () =>
      runDashboardRefresh({
        refresh,
        setRefreshing,
        replay: () => sectionsRef.current?.replay(),
      }),
    [refresh]
  );

  const name = firstName(user?.displayName, user?.email);
  const currentMonth = byMonth.at(-1) ?? EMPTY_MONTH;
  const previousMonth = byMonth.at(-2) ?? EMPTY_MONTH;
  const monthNet = currentMonth.income - currentMonth.expense;

  const insight = topCategory
    ? {
        label: CATEGORY_LABELS[topCategory.category] ?? topCategory.category,
        value: formatBRL(topCategory.total),
        share:
          currentMonth.expense > 0
            ? Math.round((topCategory.total / currentMonth.expense) * 100)
            : null,
      }
    : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <AnimatedSectionGroup ref={sectionsRef}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }>
          {viewState === 'loading' ? <DashboardSkeleton /> : null}

          {viewState === 'error' ? (
            <DashboardFeedback variant="error" onAction={handleRefresh} />
          ) : null}

          {viewState === 'empty' ? (
            <DashboardFeedback variant="empty" onAction={() => router.push('/transactionAdd')} />
          ) : null}

          {viewState === 'content' ? (
            <>
              {error && !isEmpty ? (
                <View
                  style={styles.inlineError}
                  accessibilityRole="alert"
                  accessibilityLiveRegion="assertive"
                  accessibilityLabel={`${error}. Dados anteriores continuam visíveis.`}
                  testID="dashboard-refresh-error">
                  <Text color="danger">{error}. Dados anteriores continuam visíveis.</Text>
                  <Button title="Tentar novamente" variant="secondary" onPress={handleRefresh} />
                </View>
              ) : null}

              <AnimatedSection index={0} style={styles.section}>
                <Text variant="h2" accessibilityRole="header">
                  {name ? `Olá, ${name}` : 'Olá'}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Este é o resumo das suas finanças.
                </Text>
                <KpiCard
                  label="Saldo atual"
                  value={totals.balance}
                  tone="primary"
                  icon={Wallet}
                  trend={monthNet > 0 ? 'up' : monthNet < 0 ? 'down' : 'neutral'}
                  trendLabel={`${formatBRL(monthNet)} neste mês`}
                  style={styles.balanceCard}
                  testID="dashboard-balance"
                />
              </AnimatedSection>

              <AnimatedSection index={1} style={styles.kpiRow}>
                <SummaryTile
                  label="Entradas do mês"
                  value={currentMonth.income}
                  tone="positive"
                  icon={ArrowDownLeft}
                  trend={monthTrend(currentMonth.income, previousMonth.income)}
                  trendLabel={monthTrendLabel(currentMonth.income, previousMonth.income)}
                  testID="dashboard-income"
                />
                <SummaryTile
                  label="Saídas do mês"
                  value={currentMonth.expense}
                  tone="negative"
                  icon={ArrowUpRight}
                  trend={monthTrend(currentMonth.expense, previousMonth.expense)}
                  trendLabel={monthTrendLabel(currentMonth.expense, previousMonth.expense)}
                  testID="dashboard-expense"
                />
              </AnimatedSection>

              <AnimatedSection index={2}>
                <Card>
                  <ExpenseBarChart
                    data={byMonth}
                    title="Receita × Despesa"
                    testID="dashboard-bar-chart"
                  />
                </Card>
              </AnimatedSection>

              <AnimatedSection index={3}>
                <Card style={styles.sectionCard}>
                  <CategoryPieChart
                    data={byCategory}
                    title="Gastos por categoria"
                    testID="dashboard-pie-chart"
                  />
                  {insight ? (
                    <View style={styles.insight} accessible accessibilityRole="text">
                      <Lightbulb size={16} color={theme.colors.primary} strokeWidth={2} />
                      <Text variant="caption" color="textSecondary" style={styles.insightText}>
                        Maior gasto do mês:{' '}
                        <Text variant="caption" style={styles.insightHighlight}>
                          {insight.label}
                        </Text>{' '}
                        com {insight.value}
                        {insight.share !== null ? `, ${insight.share}% das saídas` : ''}.
                      </Text>
                    </View>
                  ) : null}
                </Card>
              </AnimatedSection>

              <AnimatedSection index={4}>
                <Card>
                  <BalanceLineChart
                    data={balanceOverTime}
                    title="Evolução do saldo"
                    testID="dashboard-line-chart"
                  />
                </Card>
              </AnimatedSection>
            </>
          ) : null}
        </ScrollView>
      </AnimatedSectionGroup>
    </SafeAreaView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      width: '100%',
      maxWidth: CONTENT_MAX_WIDTH,
      alignSelf: 'center',
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing['2xl'],
      gap: theme.spacing.lg,
    },
    section: {
      gap: theme.spacing.xs,
    },
    balanceCard: {
      marginTop: theme.spacing.sm,
    },
    kpiRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    inlineError: {
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.radius.default,
      backgroundColor: theme.colors.badgeWithdrawBg,
    },
    sectionCard: {
      gap: theme.spacing.md,
    },
    insight: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.radius.default,
      backgroundColor: theme.colors.badgeTransferBg,
    },
    insightText: {
      flex: 1,
      lineHeight: 18,
    },
    insightHighlight: {
      color: theme.colors.text,
      fontWeight: '700',
    },
  });
}

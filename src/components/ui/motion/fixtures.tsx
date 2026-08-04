import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react-native';
import { View } from 'react-native';
import { Card } from '@/src/components/ui/Card';
import { SummaryTile } from '@/src/components/ui/SummaryTile';
import { BalanceLineChart, CategoryPieChart, ExpenseBarChart } from '@/src/components/ui/charts';
import {
  balanceFixture,
  categoryFixture,
  monthlyFixture,
} from '@/src/components/ui/charts/fixtures';

export function KpiSection() {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <SummaryTile label="Saldo" value={4190.9} tone="primary" trend="up" icon={Wallet} />
      <SummaryTile label="Entradas" value={5200} tone="positive" trend="up" icon={ArrowDownLeft} />
      <SummaryTile label="Saídas" value={2870} tone="negative" trend="down" icon={ArrowUpRight} />
    </View>
  );
}

export function BarSection() {
  return (
    <Card>
      <ExpenseBarChart data={monthlyFixture} title="Receita × Despesa" />
    </Card>
  );
}

export function PieSection() {
  return (
    <Card>
      <CategoryPieChart data={categoryFixture} title="Gastos por categoria" />
    </Card>
  );
}

export function LineSection() {
  return (
    <Card>
      <BalanceLineChart data={balanceFixture} title="Evolução do saldo" />
    </Card>
  );
}

import { memo, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, type LayoutChangeEvent } from 'react-native';
import { useTheme, type Theme } from '@/src/theme';
import { Card } from '@/src/components/ui/Card';
import { Text } from '@/src/components/ui/Text';
import { formatBRL } from '@/src/components/ui/currency';
import { BADGE_LABEL_MAP, TRANSACTION_TYPE } from '@/src/domain/constants';
import { CATEGORY_LABEL_MAP } from '@/src/domain/categories';
import type { Transaction } from '@/src/domain/transaction';
import {
  Utensils,
  Car,
  Ticket,
  HeartPulse,
  GraduationCap,
  Home,
  Wallet,
  Repeat,
  CircleEllipsis,
} from 'lucide-react-native';

const CATEGORY_ICON_MAP = {
  food: Utensils,
  transport: Car,
  leisure: Ticket,
  health: HeartPulse,
  education: GraduationCap,
  housing: Home,
  salary: Wallet,
  transfer: Repeat,
  other: CircleEllipsis,
};

function formatDisplayDate(iso?: string): string {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

export interface TransactionItemProps {
  transaction: Transaction;
  onPress: (id: string) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}

export const TransactionItem = memo(function TransactionItem({
  transaction,
  onPress,
  onLayout,
}: TransactionItemProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [pressed, setPressed] = useState(false);

  const { id, type, category, amount, date, description } = transaction;

  const CategoryIcon = CATEGORY_ICON_MAP[category] || CircleEllipsis;
  const typeLabel = BADGE_LABEL_MAP[type];
  const categoryLabel = CATEGORY_LABEL_MAP[category] || 'Outros';

  const badgeColors = useMemo(() => {
    switch (type) {
      case TRANSACTION_TYPE.DEPOSIT:
        return { bg: theme.colors.badgeDepositBg, text: theme.colors.badgeDepositText };
      case TRANSACTION_TYPE.WITHDRAWAL:
        return { bg: theme.colors.badgeWithdrawBg, text: theme.colors.badgeWithdrawText };
      case TRANSACTION_TYPE.TRANSFER:
      default:
        return { bg: theme.colors.badgeTransferBg, text: theme.colors.badgeTransferText };
    }
  }, [type, theme]);

  const amountColors = useMemo(() => {
    switch (type) {
      case TRANSACTION_TYPE.DEPOSIT:
        return theme.colors.success;
      case TRANSACTION_TYPE.WITHDRAWAL:
        return theme.colors.danger;
      case TRANSACTION_TYPE.TRANSFER:
      default:
        return theme.colors.text;
    }
  }, [type, theme]);

  const amountSign = useMemo(() => {
    switch (type) {
      case TRANSACTION_TYPE.DEPOSIT:
        return '+ ';
      case TRANSACTION_TYPE.WITHDRAWAL:
        return '- ';
      case TRANSACTION_TYPE.TRANSFER:
      default:
        return '';
    }
  }, [type]);

  const accessibilityText = `${typeLabel} de ${amountSign}${formatBRL(amount)} na categoria ${categoryLabel} em ${formatDisplayDate(date)}. Descrição: ${description}`;

  return (
    <Pressable
      onPress={() => onPress(id)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onLayout={onLayout}
      accessibilityRole="button"
      accessibilityLabel={accessibilityText}
      style={[pressed && styles.pressed]}>
      <Card style={styles.card}>
        <View style={styles.leftSection}>
          <View style={[styles.iconCircle, { backgroundColor: badgeColors.bg }]}>
            <CategoryIcon size={20} color={badgeColors.text} />
          </View>
          <View style={styles.details}>
            <View style={[styles.badge, { backgroundColor: badgeColors.bg }]}>
              <Text style={[styles.badgeText, { color: badgeColors.text }]} variant="caption">
                {typeLabel}
              </Text>
            </View>
            <Text style={styles.description} numberOfLines={1}>
              {description}
            </Text>
            <Text style={styles.date} variant="caption" color="textSecondary">
              {formatDisplayDate(date)}
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text style={[styles.amount, { color: amountColors }]}>
            {amountSign}
            {formatBRL(amount)}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
});

function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.md,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: theme.spacing.md,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },
    details: {
      flex: 1,
      alignItems: 'flex-start',
    },
    badge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: 4,
      marginBottom: theme.spacing.xs,
    },
    badgeText: {
      fontWeight: '600',
    },
    description: {
      fontWeight: '500',
      fontSize: 15,
      marginBottom: 2,
    },
    date: {
      fontSize: 12,
    },
    rightSection: {
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    amount: {
      fontWeight: '700',
      fontSize: 16,
    },
    pressed: {
      opacity: 0.7,
    },
  });
}

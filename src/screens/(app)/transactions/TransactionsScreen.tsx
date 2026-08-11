import { useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TransactionItem } from '@/src/components/features/TransactionItem';
import { useTransactions } from '@/src/contexts/TransactionContext';
import { useTheme, type Theme } from '@/src/theme';
import { Card } from '@/src/components/ui/Card';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import {
  AnimatedSection,
  AnimatedSectionGroup,
  type AnimatedSectionGroupHandle,
} from '@/src/components/ui/motion';

const SkeletonItem = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Card style={styles.card}>
      <View style={styles.leftSection}>
        <View style={[styles.iconCircle, styles.skeletonColor]} />
        <View style={styles.details}>
          <View style={[styles.skeletonBadge, styles.skeletonColor]} />
          <View style={[styles.skeletonDescription, styles.skeletonColor]} />
          <View style={[styles.skeletonDate, styles.skeletonColor]} />
        </View>
      </View>
      <View style={styles.rightSection}>
        <View style={[styles.skeletonAmount, styles.skeletonColor]} />
      </View>
    </Card>
  );
};

export default function TransactionsScreen() {
  const { items, loading, error, refresh } = useTransactions();
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const groupRef = useRef<AnimatedSectionGroupHandle>(null);
  const [fabPressed, setFabPressed] = useState(false);

  const handleRefresh = async () => {
    await refresh();
    groupRef.current?.replay();
  };

  const handlePress = (id: string) => {
    router.push({ pathname: '/transactionDetails', params: { id } });
  };

  const renderContent = () => {
    if (loading) {
      const skeletons = Array.from({ length: 15 }, (_, i) => ({ id: `skeleton-${i}` }));
      return (
        <FlatList
          data={skeletons}
          keyExtractor={(item) => item.id}
          renderItem={() => <SkeletonItem />}
          contentContainerStyle={styles.listContent}
        />
      );
    }

    if (error && items.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText} color="danger">
            {error}
          </Text>
          <Button title="Tentar novamente" onPress={handleRefresh} variant="secondary" />
        </View>
      );
    }

    if (!loading && items.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText} color="textSecondary">
            Nenhuma transação ainda
          </Text>
          <Button
            title="Adicionar nova transação"
            onPress={() => router.push('/transactionAdd')}
            variant="primary"
          />
        </View>
      );
    }

    return (
      <AnimatedSectionGroup ref={groupRef}>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <AnimatedSection index={index}>
              <TransactionItem transaction={item} onPress={handlePress} />
            </AnimatedSection>
          )}
        />
      </AnimatedSectionGroup>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      {renderContent()}
      <Pressable
        onPress={() => router.push('/transactionAdd')}
        onPressIn={() => setFabPressed(true)}
        onPressOut={() => setFabPressed(false)}
        accessibilityRole="button"
        accessibilityLabel="Adicionar nova transação"
        testID="transactions-fab"
        style={[styles.fab, fabPressed && styles.fabPressed]}>
        <Plus size={28} color={theme.colors.textInverse} />
      </Pressable>
    </SafeAreaView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    listContent: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xl * 3, // Safe spacing for FAB
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    errorText: {
      fontSize: 16,
      textAlign: 'center',
      fontWeight: '500',
    },
    emptyText: {
      fontSize: 16,
      textAlign: 'center',
    },
    fab: {
      position: 'absolute',
      bottom: theme.spacing.xl,
      right: theme.spacing.xl,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    fabPressed: {
      opacity: 0.8,
    },
    // Styles shared with TransactionItem skeleton
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
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: theme.spacing.sm,
    },
    details: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    rightSection: {
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    skeletonColor: {
      backgroundColor: theme.colors.border,
      opacity: 0.4,
    },
    skeletonBadge: {
      width: 60,
      height: 16,
      borderRadius: 4,
    },
    skeletonDescription: {
      width: 120,
      height: 18,
      borderRadius: 4,
    },
    skeletonDate: {
      width: 80,
      height: 12,
      borderRadius: 4,
    },
    skeletonAmount: {
      width: 70,
      height: 20,
      borderRadius: 4,
    },
  });
}

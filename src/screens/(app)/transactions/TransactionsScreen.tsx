import { useFocusEffect, useRouter } from 'expo-router';
import { ListFilter, Plus } from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TransactionItem } from '@/src/components/features/TransactionItem';
import { TransactionListFeedback } from '@/src/components/features/TransactionListFeedback';
import { TransactionListSkeleton } from '@/src/components/features/TransactionListSkeleton';
import { Button } from '@/src/components/ui/Button';
import { Chip } from '@/src/components/ui/Chip';
import { FilterSheet } from '@/src/components/ui/FilterSheet';
import { SearchInput } from '@/src/components/ui/SearchInput';
import { Text } from '@/src/components/ui/Text';
import type { Transaction } from '@/src/domain';
import { useInfiniteTransactions } from '@/src/hooks/useInfiniteTransactions';
import type { TxFilter } from '@/src/services/transactions.service';
import { useTheme, type Theme } from '@/src/theme';
import {
  getActiveTransactionFilterChips,
  hasAnyTransactionFilter,
  removeTransactionFilter,
  replaceStructuredTransactionFilters,
  toStructuredTransactionFilter,
  updateTransactionSearch,
  type StructuredTransactionFilter,
  type TransactionFilterChipKey,
} from './transactionFilters';

const keyExtractor = (transaction: Transaction) => transaction.id;

export default function TransactionsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [filter, setFilter] = useState<TxFilter>({});
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [searchResetGeneration, setSearchResetGeneration] = useState(0);
  const { items, loading, refreshing, hasMore, error, loadMore, refresh } =
    useInfiniteTransactions(filter);

  const firstFocusRef = useRef(true);
  const listRef = useRef<FlatList<Transaction>>(null);
  useFocusEffect(
    useCallback(() => {
      if (firstFocusRef.current) {
        firstFocusRef.current = false;
        return;
      }
      void refresh();
    }, [refresh])
  );

  const handlePress = useCallback(
    (id: string) => router.push({ pathname: '/transactionDetails', params: { id } }),
    [router]
  );

  const handleAdd = useCallback(() => router.push('/transactionAdd'), [router]);

  const handleRefresh = useCallback(() => void refresh(), [refresh]);

  const handleEndReached = useCallback(() => void loadMore(), [loadMore]);

  const handleRetry = useCallback(
    () => void (hasMore ? loadMore() : refresh()),
    [hasMore, loadMore, refresh]
  );

  const activeFilterChips = useMemo(() => getActiveTransactionFilterChips(filter), [filter]);
  const structuredFilter = useMemo(() => toStructuredTransactionFilter(filter), [filter]);
  const hasAppliedFilters = hasAnyTransactionFilter(filter);
  const resultCount = items.length === 0 && (loading || error) ? undefined : items.length;
  const filterButtonAccessibilityLabel =
    activeFilterChips.length === 0
      ? 'Abrir filtros'
      : `Abrir filtros, ${activeFilterChips.length} ${
          activeFilterChips.length === 1 ? 'ativo' : 'ativos'
        }`;

  const resetListPosition = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);

  const changeFilter = useCallback(
    (update: (current: TxFilter) => TxFilter) => {
      setFilter(update);
      resetListPosition();
    },
    [resetListPosition]
  );

  const handleSearch = useCallback(
    (search: string) => changeFilter((current) => updateTransactionSearch(current, search)),
    [changeFilter]
  );

  const handleApplyFilters = useCallback(
    (value: StructuredTransactionFilter) =>
      changeFilter((current) => replaceStructuredTransactionFilters(current, value)),
    [changeFilter]
  );

  const handleRemoveFilter = useCallback(
    (key: TransactionFilterChipKey) =>
      changeFilter((current) => removeTransactionFilter(current, key)),
    [changeFilter]
  );

  const handleClearFilters = useCallback(() => {
    setSearchResetGeneration((current) => current + 1);
    changeFilter(() => ({}));
  }, [changeFilter]);

  const renderItem = useCallback<ListRenderItem<Transaction>>(
    ({ item }) => <TransactionItem transaction={item} onPress={handlePress} />,
    [handlePress]
  );

  const listEmpty = loading ? (
    <TransactionListSkeleton />
  ) : error ? (
    <TransactionListFeedback variant="error" onAction={handleRefresh} />
  ) : hasAppliedFilters ? (
    <TransactionListFeedback variant="no-results" onAction={handleClearFilters} />
  ) : (
    <TransactionListFeedback variant="empty" onAction={handleAdd} />
  );

  const listHeader = (
    <View style={styles.filtersHeader} testID="transactions-filters-header">
      <View style={styles.searchRow}>
        <SearchInput
          key={searchResetGeneration}
          defaultValue={filter.search ?? ''}
          onSearch={handleSearch}
          debounceMs={300}
          resultCount={resultCount}
          style={styles.searchInput}
          testID="transactions-search"
        />
        <Pressable
          onPress={() => setFiltersVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={filterButtonAccessibilityLabel}
          testID="transactions-filter-button"
          style={styles.filterButton}>
          <ListFilter size={22} color={theme.colors.primary} />
          {activeFilterChips.length > 0 ? (
            <View style={styles.filterCount}>
              <Text variant="caption" style={styles.filterCountText}>
                {activeFilterChips.length}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {activeFilterChips.length > 0 ? (
        <View style={styles.activeFilters} testID="transactions-active-filters">
          {activeFilterChips.map((chip) => (
            <Chip
              key={chip.key}
              label={chip.label}
              onRemove={() => handleRemoveFilter(chip.key)}
              testID={`transactions-filter-${chip.key}`}
            />
          ))}
          <Button
            title="Limpar filtros"
            variant="tertiary"
            onPress={handleClearFilters}
            testID="transactions-clear-filters"
          />
        </View>
      ) : null}
    </View>
  );

  const listFooter =
    items.length === 0 ? null : error ? (
      <View style={styles.footerError} testID="transactions-footer-error">
        <Text color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
        <Button title="Tentar novamente" variant="secondary" onPress={handleRetry} />
      </View>
    ) : loading && hasMore ? (
      <ActivityIndicator
        testID="transactions-footer-spinner"
        style={styles.footerSpinner}
        color={theme.colors.primary}
        accessibilityLabel="Carregando mais transações"
      />
    ) : !hasMore ? (
      <Text
        variant="caption"
        color="textSecondary"
        style={styles.footerEnd}
        testID="transactions-footer-end">
        Você chegou ao fim da lista
      </Text>
    ) : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onEndReached={hasMore ? handleEndReached : undefined}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={[styles.listContent, items.length === 0 && styles.listContentEmpty]}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={9}
        testID="transactions-list"
      />

      <FilterSheet
        visible={filtersVisible}
        value={structuredFilter}
        onApply={handleApplyFilters}
        onClose={() => setFiltersVisible(false)}
        testID="transactions-filter-sheet"
      />

      <Pressable
        onPress={handleAdd}
        accessibilityRole="button"
        accessibilityLabel="Adicionar nova transação"
        testID="transactions-fab"
        style={styles.fab}>
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
      paddingBottom: theme.spacing.xl * 3,
    },
    listContentEmpty: {
      flexGrow: 1,
    },
    filtersHeader: {
      gap: theme.spacing.md,
      paddingBottom: theme.spacing.md,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    searchInput: { flex: 1 },
    filterButton: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.default,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterCount: {
      position: 'absolute',
      top: 2,
      right: 2,
      minWidth: 18,
      height: 18,
      paddingHorizontal: 4,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    filterCountText: { color: theme.colors.textInverse },
    activeFilters: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    footerSpinner: {
      paddingVertical: theme.spacing.lg,
    },
    footerEnd: {
      paddingVertical: theme.spacing.lg,
      textAlign: 'center',
    },
    footerError: {
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.radius.default,
      backgroundColor: theme.colors.badgeWithdrawBg,
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
  });
}

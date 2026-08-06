import { Search, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme, type Theme } from '@/src/theme';

import { Text } from './Text';

export interface SearchInputProps {
  defaultValue?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  resultCount?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function SearchInput({
  defaultValue = '',
  placeholder = 'Buscar transações',
  onSearch,
  debounceMs = 300,
  resultCount,
  disabled = false,
  autoFocus = false,
  accessibilityLabel = 'Buscar transações',
  style,
  testID,
}: SearchInputProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [query, setQuery] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  });

  const lastEmitted = useRef(defaultValue);

  useEffect(() => {
    if (query === lastEmitted.current) return;

    const timer = setTimeout(() => {
      lastEmitted.current = query;
      onSearchRef.current(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  function handleClear() {
    setQuery('');
    lastEmitted.current = '';
    onSearchRef.current('');
    inputRef.current?.focus();
  }

  const showClear = query.length > 0 && !disabled;

  return (
    <View style={style}>
      <View
        style={[styles.field, focused && styles.fieldFocused, disabled && styles.fieldDisabled]}>
        <Search size={20} color={theme.colors.iconSecondary} />
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          editable={!disabled}
          autoFocus={autoFocus}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="never"
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="search"
          accessibilityState={{ disabled }}
          testID={testID}
          style={styles.input}
        />
        {showClear ? (
          <Pressable
            onPress={handleClear}
            hitSlop={theme.spacing.sm}
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
            testID={testID ? `${testID}-clear` : undefined}
            style={styles.clearButton}>
            <X size={16} color={theme.colors.iconSecondary} strokeWidth={2.5} />
          </Pressable>
        ) : null}
      </View>

      {resultCount !== undefined ? (
        <Text
          variant="caption"
          style={styles.resultCount}
          accessibilityLiveRegion="polite"
          testID={testID ? `${testID}-result-count` : undefined}>
          {resultCount === 1 ? '1 resultado' : `${resultCount} resultados`}
        </Text>
      ) : null}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.default,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
    },
    fieldFocused: { borderColor: theme.colors.borderFocus },
    fieldDisabled: { backgroundColor: theme.colors.surfaceHover, opacity: 0.5 },
    input: {
      flex: 1,
      padding: 0,
      color: theme.colors.text,
      fontSize: theme.typography.body.fontSize,
    },
    clearButton: { alignItems: 'center', justifyContent: 'center' },
    pressed: { opacity: 0.7 },
    resultCount: { marginTop: theme.spacing.xs, color: theme.colors.textSecondary },
  });
}

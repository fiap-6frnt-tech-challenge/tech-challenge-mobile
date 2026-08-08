import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { SearchInput, type SearchInputProps } from './SearchInput';
import { Text } from './Text';

const TRANSACTIONS = [
  'Mercado do bairro',
  'Uber para o aeroporto',
  'Netflix mensal',
  'Farmácia',
  'Salário',
  'Aluguel',
];

function SearchInputDemo(props: Omit<SearchInputProps, 'onSearch'>) {
  const [query, setQuery] = useState('');
  const results = query
    ? TRANSACTIONS.filter((item) => item.toLowerCase().includes(query.toLowerCase()))
    : TRANSACTIONS;

  return (
    <View style={{ gap: 12 }}>
      <SearchInput {...props} onSearch={setQuery} resultCount={results.length} />
      <View style={{ gap: 4 }}>
        {results.map((item) => (
          <Text key={item} variant="caption">
            {item}
          </Text>
        ))}
      </View>
      <Text variant="caption" color="textSecondary">
        Busca aplicada: {query || '(vazia)'}
      </Text>
    </View>
  );
}

const meta = {
  title: 'ui/SearchInput',
  component: SearchInputDemo,
  args: { placeholder: 'Buscar transações' },
} satisfies Meta<typeof SearchInputDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {};

export const WithInitialQuery: Story = {
  args: { defaultValue: 'mercado' },
};

export const SlowDebounce: Story = {
  args: { debounceMs: 1000 },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'mercado' },
};

export const AllStates: Story = {
  render: () => (
    <View style={{ gap: 24, padding: 16 }}>
      <View style={{ gap: 8 }}>
        <Text variant="caption" color="textSecondary">
          Normal (debounce 300ms)
        </Text>
        <SearchInput onSearch={() => {}} />
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="caption" color="textSecondary">
          Com texto e botão limpar
        </Text>
        <SearchInput onSearch={() => {}} defaultValue="mercado" resultCount={3} />
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="caption" color="textSecondary">
          Sem resultados
        </Text>
        <SearchInput onSearch={() => {}} defaultValue="xyz" resultCount={0} />
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="caption" color="textSecondary">
          Desabilitado
        </Text>
        <SearchInput onSearch={() => {}} defaultValue="mercado" disabled />
      </View>
    </View>
  ),
};

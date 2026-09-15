import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { TransactionItem } from './TransactionItem';
import { TRANSACTION_TYPE } from '@/src/domain/constants';

const meta = {
  title: 'features/TransactionItem',
  component: TransactionItem,
  args: {
    transaction: {
      id: '1',
      userId: 'user-1',
      type: TRANSACTION_TYPE.DEPOSIT,
      category: 'salary',
      amount: 5000,
      date: '2024-08-09',
      description: 'Salário mensal',
      createdAt: '2024-08-09T10:00:00Z',
    },
    onPress: (id) => console.log('Pressed:', id),
  },
} satisfies Meta<typeof TransactionItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Deposit: Story = {
  args: {
    transaction: {
      id: '1',
      userId: 'user-1',
      type: TRANSACTION_TYPE.DEPOSIT,
      category: 'salary',
      amount: 5000,
      date: '2024-08-09',
      description: 'Salário mensal',
      createdAt: '2024-08-09T10:00:00Z',
    },
  },
};

export const Withdrawal: Story = {
  args: {
    transaction: {
      id: '2',
      userId: 'user-1',
      type: TRANSACTION_TYPE.WITHDRAWAL,
      category: 'food',
      amount: 150,
      date: '2024-08-09',
      description: 'Almoço no restaurante',
      createdAt: '2024-08-09T10:00:00Z',
    },
  },
};

export const Transfer: Story = {
  args: {
    transaction: {
      id: '3',
      userId: 'user-1',
      type: TRANSACTION_TYPE.TRANSFER,
      category: 'transfer',
      amount: 500,
      date: '2024-08-09',
      description: 'PIX para João',
      createdAt: '2024-08-09T10:00:00Z',
    },
  },
};

export const FoodCategory: Story = {
  args: {
    transaction: {
      id: '4',
      userId: 'user-1',
      type: TRANSACTION_TYPE.WITHDRAWAL,
      category: 'food',
      amount: 89.9,
      date: '2024-08-09',
      description: 'Compra no mercado',
      createdAt: '2024-08-09T10:00:00Z',
    },
  },
};

export const TransportCategory: Story = {
  args: {
    transaction: {
      id: '5',
      userId: 'user-1',
      type: TRANSACTION_TYPE.WITHDRAWAL,
      category: 'transport',
      amount: 45,
      date: '2024-08-09',
      description: 'Uber para o trabalho',
      createdAt: '2024-08-09T10:00:00Z',
    },
  },
};

export const HealthCategory: Story = {
  args: {
    transaction: {
      id: '6',
      userId: 'user-1',
      type: TRANSACTION_TYPE.WITHDRAWAL,
      category: 'health',
      amount: 250,
      date: '2024-08-09',
      description: 'Farmácia',
      createdAt: '2024-08-09T10:00:00Z',
    },
  },
};

export const EducationCategory: Story = {
  args: {
    transaction: {
      id: '7',
      userId: 'user-1',
      type: TRANSACTION_TYPE.WITHDRAWAL,
      category: 'education',
      amount: 1200,
      date: '2024-08-09',
      description: 'Mensalidade da faculdade',
      createdAt: '2024-08-09T10:00:00Z',
    },
  },
};

export const LeisureCategory: Story = {
  args: {
    transaction: {
      id: '8',
      userId: 'user-1',
      type: TRANSACTION_TYPE.WITHDRAWAL,
      category: 'leisure',
      amount: 59.9,
      date: '2024-08-09',
      description: 'Netflix mensalidade',
      createdAt: '2024-08-09T10:00:00Z',
    },
  },
};

export const HousingCategory: Story = {
  args: {
    transaction: {
      id: '9',
      userId: 'user-1',
      type: TRANSACTION_TYPE.WITHDRAWAL,
      category: 'housing',
      amount: 1500,
      date: '2024-08-09',
      description: 'Aluguel',
      createdAt: '2024-08-09T10:00:00Z',
    },
  },
};

export const LongDescription: Story = {
  args: {
    transaction: {
      id: '10',
      userId: 'user-1',
      type: TRANSACTION_TYPE.WITHDRAWAL,
      category: 'food',
      amount: 234.56,
      date: '2024-08-09',
      description: 'Compra semanal no supermercado com muitos itens para a casa',
      createdAt: '2024-08-09T10:00:00Z',
    },
  },
};

export const MultipleTransactions: Story = {
  render: () => (
    <View style={{ padding: 16 }}>
      <TransactionItem
        transaction={{
          id: '11',
          userId: 'user-1',
          type: TRANSACTION_TYPE.DEPOSIT,
          category: 'salary',
          amount: 5000,
          date: '2024-08-09',
          description: 'Salário mensal',
          createdAt: '2024-08-09T10:00:00Z',
        }}
        onPress={(id) => console.log('Pressed:', id)}
      />
      <TransactionItem
        transaction={{
          id: '12',
          userId: 'user-1',
          type: TRANSACTION_TYPE.WITHDRAWAL,
          category: 'food',
          amount: 150,
          date: '2024-08-09',
          description: 'Almoço no restaurante',
          createdAt: '2024-08-09T10:00:00Z',
        }}
        onPress={(id) => console.log('Pressed:', id)}
      />
      <TransactionItem
        transaction={{
          id: '13',
          userId: 'user-1',
          type: TRANSACTION_TYPE.WITHDRAWAL,
          category: 'transport',
          amount: 45,
          date: '2024-08-09',
          description: 'Uber para o trabalho',
          createdAt: '2024-08-09T10:00:00Z',
        }}
        onPress={(id) => console.log('Pressed:', id)}
      />
      <TransactionItem
        transaction={{
          id: '14',
          userId: 'user-1',
          type: TRANSACTION_TYPE.TRANSFER,
          category: 'transfer',
          amount: 500,
          date: '2024-08-09',
          description: 'PIX para João',
          createdAt: '2024-08-09T10:00:00Z',
        }}
        onPress={(id) => console.log('Pressed:', id)}
      />
    </View>
  ),
};

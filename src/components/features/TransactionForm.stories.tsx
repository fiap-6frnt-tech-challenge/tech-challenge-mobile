import type { Meta, StoryObj } from '@storybook/react-native';

import { TransactionForm } from './TransactionForm';
import { TRANSACTION_TYPE } from '@/src/domain/constants';

const meta = {
  title: 'features/TransactionForm',
  component: TransactionForm,
  args: {
    onSubmit: async (values) => console.log('submit:', values),
  },
} satisfies Meta<typeof TransactionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {
  args: {
    submitLabel: 'Adicionar transação',
  },
};

export const Edit: Story = {
  args: {
    initialValues: {
      type: TRANSACTION_TYPE.DEPOSIT,
      category: 'salary',
      amount: 5000,
      date: '2026-08-01',
      description: 'Salário mensal',
    },
    submitLabel: 'Salvar alterações',
  },
};

// The suggestion chip shows up because "uber" maps to transport and the user has not
// touched the category yet.
export const WithCategorySuggestion: Story = {
  args: {
    initialValues: {
      type: TRANSACTION_TYPE.WITHDRAWAL,
      amount: 34.9,
      date: '2026-08-10',
      description: 'Uber para o trabalho',
    },
  },
};

export const SubmitFailure: Story = {
  args: {
    initialValues: {
      type: TRANSACTION_TYPE.WITHDRAWAL,
      category: 'food',
      amount: 89.9,
      date: '2026-08-09',
      description: 'Compra no mercado',
    },
    onSubmit: async () => {
      throw new Error('offline');
    },
  },
};

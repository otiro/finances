import { create } from 'zustand';
import { Transaction, Debt } from '../../services/transaction.service';

interface TransactionState {
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  debts: Debt[];
  isLoading: boolean;
  error: string | null;
  setTransactions: (transactions: Transaction[]) => void;
  setCurrentTransaction: (transaction: Transaction | null) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  setDebts: (debts: Debt[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearTransactions: () => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  currentTransaction: null,
  debts: [],
  isLoading: false,
  error: null,

  setTransactions: (transactions) => set({ transactions, isLoading: false }),

  setCurrentTransaction: (transaction) => set({ currentTransaction: transaction }),

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),

  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
      currentTransaction:
        state.currentTransaction?.id === id
          ? { ...state.currentTransaction, ...updates }
          : state.currentTransaction,
    })),

  removeTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
      currentTransaction:
        state.currentTransaction?.id === id ? null : state.currentTransaction,
    })),

  setDebts: (debts) => set({ debts, isLoading: false }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  clearTransactions: () =>
    set({
      transactions: [],
      currentTransaction: null,
      debts: [],
      isLoading: false,
      error: null,
    }),
}));

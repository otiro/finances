import api from './api';
import { useTransactionStore } from '../store/slices/transactionSlice';

export interface Transaction {
  id: string;
  accountId: string;
  userId: string;
  categoryId?: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  description: string;
  transactionDate: string;
  notes?: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface CreateTransactionData {
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  description: string;
  categoryId?: string;
  transactionDate?: string;
  notes?: string;
}

export interface UpdateTransactionData {
  amount?: number;
  type?: 'DEBIT' | 'CREDIT';
  description?: string;
  categoryId?: string;
  transactionDate?: string;
  notes?: string;
}

export interface Debt {
  creditor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  debtor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
}

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

/**
 * Crée une nouvelle transaction
 */
export const createTransaction = async (
  accountId: string,
  data: CreateTransactionData
) => {
  const response = await api.post<ApiResponse<Transaction>>(
    `/accounts/${accountId}/transactions`,
    data
  );
  useTransactionStore.getState().addTransaction(response.data.data);
  return response.data.data;
};

/**
 * Récupère les transactions d'un compte
 */
export const getAccountTransactions = async (
  accountId: string,
  limit: number = 50,
  offset: number = 0
) => {
  const response = await api.get<
    ApiResponse<{
      transactions: Transaction[];
      total: number;
      limit: number;
      offset: number;
    }>
  >(`/accounts/${accountId}/transactions`, {
    params: { limit, offset },
  });

  useTransactionStore.getState().setTransactions(response.data.data.transactions);
  return response.data.data;
};

/**
 * Récupère une transaction spécifique
 */
export const getTransactionById = async (
  accountId: string,
  transactionId: string
) => {
  const response = await api.get<ApiResponse<Transaction>>(
    `/accounts/${accountId}/transactions/${transactionId}`
  );

  useTransactionStore
    .getState()
    .setCurrentTransaction(response.data.data);

  return response.data.data;
};

/**
 * Met à jour une transaction
 */
export const updateTransaction = async (
  accountId: string,
  transactionId: string,
  data: UpdateTransactionData
) => {
  const response = await api.patch<ApiResponse<Transaction>>(
    `/accounts/${accountId}/transactions/${transactionId}`,
    data
  );

  useTransactionStore
    .getState()
    .updateTransaction(transactionId, response.data.data);

  return response.data.data;
};

/**
 * Supprime une transaction
 */
export const deleteTransaction = async (
  accountId: string,
  transactionId: string
) => {
  await api.delete(
    `/accounts/${accountId}/transactions/${transactionId}`
  );

  useTransactionStore.getState().removeTransaction(transactionId);
};

/**
 * Récupère les dettes d'un foyer
 */
export const getHouseholdDebts = async (householdId: string) => {
  const response = await api.get<ApiResponse<Debt[]>>(
    `/households/${householdId}/debts`
  );

  useTransactionStore.getState().setDebts(response.data.data);
  return response.data.data;
};

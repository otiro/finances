import api from './api';
import { useAccountStore, Account } from '../store/slices/accountSlice';

interface CreateAccountData {
  name: string;
  type: 'PERSONAL' | 'JOINT' | 'SAVINGS';
  householdId: string;
  initialBalance?: number;
  ownerIds: string[];
}

interface UpdateAccountData {
  name?: string;
  initialBalance?: number;
}

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

interface AccountBalance {
  accountId: string;
  accountName: string;
  initialBalance: number;
  currentBalance: number;
  transactionCount: number;
}

/**
 * Récupère tous les comptes d'un foyer
 */
export const getHouseholdAccounts = async (householdId: string) => {
  const response = await api.get<ApiResponse<Account[]>>(
    `/accounts/household/${householdId}`
  );
  useAccountStore.getState().setAccounts(response.data.data);
  return response.data.data;
};

/**
 * Récupère un compte par ID
 */
export const getAccountById = async (id: string) => {
  const response = await api.get<ApiResponse<Account>>(`/accounts/${id}`);
  useAccountStore.getState().setCurrentAccount(response.data.data);
  return response.data.data;
};

/**
 * Crée un nouveau compte
 */
export const createAccount = async (data: CreateAccountData) => {
  const response = await api.post<ApiResponse<Account>>('/accounts', data);
  useAccountStore.getState().addAccount(response.data.data);
  return response.data.data;
};

/**
 * Met à jour un compte
 */
export const updateAccount = async (id: string, data: UpdateAccountData) => {
  const response = await api.patch<ApiResponse<Account>>(`/accounts/${id}`, data);
  useAccountStore.getState().updateAccount(id, response.data.data);
  return response.data.data;
};

/**
 * Supprime un compte
 */
export const deleteAccount = async (id: string) => {
  await api.delete(`/accounts/${id}`);
  useAccountStore.getState().removeAccount(id);
};

/**
 * Récupère le solde d'un compte
 */
export const getAccountBalance = async (id: string) => {
  const response = await api.get<ApiResponse<AccountBalance>>(
    `/accounts/${id}/balance`
  );
  return response.data.data;
};

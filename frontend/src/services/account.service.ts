import api from './api';
import { useAccountStore, Account } from '../store/slices/accountSlice';

interface CreateAccountData {
  name: string;
  type: 'CHECKING' | 'JOINT' | 'SAVINGS';
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

interface HouseholdAccountBalance {
  accountId: string;
  accountName: string;
  accountType: string;
  initialBalance: number;
  currentBalance: number;
  owners: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
}

/**
 * Récupère tous les comptes de l'utilisateur
 */
export const getUserAccounts = async () => {
  const response = await api.get<ApiResponse<Account[]>>('/accounts');
  useAccountStore.getState().setAccounts(response.data.data);
  return response.data.data;
};

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
 * Ajoute un propriétaire à un compte
 */
export const addAccountOwner = async (accountId: string, userId: string) => {
  const response = await api.post<ApiResponse<Account>>(
    `/accounts/${accountId}/owners`,
    { userId }
  );
  useAccountStore.getState().updateAccount(accountId, response.data.data);
  return response.data.data;
};

/**
 * Retire un propriétaire d'un compte
 */
export const removeAccountOwner = async (accountId: string, ownerId: string) => {
  const response = await api.delete<ApiResponse<Account>>(
    `/accounts/${accountId}/owners/${ownerId}`
  );
  useAccountStore.getState().updateAccount(accountId, response.data.data);
  return response.data.data;
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

/**
 * Récupère les soldes de tous les comptes d'un foyer
 */
export const getHouseholdBalances = async (householdId: string) => {
  const response = await api.get<ApiResponse<HouseholdAccountBalance[]>>(
    `/accounts/household/${householdId}/balances`
  );
  return response.data.data;
};

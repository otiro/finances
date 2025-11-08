import api from './api';
import { useHouseholdStore, Household } from '../store/slices/householdSlice';

interface CreateHouseholdData {
  name: string;
  sharingMode: 'EQUAL' | 'PROPORTIONAL' | 'CUSTOM';
}

interface AddMemberData {
  email: string;
  role?: 'ADMIN' | 'MEMBER';
}

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

/**
 * Récupère tous les foyers de l'utilisateur
 */
export const getUserHouseholds = async () => {
  const response = await api.get<ApiResponse<Household[]>>('/households');
  useHouseholdStore.getState().setHouseholds(response.data.data);
  return response.data.data;
};

/**
 * Récupère un foyer par ID
 */
export const getHouseholdById = async (id: string) => {
  const response = await api.get<ApiResponse<Household>>(`/households/${id}`);
  useHouseholdStore.getState().setCurrentHousehold(response.data.data);
  return response.data.data;
};

/**
 * Crée un nouveau foyer
 */
export const createHousehold = async (data: CreateHouseholdData) => {
  const response = await api.post<ApiResponse<Household>>('/households', data);
  useHouseholdStore.getState().addHousehold(response.data.data);
  return response.data.data;
};

/**
 * Ajoute un membre à un foyer
 */
export const addMemberToHousehold = async (
  householdId: string,
  data: AddMemberData
) => {
  const response = await api.post<ApiResponse<any>>(
    `/households/${householdId}/members`,
    data
  );
  // Recharger le foyer pour mettre à jour la liste des membres
  await getHouseholdById(householdId);
  return response.data.data;
};

/**
 * Supprime un membre d'un foyer
 */
export const removeMemberFromHousehold = async (
  householdId: string,
  memberId: string
) => {
  await api.delete(`/households/${householdId}/members/${memberId}`);
  // Recharger le foyer pour mettre à jour la liste des membres
  await getHouseholdById(householdId);
};

/**
 * Met à jour le mode de partage d'un foyer
 */
export const updateHouseholdSharingMode = async (
  householdId: string,
  sharingMode: 'EQUAL' | 'PROPORTIONAL' | 'CUSTOM'
) => {
  const response = await api.patch<ApiResponse<Household>>(
    `/households/${householdId}/sharing-mode`,
    { sharingMode }
  );
  useHouseholdStore
    .getState()
    .updateHousehold(householdId, { sharingMode: response.data.data.sharingMode });
  return response.data.data;
};

/**
 * Promeut un MEMBER à ADMIN dans un foyer
 */
export const promoteMemberToAdmin = async (
  householdId: string,
  memberId: string
) => {
  const response = await api.post<ApiResponse<any>>(
    `/households/${householdId}/members/${memberId}/promote`
  );
  // Recharger le foyer pour mettre à jour la liste des membres
  await getHouseholdById(householdId);
  return response.data.data;
};

/**
 * Rétrograde un ADMIN à MEMBER dans un foyer
 */
export const demoteAdminToMember = async (
  householdId: string,
  memberId: string
) => {
  const response = await api.post<ApiResponse<any>>(
    `/households/${householdId}/members/${memberId}/demote`
  );
  // Recharger le foyer pour mettre à jour la liste des membres
  await getHouseholdById(householdId);
  return response.data.data;
};

/**
 * Supprime un foyer (DEV only - pour tests)
 */
export const deleteHousehold = async (householdId: string) => {
  const response = await api.delete<ApiResponse<any>>(
    `/households/${householdId}`
  );
  // Retirer le foyer du store
  useHouseholdStore.getState().removeHousehold(householdId);
  return response.data;
};

/**
 * Récupère l'analyse des revenus pour un foyer et un mois donné
 * Inclut le revenu mensuel de chaque membre et les ratios de partage
 */
export interface IncomeAnalysisResponse {
  month: string;
  members: Array<{
    userId: string;
    name: string;
    email: string;
    salary: number;
    ratio: number;
  }>;
  totalIncome: number;
}

export const getIncomeAnalysis = async (
  householdId: string,
  year: number,
  month: number
): Promise<IncomeAnalysisResponse> => {
  const response = await api.get<ApiResponse<IncomeAnalysisResponse>>(
    `/households/${householdId}/income-analysis?year=${year}&month=${month}`
  );
  return response.data.data;
};

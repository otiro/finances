import api from './api';

export interface Category {
  id: string;
  householdId?: string;
  name: string;
  color: string;
  icon?: string;
  isSystem: boolean;
  createdAt?: string;
}

interface ApiResponse<T> {
  status: string;
  data: T;
}

/**
 * Récupère toutes les catégories disponibles (système + foyer)
 */
export const getAllAvailableCategories = async (householdId: string) => {
  const response = await api.get<ApiResponse<{ system: Category[]; household: Category[] }>>(
    `/households/${householdId}/categories`
  );
  return response.data.data;
};

/**
 * Récupère les catégories système
 */
export const getSystemCategories = async () => {
  const response = await api.get<ApiResponse<Category[]>>('/categories/system');
  return response.data.data;
};

/**
 * Récupère les catégories du foyer
 */
export const getHouseholdCategories = async (householdId: string) => {
  const response = await api.get<ApiResponse<Category[]>>(
    `/households/${householdId}/categories/household`
  );
  return response.data.data;
};

/**
 * Crée une nouvelle catégorie
 */
export const createCategory = async (
  householdId: string,
  data: {
    name: string;
    color?: string;
    icon?: string;
  }
) => {
  const response = await api.post<ApiResponse<Category>>(
    `/households/${householdId}/categories`,
    data
  );
  return response.data.data;
};

import api from './api';

export interface Category {
  id: string;
  householdId?: string;
  name: string;
  color: string;
  icon?: string;
  isSystem: boolean;
  isSalaryCategory?: boolean;
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
 * Alias pour récupérer les catégories du foyer (système + foyer)
 */
export const getCategoriesForHousehold = async (householdId: string) => {
  return getAllAvailableCategories(householdId);
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
    isSalaryCategory?: boolean;
  }
) => {
  const response = await api.post<ApiResponse<Category>>(
    `/households/${householdId}/categories`,
    data
  );
  return response.data.data;
};

/**
 * Met à jour une catégorie
 */
export const updateCategory = async (
  householdId: string,
  categoryId: string,
  data: {
    name?: string;
    color?: string;
    icon?: string;
    isSalaryCategory?: boolean;
  }
) => {
  const response = await api.patch<ApiResponse<Category>>(
    `/households/${householdId}/categories/${categoryId}`,
    data
  );
  return response.data.data;
};

/**
 * Supprime une catégorie
 */
export const deleteCategory = async (householdId: string, categoryId: string) => {
  await api.delete(`/households/${householdId}/categories/${categoryId}`);
};

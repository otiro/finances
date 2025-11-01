import { useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { selectAccountsByHousehold } from '../store/slices/accountSlice'; // Assurez-vous que ce selector existe
import { selectCategoriesByHousehold } from '../store/slices/categorySlice'; // Assurez-vous que ce selector existe

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  color?: string;
}

/**
 * Hook pour récupérer les comptes et catégories d'un foyer
 */
export const useHousehold = (householdId: string) => {
  // Récupérer depuis Redux (en supposant que les slices existent)
  const accounts = useAppSelector((state) =>
    selectAccountsByHousehold(state, householdId)
  ) || [];
  const categories = useAppSelector((state) =>
    selectCategoriesByHousehold(state, householdId)
  ) || [];

  return {
    accounts,
    categories,
  };
};

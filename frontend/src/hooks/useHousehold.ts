import { useMemo } from 'react';
import { useAccountStore } from '../store/slices/accountSlice';


interface Category {
  id: string;
  name: string;
  color?: string;
}

/**
 * Hook pour récupérer les comptes et catégories d'un foyer
 */
export const useHousehold = (householdId: string) => {
  const { accounts: allAccounts } = useAccountStore();

  // Filtrer les comptes par foyer
  const accounts = useMemo(() => {
    return (allAccounts || []).filter((account) => account.householdId === householdId);
  }, [allAccounts, householdId]);

  // Categories will be fetched via API when needed in components
  // For now, return empty array as categories are managed per-component
  const categories: Category[] = [];

  return {
    accounts,
    categories,
  };
};

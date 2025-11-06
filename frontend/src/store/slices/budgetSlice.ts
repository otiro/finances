import { create } from 'zustand';
import budgetService, {
  Budget,
  BudgetStatus,
  BudgetsSummary,
  BudgetAlert,
  CreateBudgetInput,
  UpdateBudgetInput,
} from '../../services/budget.service';

interface BudgetState {
  // State
  budgets: Budget[];
  budgetsSummary: BudgetsSummary | null;
  currentBudgetStatus: BudgetStatus | null;
  selectedBudgetAlerts: BudgetAlert[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchHouseholdBudgets: (householdId: string) => Promise<void>;
  fetchHouseholdBudgetsSummary: (householdId: string) => Promise<void>;
  fetchBudgetStatus: (householdId: string, budgetId: string) => Promise<void>;
  fetchBudgetAlerts: (householdId: string, budgetId: string) => Promise<void>;
  createBudget: (householdId: string, data: CreateBudgetInput) => Promise<Budget>;
  updateBudget: (
    householdId: string,
    budgetId: string,
    data: UpdateBudgetInput
  ) => Promise<Budget>;
  deleteBudget: (householdId: string, budgetId: string) => Promise<void>;
  clearSelectedBudget: () => void;
  setError: (error: string | null) => void;
  clearBudgets: () => void;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  // Initial state
  budgets: [],
  budgetsSummary: null,
  currentBudgetStatus: null,
  selectedBudgetAlerts: [],
  isLoading: false,
  error: null,

  // Fetch all budgets for a household
  fetchHouseholdBudgets: async (householdId: string) => {
    set({ isLoading: true, error: null });
    try {
      const budgets = await budgetService.getHouseholdBudgets(householdId);
      set({ budgets, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération des budgets';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Fetch budgets summary
  fetchHouseholdBudgetsSummary: async (householdId: string) => {
    set({ isLoading: true, error: null });
    try {
      const budgetsSummary = await budgetService.getHouseholdBudgetsSummary(householdId);
      set({ budgetsSummary, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération du résumé';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Fetch budget status
  fetchBudgetStatus: async (householdId: string, budgetId: string) => {
    set({ isLoading: true, error: null });
    try {
      const currentBudgetStatus = await budgetService.getBudgetById(householdId, budgetId);
      set({ currentBudgetStatus, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération du budget';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Fetch budget alerts
  fetchBudgetAlerts: async (householdId: string, budgetId: string) => {
    set({ isLoading: true, error: null });
    try {
      const selectedBudgetAlerts = await budgetService.getBudgetAlerts(householdId, budgetId);
      set({ selectedBudgetAlerts, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération des alertes';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Create budget
  createBudget: async (householdId: string, data: CreateBudgetInput) => {
    set({ isLoading: true, error: null });
    try {
      const newBudget = await budgetService.createBudget(householdId, data);
      set((state) => ({
        budgets: [newBudget, ...state.budgets],
        isLoading: false,
      }));
      return newBudget;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du budget';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Update budget
  updateBudget: async (
    householdId: string,
    budgetId: string,
    data: UpdateBudgetInput
  ) => {
    set({ isLoading: true, error: null });
    try {
      const updatedBudget = await budgetService.updateBudget(householdId, budgetId, data);
      set((state) => ({
        budgets: state.budgets.map((b) =>
          b.id === budgetId ? updatedBudget : b
        ),
        currentBudgetStatus: state.currentBudgetStatus
          ? { ...state.currentBudgetStatus, budget: updatedBudget }
          : null,
        isLoading: false,
      }));
      return updatedBudget;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du budget';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Delete budget
  deleteBudget: async (householdId: string, budgetId: string) => {
    set({ isLoading: true, error: null });
    try {
      await budgetService.deleteBudget(householdId, budgetId);
      set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== budgetId),
        currentBudgetStatus: state.currentBudgetStatus?.budget.id === budgetId ? null : state.currentBudgetStatus,
        selectedBudgetAlerts: [],
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression du budget';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Clear selected budget
  clearSelectedBudget: () => {
    set({
      currentBudgetStatus: null,
      selectedBudgetAlerts: [],
      error: null,
    });
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },

  // Clear all budgets
  clearBudgets: () => {
    set({
      budgets: [],
      budgetsSummary: null,
      currentBudgetStatus: null,
      selectedBudgetAlerts: [],
      isLoading: false,
      error: null,
    });
  },
}));

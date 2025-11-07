import { create } from 'zustand';
import analyticsService, {
  CategoryBreakdown,
  MonthlySpendings,
  CategoryTrend,
  PeriodComparison,
  AnalyticsSnapshot,
  ExpenseProjection,
  Anomaly,
  BudgetSuggestion,
  ExportLog,
} from '@/services/analyticsService';

interface AnalyticsState {
  // Data
  categoryBreakdown: CategoryBreakdown[];
  monthlySpendings: MonthlySpendings[];
  categoryTrends: CategoryTrend[];
  periodComparison: PeriodComparison | null;
  snapshots: AnalyticsSnapshot[];
  currentSnapshot: AnalyticsSnapshot | null;
  projections: ExpenseProjection[];
  anomalies: Anomaly[];
  budgetSuggestions: BudgetSuggestion[];
  reportHistory: ExportLog[];

  // UI State
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCategoryBreakdown: (householdId: string, type?: 'INCOME' | 'EXPENSE') => Promise<void>;
  fetchMonthlySpendings: (householdId: string, months?: number) => Promise<void>;
  fetchCategoryTrends: (householdId: string, categoryId: string, months?: number) => Promise<void>;
  fetchComparison: (
    householdId: string,
    startDate1: Date,
    endDate1: Date,
    startDate2: Date,
    endDate2: Date
  ) => Promise<void>;
  fetchSnapshots: (householdId: string, limit?: number) => Promise<void>;
  fetchSnapshot: (householdId: string, period: string) => Promise<void>;
  fetchProjections: (householdId: string, months?: number) => Promise<void>;
  fetchAnomalies: (householdId: string, sensitivity?: 'low' | 'medium' | 'high') => Promise<void>;
  fetchBudgetSuggestions: (householdId: string) => Promise<void>;
  generateReport: (
    householdId: string,
    startDate: Date,
    endDate: Date,
    format: 'CSV' | 'JSON' | 'TEXT' | 'PDF' | 'XLSX'
  ) => Promise<Blob>;
  fetchReportHistory: (householdId: string, limit?: number) => Promise<void>;
  setSelectedCategory: (categoryId: string | null) => void;
  clearError: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  // Initial state
  categoryBreakdown: [],
  monthlySpendings: [],
  categoryTrends: [],
  periodComparison: null,
  snapshots: [],
  currentSnapshot: null,
  projections: [],
  anomalies: [],
  budgetSuggestions: [],
  reportHistory: [],

  selectedCategory: null,
  isLoading: false,
  error: null,

  // Actions
  fetchCategoryBreakdown: async (householdId: string, type?: 'INCOME' | 'EXPENSE') => {
    set({ isLoading: true, error: null });
    try {
      const data = await analyticsService.getCategoryBreakdown(householdId, type);
      set({ categoryBreakdown: data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération des données';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchMonthlySpendings: async (householdId: string, months: number = 12) => {
    set({ isLoading: true, error: null });
    try {
      const data = await analyticsService.getMonthlySpendings(householdId, months);
      set({ monthlySpendings: data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération des données';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchCategoryTrends: async (householdId: string, categoryId: string, months: number = 12) => {
    set({ isLoading: true, error: null });
    try {
      const data = await analyticsService.getCategoryTrends(householdId, categoryId, months);
      set({ categoryTrends: data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération des données';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchComparison: async (
    householdId: string,
    startDate1: Date,
    endDate1: Date,
    startDate2: Date,
    endDate2: Date
  ) => {
    set({ isLoading: true, error: null });
    try {
      const data = await analyticsService.comparePeriods(householdId, startDate1, endDate1, startDate2, endDate2);
      set({ periodComparison: data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la comparaison';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchSnapshots: async (householdId: string, limit: number = 12) => {
    set({ isLoading: true, error: null });
    try {
      const data = await analyticsService.getSnapshots(householdId, limit);
      set({ snapshots: data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération des snapshots';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchSnapshot: async (householdId: string, period: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await analyticsService.getSnapshot(householdId, period);
      set({ currentSnapshot: data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération du snapshot';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchProjections: async (householdId: string, months: number = 6) => {
    set({ isLoading: true, error: null });
    try {
      const data = await analyticsService.getProjections(householdId, months);
      set({ projections: data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération des prévisions';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchAnomalies: async (householdId: string, sensitivity: 'low' | 'medium' | 'high' = 'medium') => {
    set({ isLoading: true, error: null });
    try {
      const data = await analyticsService.getAnomalies(householdId, sensitivity);
      set({ anomalies: data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la détection des anomalies';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchBudgetSuggestions: async (householdId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await analyticsService.getBudgetSuggestions(householdId);
      set({ budgetSuggestions: data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération des suggestions';
      set({ error: errorMessage, isLoading: false });
    }
  },

  generateReport: async (
    householdId: string,
    startDate: Date,
    endDate: Date,
    format: 'CSV' | 'JSON' | 'TEXT' | 'PDF' | 'XLSX'
  ) => {
    set({ isLoading: true, error: null });
    try {
      const blob = await analyticsService.generateReport(householdId, startDate, endDate, format);
      set({ isLoading: false });
      return blob;
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la génération du rapport';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchReportHistory: async (householdId: string, limit: number = 20) => {
    set({ isLoading: true, error: null });
    try {
      const data = await analyticsService.getReportHistory(householdId, limit);
      set({ reportHistory: data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération de l\'historique';
      set({ error: errorMessage, isLoading: false });
    }
  },

  setSelectedCategory: (categoryId: string | null) => {
    set({ selectedCategory: categoryId });
  },

  clearError: () => {
    set({ error: null });
  },
});

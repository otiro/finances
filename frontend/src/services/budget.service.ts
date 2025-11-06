import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface BudgetAlert {
  id: string;
  budgetId: string;
  currentSpent: number;
  percentageUsed: number;
  thresholdReached: boolean;
  createdAt: string;
}

export interface Budget {
  id: string;
  householdId: string;
  categoryId: string;
  name: string;
  description?: string;
  amount: number;
  period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate: string;
  endDate?: string;
  alertThreshold: number;
  alertEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    color: string;
    icon?: string;
  };
  alerts?: BudgetAlert[];
}

export interface BudgetStatus {
  budget: Budget;
  currentSpent: number;
  percentageUsed: number;
  thresholdReached: boolean;
  remaining: number;
  status: 'not_started' | 'active' | 'exceeded';
  alerts?: BudgetAlert[];
}

export interface BudgetsSummary {
  budgets: Array<BudgetStatus & { alerts?: BudgetAlert[] }>;
  statistics: {
    totalBudgeted: number;
    totalSpent: number;
    percentageUsed: number;
    budgetsExceeded: number;
    budgetsNearThreshold: number;
    activeCount: number;
  };
}

export interface CreateBudgetInput {
  categoryId: string;
  name: string;
  description?: string;
  amount: number;
  period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate: string;
  endDate?: string | null;
  alertThreshold?: number;
  alertEnabled?: boolean;
}

export interface UpdateBudgetInput {
  name?: string;
  description?: string;
  amount?: number;
  period?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  endDate?: string | null;
  alertThreshold?: number;
  alertEnabled?: boolean;
  isActive?: boolean;
}

class BudgetService {
  /**
   * Récupère tous les budgets d'un foyer
   */
  async getHouseholdBudgets(householdId: string): Promise<Budget[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/households/${householdId}/budgets`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data.data || [];
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Récupère un résumé des budgets avec statistiques
   */
  async getHouseholdBudgetsSummary(householdId: string): Promise<BudgetsSummary> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/households/${householdId}/budgets/summary`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Récupère un budget spécifique avec son statut
   */
  async getBudgetById(householdId: string, budgetId: string): Promise<BudgetStatus> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/households/${householdId}/budgets/${budgetId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Récupère les alertes d'un budget
   */
  async getBudgetAlerts(householdId: string, budgetId: string): Promise<BudgetAlert[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/households/${householdId}/budgets/${budgetId}/alerts`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data.data || [];
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Crée un nouveau budget
   */
  async createBudget(
    householdId: string,
    data: CreateBudgetInput
  ): Promise<Budget> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/households/${householdId}/budgets`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Met à jour un budget
   */
  async updateBudget(
    householdId: string,
    budgetId: string,
    data: UpdateBudgetInput
  ): Promise<Budget> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/households/${householdId}/budgets/${budgetId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Supprime un budget
   */
  async deleteBudget(householdId: string, budgetId: string): Promise<void> {
    try {
      await axios.delete(
        `${API_BASE_URL}/households/${householdId}/budgets/${budgetId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Gère les erreurs API
   */
  private handleError(error: any): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      const status = axiosError.response?.status;
      const data = axiosError.response?.data;

      if (status === 401) {
        // Token expiré
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (status === 403) {
        console.error('Accès refusé', data?.message);
      } else if (status === 404) {
        console.error('Budget non trouvé', data?.message);
      } else if (status === 400) {
        console.error('Données invalides', data?.errors || data?.message);
      } else {
        console.error('Erreur serveur', data?.message);
      }
    }
  }
}

export default new BudgetService();

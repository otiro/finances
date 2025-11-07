import api from './api';

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  percentage: number;
  transactionCount: number;
}

export interface MonthlySpendings {
  month: string;
  income: number;
  expense: number;
  netCashFlow: number;
}

export interface CategoryTrend {
  month: string;
  amount: number;
}

export interface PeriodComparison {
  period1: {
    label: string;
    income: number;
    expense: number;
    netCashFlow: number;
  };
  period2: {
    label: string;
    income: number;
    expense: number;
    netCashFlow: number;
  };
  differences: {
    incomeChange: number;
    incomeChangePercent: number;
    expenseChange: number;
    expenseChangePercent: number;
  };
}

export interface AnalyticsSnapshot {
  id: string;
  householdId: string;
  period: string;
  periodType: string;
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  createdAt: string;
  updatedAt: string;
  details?: any[];
}

export interface ExpenseProjection {
  month: string;
  projectedExpense: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface Anomaly {
  transactionId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  severity: 'low' | 'medium' | 'high';
  reason: string;
}

export interface BudgetSuggestion {
  categoryId: string;
  categoryName: string;
  suggestedBudget: number;
  currentBudget: number | null;
  averageSpending: number;
  maxSpending: number;
  confidence: number;
}

export interface ExportLog {
  id: string;
  householdId: string;
  userId: string;
  format: string;
  periodStart: string;
  periodEnd: string;
  fileName: string;
  fileSize: number;
  downloadUrl: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

class AnalyticsService {
  /**
   * Get category breakdown for current period
   */
  async getCategoryBreakdown(
    householdId: string,
    type?: 'INCOME' | 'EXPENSE'
  ): Promise<CategoryBreakdown[]> {
    try {
      const params = type ? `?type=${type}` : '';
      const response = await api.get(`/households/${householdId}/analytics/breakdown${params}`);
      return response.data.data || [];
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get monthly income and expense totals
   */
  async getMonthlySpendings(householdId: string, months: number = 12): Promise<MonthlySpendings[]> {
    try {
      const response = await api.get(`/households/${householdId}/analytics/monthly?months=${months}`);
      return response.data.data || [];
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get spending trends for a category
   */
  async getCategoryTrends(
    householdId: string,
    categoryId: string,
    months: number = 12
  ): Promise<CategoryTrend[]> {
    try {
      const response = await api.get(
        `/households/${householdId}/analytics/trends/${categoryId}?months=${months}`
      );
      return response.data.data || [];
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Compare spending between two periods
   */
  async comparePeriods(
    householdId: string,
    startDate1: Date,
    endDate1: Date,
    startDate2: Date,
    endDate2: Date
  ): Promise<PeriodComparison> {
    try {
      const params = new URLSearchParams({
        startDate1: startDate1.toISOString().split('T')[0],
        endDate1: endDate1.toISOString().split('T')[0],
        startDate2: startDate2.toISOString().split('T')[0],
        endDate2: endDate2.toISOString().split('T')[0],
      });

      const response = await api.get(`/households/${householdId}/analytics/compare?${params}`);
      return response.data.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get or generate snapshot for a specific period (YYYY-MM)
   */
  async getSnapshot(householdId: string, period: string): Promise<AnalyticsSnapshot> {
    try {
      const response = await api.get(`/households/${householdId}/analytics/snapshot/${period}`);
      return response.data.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get snapshot history
   */
  async getSnapshots(householdId: string, limit: number = 12): Promise<AnalyticsSnapshot[]> {
    try {
      const response = await api.get(`/households/${householdId}/analytics/snapshots?limit=${limit}`);
      return response.data.data || [];
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get expense projections
   */
  async getProjections(householdId: string, months: number = 6): Promise<ExpenseProjection[]> {
    try {
      const response = await api.get(`/households/${householdId}/analytics/projections?months=${months}`);
      return response.data.data || [];
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Detect spending anomalies
   */
  async getAnomalies(
    householdId: string,
    sensitivity: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<Anomaly[]> {
    try {
      const response = await api.get(`/households/${householdId}/analytics/anomalies?sensitivity=${sensitivity}`);
      return response.data.data || [];
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get budget suggestions
   */
  async getBudgetSuggestions(householdId: string): Promise<BudgetSuggestion[]> {
    try {
      const response = await api.get(`/households/${householdId}/analytics/suggestions/budgets`);
      return response.data.data || [];
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Generate and download report
   */
  async generateReport(
    householdId: string,
    startDate: Date,
    endDate: Date,
    format: 'CSV' | 'JSON' | 'TEXT' | 'PDF' | 'XLSX'
  ): Promise<Blob> {
    try {
      const response = await api.post(
        `/households/${householdId}/reports/generate`,
        {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          format,
        },
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get report export history
   */
  async getReportHistory(householdId: string, limit: number = 20): Promise<ExportLog[]> {
    try {
      const response = await api.get(`/households/${householdId}/reports/history?limit=${limit}`);
      return response.data.data || [];
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Download a report file
   */
  downloadFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  private handleError(error: any): void {
    if (error.response?.status === 403) {
      console.error('Access denied to this household');
    } else if (error.response?.data?.message) {
      console.error(error.response.data.message);
    } else {
      console.error('An error occurred:', error.message);
    }
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;

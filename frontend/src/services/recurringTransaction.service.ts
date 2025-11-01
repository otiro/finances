import api from './api';

export interface RecurringPattern {
  id: string;
  householdId: string;
  accountId: string;
  categoryId?: string;
  name: string;
  description?: string;
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  startDate: string;
  endDate?: string;
  dayOfMonth?: number;
  dayOfWeek?: number;
  nextGenerationDate: string;
  lastGeneratedDate?: string;
  isActive: boolean;
  isPaused: boolean;
  createdAt: string;
  updatedAt: string;
  account?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
    color: string;
  };
  generationLogs?: RecurringTransactionLog[];
}

export interface RecurringTransactionLog {
  id: string;
  recurringPatternId: string;
  generatedTransactionId?: string;
  generatedDate: string;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  errorMessage?: string;
  createdAt: string;
}

export interface CreateRecurringPatternData {
  accountId: string;
  name: string;
  description?: string;
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  categoryId?: string;
  startDate: string;
  endDate?: string;
  dayOfMonth?: number;
  dayOfWeek?: number;
}

export interface UpdateRecurringPatternData {
  name?: string;
  description?: string;
  frequency?: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  type?: 'DEBIT' | 'CREDIT';
  amount?: number;
  categoryId?: string | null;
  endDate?: string | null;
  dayOfMonth?: number | null;
  dayOfWeek?: number | null;
  isActive?: boolean;
  isPaused?: boolean;
}

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

/**
 * Crée un nouveau motif de transaction récurrente
 */
export const createRecurringPattern = async (
  householdId: string,
  data: CreateRecurringPatternData
): Promise<RecurringPattern> => {
  const response = await api.post<ApiResponse<RecurringPattern>>(
    `/households/${householdId}/recurring-patterns`,
    data
  );
  return response.data.data;
};

/**
 * Récupère les motifs récurrents d'un foyer
 */
export const getHouseholdRecurringPatterns = async (
  householdId: string,
  onlyActive: boolean = false
): Promise<RecurringPattern[]> => {
  const params = onlyActive ? { onlyActive: 'true' } : {};
  const response = await api.get<ApiResponse<RecurringPattern[]>>(
    `/households/${householdId}/recurring-patterns`,
    { params }
  );
  return response.data.data;
};

/**
 * Récupère un motif récurrent spécifique
 */
export const getRecurringPattern = async (
  householdId: string,
  patternId: string
): Promise<RecurringPattern> => {
  const response = await api.get<ApiResponse<RecurringPattern>>(
    `/households/${householdId}/recurring-patterns/${patternId}`
  );
  return response.data.data;
};

/**
 * Met à jour un motif récurrent
 */
export const updateRecurringPattern = async (
  householdId: string,
  patternId: string,
  data: UpdateRecurringPatternData
): Promise<RecurringPattern> => {
  const response = await api.patch<ApiResponse<RecurringPattern>>(
    `/households/${householdId}/recurring-patterns/${patternId}`,
    data
  );
  return response.data.data;
};

/**
 * Supprime un motif récurrent
 */
export const deleteRecurringPattern = async (
  householdId: string,
  patternId: string
): Promise<{ message: string }> => {
  const response = await api.delete<ApiResponse<{ message: string }>>(
    `/households/${householdId}/recurring-patterns/${patternId}`
  );
  return response.data.data;
};

/**
 * Pause un motif récurrent
 */
export const pauseRecurringPattern = async (
  householdId: string,
  patternId: string
): Promise<RecurringPattern> => {
  const response = await api.patch<ApiResponse<RecurringPattern>>(
    `/households/${householdId}/recurring-patterns/${patternId}/pause`,
    { isPaused: true }
  );
  return response.data.data;
};

/**
 * Reprend un motif récurrent pausé
 */
export const resumeRecurringPattern = async (
  householdId: string,
  patternId: string
): Promise<RecurringPattern> => {
  const response = await api.patch<ApiResponse<RecurringPattern>>(
    `/households/${householdId}/recurring-patterns/${patternId}/pause`,
    { isPaused: false }
  );
  return response.data.data;
};

/**
 * Récupère l'historique de génération d'un motif
 */
export const getGenerationLogs = async (
  householdId: string,
  patternId: string,
  limit: number = 20
): Promise<RecurringTransactionLog[]> => {
  const response = await api.get<ApiResponse<RecurringTransactionLog[]>>(
    `/households/${householdId}/recurring-patterns/${patternId}/logs`,
    { params: { limit } }
  );
  return response.data.data;
};

/**
 * Génère les transactions récurrentes dues (cron job)
 * Utilisée uniquement par le backend cron job
 */
export const triggerRecurringTransactionGeneration = async (): Promise<{
  count: number;
  results: Array<{ patternId: string; status: string }>;
}> => {
  const response = await api.post<
    ApiResponse<{
      count: number;
      results: Array<{ patternId: string; status: string }>;
    }>
  >('/recurring-patterns/generate', {});
  return response.data.data;
};

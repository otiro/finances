import prisma from '@/config/database';
import { getMonthlySpendings } from './analyticsService';

export interface ExpenseProjection {
  month: string;
  projectedExpense: number;
  confidence: number; // 0-100
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface Anomaly {
  transactionId: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
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

/**
 * Project future expenses based on historical trends
 */
export const projectExpenses = async (
  householdId: string,
  monthsToProject: number = 6
): Promise<ExpenseProjection[]> => {
  const monthlySpendings = await getMonthlySpendings(householdId, 12);

  if (monthlySpendings.length < 3) {
    // Not enough data
    return [];
  }

  const expenses = monthlySpendings.map((m) => m.expense);
  const projections: ExpenseProjection[] = [];

  // Calculate average and trend
  const average = expenses.reduce((sum, e) => sum + e, 0) / expenses.length;
  const recentExpenses = expenses.slice(-3);
  const recentAverage = recentExpenses.reduce((sum, e) => sum + e, 0) / recentExpenses.length;

  let trend: 'increasing' | 'decreasing' | 'stable';
  if (recentAverage > average * 1.1) {
    trend = 'increasing';
  } else if (recentAverage < average * 0.9) {
    trend = 'decreasing';
  } else {
    trend = 'stable';
  }

  // Calculate variance (standard deviation not used in current implementation)
  const variance = expenses.reduce((sum, e) => sum + Math.pow(e - average, 2), 0) / expenses.length;
  // Math.sqrt(variance); // Would be standard deviation if needed

  // Generate projections
  const lastMonth = new Date();
  const lastExpense = expenses[expenses.length - 1];

  for (let i = 1; i <= monthsToProject; i++) {
    const projectionDate = new Date(lastMonth);
    projectionDate.setMonth(projectionDate.getMonth() + i);

    let projectedExpense = lastExpense;

    if (trend === 'increasing') {
      projectedExpense = lastExpense * 1.02 * i; // 2% increase per month
    } else if (trend === 'decreasing') {
      projectedExpense = lastExpense * 0.98 * i; // 2% decrease per month
    }

    // Confidence decreases as we project further
    const confidence = Math.max(50, 95 - i * 10);

    projections.push({
      month: `${projectionDate.getFullYear()}-${String(projectionDate.getMonth() + 1).padStart(2, '0')}`,
      projectedExpense: Math.round(projectedExpense * 100) / 100,
      confidence,
      trend,
    });
  }

  return projections;
};

/**
 * Detect spending anomalies
 */
export const detectAnomalies = async (
  householdId: string,
  sensitivity: 'low' | 'medium' | 'high' = 'medium'
): Promise<Anomaly[]> => {
  // Get last 90 days of transactions
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const transactions = await prisma.transaction.findMany({
    where: {
      account: { householdId },
      transactionDate: { gte: ninetyDaysAgo },
      type: 'DEBIT',
    },
    include: {
      category: true,
    },
    orderBy: { transactionDate: 'desc' },
  });

  const anomalies: Anomaly[] = [];
  const categoryStats = new Map<string, { amounts: number[]; avg: number; stdDev: number }>();

  // Calculate category statistics
  transactions.forEach((t) => {
    const categoryId = t.categoryId || 'UNCATEGORIZED';
    const amount = parseFloat(t.amount.toString());

    if (!categoryStats.has(categoryId)) {
      categoryStats.set(categoryId, { amounts: [], avg: 0, stdDev: 0 });
    }

    const stats = categoryStats.get(categoryId)!;
    stats.amounts.push(amount);
  });

  // Calculate averages and standard deviations
  categoryStats.forEach((stats) => {
    if (stats.amounts.length > 0) {
      stats.avg = stats.amounts.reduce((a, b) => a + b, 0) / stats.amounts.length;
      const variance = stats.amounts.reduce((sum, a) => sum + Math.pow(a - stats.avg, 2), 0) / stats.amounts.length;
      stats.stdDev = Math.sqrt(variance);
    }
  });

  // Detect anomalies
  const thresholdMultiplier = sensitivity === 'low' ? 3 : sensitivity === 'medium' ? 2.5 : 2;

  transactions.forEach((transaction) => {
    const categoryId = transaction.categoryId || 'UNCATEGORIZED';
    const amount = parseFloat(transaction.amount.toString());
    const stats = categoryStats.get(categoryId);

    if (!stats || stats.amounts.length < 3) {
      return; // Not enough data
    }

    const threshold = stats.avg + stats.stdDev * thresholdMultiplier;

    if (amount > threshold) {
      const deviation = ((amount - stats.avg) / stats.avg) * 100;
      let severity: 'low' | 'medium' | 'high';

      if (deviation > 100) {
        severity = 'high';
      } else if (deviation > 50) {
        severity = 'medium';
      } else {
        severity = 'low';
      }

      anomalies.push({
        transactionId: transaction.id,
        description: transaction.description,
        amount,
        category: transaction.category?.name || 'Non catégorisé',
        date: transaction.transactionDate,
        severity,
        reason: `Dépassement de ${deviation.toFixed(1)}% par rapport à la moyenne (${stats.avg.toFixed(2)} €)`,
      });
    }
  });

  return anomalies.sort((a, b) => b.amount - a.amount).slice(0, 10);
};

/**
 * Suggest budget amounts based on spending patterns
 */
export const suggestBudgets = async (householdId: string): Promise<BudgetSuggestion[]> => {
  // Get last 6 months of transactions
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const transactions = await prisma.transaction.findMany({
    where: {
      account: { householdId },
      transactionDate: { gte: sixMonthsAgo },
      type: 'DEBIT',
    },
    include: {
      category: true,
    },
  });

  // Get existing budgets
  const budgets = await prisma.budget.findMany({
    where: { householdId },
    select: {
      categoryId: true,
      amount: true,
    },
  });

  const budgetMap = new Map(budgets.map((b) => [b.categoryId, parseFloat(b.amount.toString())]));

  // Calculate suggestions by category
  const categoryStats = new Map<string, { name: string; amounts: number[] }>();

  transactions.forEach((t) => {
    const categoryId = t.categoryId || 'UNCATEGORIZED';
    const amount = parseFloat(t.amount.toString());

    if (!categoryStats.has(categoryId)) {
      categoryStats.set(categoryId, { name: t.category?.name || 'Non catégorisé', amounts: [] });
    }

    categoryStats.get(categoryId)!.amounts.push(amount);
  });

  const suggestions: BudgetSuggestion[] = [];

  categoryStats.forEach((stats, categoryId) => {
    if (stats.amounts.length === 0) return;

    const avg = stats.amounts.reduce((a, b) => a + b, 0) / stats.amounts.length;
    const max = Math.max(...stats.amounts);

    // Suggest budget as 110% of average (with 10% buffer)
    const suggestedBudget = Math.round(avg * 1.1 * 100) / 100;

    suggestions.push({
      categoryId,
      categoryName: stats.name,
      suggestedBudget,
      currentBudget: budgetMap.get(categoryId) || null,
      averageSpending: Math.round(avg * 100) / 100,
      maxSpending: Math.round(max * 100) / 100,
      confidence: Math.min(95, 50 + stats.amounts.length * 5),
    });
  });

  return suggestions.sort((a, b) => b.suggestedBudget - a.suggestedBudget);
};

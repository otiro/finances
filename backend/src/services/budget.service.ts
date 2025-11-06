import prisma from '../config/database';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';
import Decimal from 'decimal.js';

/**
 * Récupère les budgets d'un foyer
 */
export const getHouseholdBudgets = async (householdId: string, userId: string) => {
  // Vérifier que l'utilisateur est membre du foyer
  const userHousehold = await prisma.userHousehold.findFirst({
    where: {
      userId,
      householdId,
    },
  });

  if (!userHousehold) {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

  const budgets = await prisma.budget.findMany({
    where: {
      householdId,
    },
    include: {
      category: true,
      alerts: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1, // Dernière alerte
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return budgets;
};

/**
 * Récupère un budget spécifique
 */
export const getBudgetById = async (budgetId: string, householdId: string, userId: string) => {
  // Vérifier que l'utilisateur est membre du foyer
  const userHousehold = await prisma.userHousehold.findFirst({
    where: {
      userId,
      householdId,
    },
  });

  if (!userHousehold) {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      householdId,
    },
    include: {
      category: true,
      alerts: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!budget) {
    throw {
      status: HTTP_STATUS.NOT_FOUND,
      message: 'Budget non trouvé',
    };
  }

  return budget;
};

/**
 * Crée un nouveau budget pour un foyer
 */
export const createBudget = async (
  householdId: string,
  userId: string,
  data: {
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
) => {
  // Vérifier que l'utilisateur est admin du foyer
  const userHousehold = await prisma.userHousehold.findFirst({
    where: {
      userId,
      householdId,
    },
  });

  if (!userHousehold || userHousehold.role !== 'ADMIN') {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: 'Seul un administrateur peut créer des budgets',
    };
  }

  // Vérifier que la catégorie appartient au foyer
  const category = await prisma.category.findFirst({
    where: {
      id: data.categoryId,
      householdId,
    },
  });

  if (!category) {
    throw {
      status: HTTP_STATUS.NOT_FOUND,
      message: 'Catégorie non trouvée',
    };
  }

  const budget = await prisma.budget.create({
    data: {
      householdId,
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      amount: new Decimal(data.amount),
      period: data.period as 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      alertThreshold: data.alertThreshold || 80,
      alertEnabled: data.alertEnabled !== false,
    },
    include: {
      category: true,
      alerts: true,
    },
  });

  return budget;
};

/**
 * Met à jour un budget existant
 */
export const updateBudget = async (
  budgetId: string,
  householdId: string,
  userId: string,
  data: {
    name?: string;
    description?: string;
    amount?: number;
    period?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    endDate?: string | null;
    alertThreshold?: number;
    alertEnabled?: boolean;
    isActive?: boolean;
  }
) => {
  // Vérifier que l'utilisateur est admin du foyer
  const userHousehold = await prisma.userHousehold.findFirst({
    where: {
      userId,
      householdId,
    },
  });

  if (!userHousehold || userHousehold.role !== 'ADMIN') {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: 'Seul un administrateur peut modifier les budgets',
    };
  }

  // Vérifier que le budget appartient au foyer
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      householdId,
    },
  });

  if (!budget) {
    throw {
      status: HTTP_STATUS.NOT_FOUND,
      message: 'Budget non trouvé',
    };
  }

  const updateData: any = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.amount !== undefined) updateData.amount = new Decimal(data.amount);
  if (data.period !== undefined) updateData.period = data.period;
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
  if (data.alertThreshold !== undefined) updateData.alertThreshold = data.alertThreshold;
  if (data.alertEnabled !== undefined) updateData.alertEnabled = data.alertEnabled;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const updatedBudget = await prisma.budget.update({
    where: { id: budgetId },
    data: updateData,
    include: {
      category: true,
      alerts: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  return updatedBudget;
};

/**
 * Supprime un budget
 */
export const deleteBudget = async (
  budgetId: string,
  householdId: string,
  userId: string
) => {
  // Vérifier que l'utilisateur est admin du foyer
  const userHousehold = await prisma.userHousehold.findFirst({
    where: {
      userId,
      householdId,
    },
  });

  if (!userHousehold || userHousehold.role !== 'ADMIN') {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: 'Seul un administrateur peut supprimer les budgets',
    };
  }

  // Vérifier que le budget appartient au foyer
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      householdId,
    },
  });

  if (!budget) {
    throw {
      status: HTTP_STATUS.NOT_FOUND,
      message: 'Budget non trouvé',
    };
  }

  await prisma.budget.delete({
    where: { id: budgetId },
  });

  return { message: 'Budget supprimé avec succès' };
};

/**
 * Calcule les dépenses pour une catégorie pendant une période
 */
export const calculateCategorySpending = async (
  categoryId: string,
  householdId: string,
  startDate: Date,
  endDate: Date
): Promise<Decimal> => {
  const transactions = await prisma.transaction.findMany({
    where: {
      categoryId,
      account: {
        householdId,
      },
      type: 'DEBIT',
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const total = transactions.reduce((sum, tx) => {
    return sum.plus(new Decimal(tx.amount.toString()));
  }, new Decimal(0));

  return total;
};

/**
 * Récupère ou crée une alerte budgétaire
 */
export const recordBudgetAlert = async (
  budgetId: string,
  currentSpent: Decimal,
  budgetAmount: Decimal,
  thresholdPercentage: number
) => {
  const percentageUsed = currentSpent.dividedBy(budgetAmount).times(100);
  const thresholdReached = percentageUsed.greaterThanOrEqualTo(thresholdPercentage);

  const alert = await prisma.budgetAlert.create({
    data: {
      budgetId,
      currentSpent,
      percentageUsed,
      thresholdReached,
    },
  });

  return alert;
};

/**
 * Récupère les alertes d'un budget
 */
export const getBudgetAlerts = async (budgetId: string, householdId: string, userId: string) => {
  // Vérifier que l'utilisateur est membre du foyer
  const userHousehold = await prisma.userHousehold.findFirst({
    where: {
      userId,
      householdId,
    },
  });

  if (!userHousehold) {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

  // Vérifier que le budget appartient au foyer
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      householdId,
    },
  });

  if (!budget) {
    throw {
      status: HTTP_STATUS.NOT_FOUND,
      message: 'Budget non trouvé',
    };
  }

  const alerts = await prisma.budgetAlert.findMany({
    where: {
      budgetId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return alerts;
};

/**
 * Récupère le statut d'un budget (dépenses vs budget)
 */
export const getBudgetStatus = async (
  budgetId: string,
  householdId: string,
  userId: string
) => {
  const budget = await getBudgetById(budgetId, householdId, userId);

  // Calculer la période actuelle
  const now = new Date();
  let periodStart: Date;
  let periodEnd: Date;

  if (budget.period === 'MONTHLY') {
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  } else if (budget.period === 'QUARTERLY') {
    const quarter = Math.floor(now.getMonth() / 3);
    periodStart = new Date(now.getFullYear(), quarter * 3, 1);
    periodEnd = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59);
  } else {
    // YEARLY
    periodStart = new Date(now.getFullYear(), 0, 1);
    periodEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  }

  // Vérifier que la date de début du budget n'est pas après la fin de la période
  if (budget.startDate > periodEnd) {
    return {
      budget,
      currentSpent: new Decimal(0),
      percentageUsed: 0,
      thresholdReached: false,
      remaining: budget.amount,
      status: 'not_started',
    };
  }

  // Calculer les dépenses
  const currentSpent = await calculateCategorySpending(
    budget.categoryId,
    householdId,
    periodStart,
    periodEnd
  );

  const budgetAmount = new Decimal(budget.amount.toString());
  const percentageUsed = budgetAmount.equals(0)
    ? 0
    : currentSpent.dividedBy(budgetAmount).times(100).toNumber();

  const thresholdReached = percentageUsed >= budget.alertThreshold;
  const remaining = budgetAmount.minus(currentSpent);

  return {
    budget,
    currentSpent: currentSpent.toNumber(),
    percentageUsed,
    thresholdReached,
    remaining: remaining.toNumber(),
    status: percentageUsed >= 100 ? 'exceeded' : 'active',
  };
};

/**
 * Récupère un résumé de tous les budgets d'un foyer avec leur statut
 */
export const getHouseholdBudgetsSummary = async (householdId: string, userId: string) => {
  const budgets = await getHouseholdBudgets(householdId, userId);

  const summaries = await Promise.all(
    budgets.map(async (budget) => {
      const status = await getBudgetStatus(budget.id, householdId, userId);
      return {
        ...status,
        alerts: budget.alerts,
      };
    })
  );

  // Calculer les statistiques globales
  const totalBudgeted = summaries.reduce((sum, s) => sum + parseFloat(s.budget.amount.toString()), 0);
  const totalSpent = summaries.reduce((sum, s) => sum + (typeof s.currentSpent === 'number' ? s.currentSpent : parseFloat(s.currentSpent.toString())), 0);
  const budgetsExceeded = summaries.filter(s => s.status === 'exceeded').length;
  const budgetsNearThreshold = summaries.filter(s => s.thresholdReached && s.status !== 'exceeded').length;

  return {
    budgets: summaries,
    statistics: {
      totalBudgeted,
      totalSpent,
      percentageUsed: totalBudgeted === 0 ? 0 : (totalSpent / totalBudgeted) * 100,
      budgetsExceeded,
      budgetsNearThreshold,
      activeCount: budgets.filter(b => b.isActive).length,
    },
  };
};

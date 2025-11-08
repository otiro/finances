import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/database';
import { TransactionType, BudgetPeriod } from '@prisma/client';

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
  month: string; // YYYY-MM format
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

// Helper: Get period start and end dates
const getPeriodDates = (period: BudgetPeriod | string, referenceDate: Date = new Date()) => {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  switch (period) {
    case 'MONTHLY':
    case 'MONTH':
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month + 1, 0, 23, 59, 59),
      };
    case 'QUARTERLY':
    case 'QUARTER': {
      const quarter = Math.floor(month / 3);
      return {
        start: new Date(year, quarter * 3, 1),
        end: new Date(year, quarter * 3 + 3, 0, 23, 59, 59),
      };
    }
    case 'YEARLY':
    case 'YEAR':
      return {
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31, 23, 59, 59),
      };
    default:
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month + 1, 0, 23, 59, 59),
      };
  }
};

// Get transactions for a date range
const getTransactionsInRange = async (
  householdId: string,
  startDate: Date,
  endDate: Date
) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      account: {
        householdId,
      },
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      category: true,
    },
  });

  return transactions;
};

/**
 * Get category breakdown for current period
 */
export const getCategoryBreakdown = async (
  householdId: string,
  type?: 'INCOME' | 'EXPENSE'
): Promise<CategoryBreakdown[]> => {
  const { start, end } = getPeriodDates('MONTHLY');

  const transactions = await getTransactionsInRange(householdId, start, end);

  // Filter by type if specified
  let filtered = transactions;
  if (type) {
    filtered = transactions.filter((t) => t.type === (type === 'INCOME' ? TransactionType.CREDIT : TransactionType.DEBIT));
  }

  // Group by category
  const grouped = new Map<string, CategoryBreakdown>();

  filtered.forEach((transaction) => {
    const categoryId = transaction.categoryId || 'UNCATEGORIZED';
    const categoryName = transaction.category?.name || 'Non catégorisé';
    const categoryColor = transaction.category?.color || '#999999';

    if (!grouped.has(categoryId)) {
      grouped.set(categoryId, {
        categoryId,
        categoryName,
        categoryColor,
        amount: 0,
        type: transaction.type === TransactionType.CREDIT ? 'INCOME' : 'EXPENSE',
        percentage: 0,
        transactionCount: 0,
      });
    }

    const item = grouped.get(categoryId)!;
    item.amount += parseFloat(transaction.amount.toString());
    item.transactionCount += 1;
  });

  // Calculate percentages
  const total = Array.from(grouped.values()).reduce((sum, item) => sum + item.amount, 0);

  const result = Array.from(grouped.values()).map((item) => ({
    ...item,
    percentage: total > 0 ? Math.round((item.amount / total) * 100 * 100) / 100 : 0,
  }));

  return result.sort((a, b) => b.amount - a.amount);
};

/**
 * Get monthly income and expense totals
 */
export const getMonthlySpendings = async (householdId: string, months: number = 12): Promise<MonthlySpendings[]> => {
  const today = new Date();
  const results: MonthlySpendings[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    const transactions = await getTransactionsInRange(householdId, start, end);

    let income = 0;
    let expense = 0;

    transactions.forEach((transaction) => {
      const amount = parseFloat(transaction.amount.toString());
      if (transaction.type === TransactionType.CREDIT) {
        income += amount;
      } else {
        expense += amount;
      }
    });

    results.push({
      month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
      income,
      expense,
      netCashFlow: income - expense,
    });
  }

  return results;
};

/**
 * Get spending trends for a specific category
 */
export const getCategoryTrends = async (
  householdId: string,
  categoryId: string,
  months: number = 12
): Promise<CategoryTrend[]> => {
  const today = new Date();
  const results: CategoryTrend[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    const transactions = await getTransactionsInRange(householdId, start, end);

    const categoryTransactions = transactions.filter(
      (t) => t.categoryId === categoryId && t.type === TransactionType.DEBIT
    );

    const amount = categoryTransactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    results.push({
      month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
      amount,
    });
  }

  return results;
};

/**
 * Compare spending between two periods
 */
export const comparePeriods = async (
  householdId: string,
  startDate1: Date,
  endDate1: Date,
  startDate2: Date,
  endDate2: Date
): Promise<PeriodComparison> => {
  const transactions1 = await getTransactionsInRange(householdId, startDate1, endDate1);
  const transactions2 = await getTransactionsInRange(householdId, startDate2, endDate2);

  const calculatePeriodStats = (transactions: any[]) => {
    let income = 0;
    let expense = 0;

    transactions.forEach((transaction) => {
      const amount = parseFloat(transaction.amount.toString());
      if (transaction.type === TransactionType.CREDIT) {
        income += amount;
      } else {
        expense += amount;
      }
    });

    return { income, expense, netCashFlow: income - expense };
  };

  const period1Stats = calculatePeriodStats(transactions1);
  const period2Stats = calculatePeriodStats(transactions2);

  const incomeChange = period2Stats.income - period1Stats.income;
  const expenseChange = period2Stats.expense - period1Stats.expense;

  return {
    period1: {
      label: `${startDate1.toLocaleDateString('fr-FR')} - ${endDate1.toLocaleDateString('fr-FR')}`,
      ...period1Stats,
    },
    period2: {
      label: `${startDate2.toLocaleDateString('fr-FR')} - ${endDate2.toLocaleDateString('fr-FR')}`,
      ...period2Stats,
    },
    differences: {
      incomeChange,
      incomeChangePercent: period1Stats.income > 0 ? (incomeChange / period1Stats.income) * 100 : 0,
      expenseChange,
      expenseChangePercent: period1Stats.expense > 0 ? (expenseChange / period1Stats.expense) * 100 : 0,
    },
  };
};

/**
 * Generate analytics snapshot for a specific month
 */
export const generateSnapshot = async (
  householdId: string,
  year: number,
  month: number,
  periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' = 'MONTHLY'
) => {
  // Calculate period dates
  let start: Date;
  let end: Date;
  let periodLabel: string;

  if (periodType === 'MONTHLY') {
    start = new Date(year, month - 1, 1);
    end = new Date(year, month, 0, 23, 59, 59);
    periodLabel = `${year}-${String(month).padStart(2, '0')}`;
  } else if (periodType === 'QUARTERLY') {
    const quarter = Math.ceil(month / 3);
    start = new Date(year, (quarter - 1) * 3, 1);
    end = new Date(year, quarter * 3, 0, 23, 59, 59);
    periodLabel = `${year}-Q${quarter}`;
  } else {
    start = new Date(year, 0, 1);
    end = new Date(year, 11, 31, 23, 59, 59);
    periodLabel = `${year}`;
  }

  const transactions = await getTransactionsInRange(householdId, start, end);

  // Calculate totals
  let totalIncome = 0;
  let totalExpense = 0;

  const categoryDetails = new Map<
    string,
    { amount: number; type: 'INCOME' | 'EXPENSE'; count: number; categoryName: string }
  >();

  transactions.forEach((transaction) => {
    const amount = parseFloat(transaction.amount.toString());
    const categoryId = transaction.categoryId || 'UNCATEGORIZED';
    const categoryName = transaction.category?.name || 'Non catégorisé';
    const type = transaction.type === TransactionType.CREDIT ? 'INCOME' : 'EXPENSE';

    if (type === 'INCOME') {
      totalIncome += amount;
    } else {
      totalExpense += amount;
    }

    if (!categoryDetails.has(categoryId)) {
      categoryDetails.set(categoryId, {
        amount: 0,
        type,
        count: 0,
        categoryName,
      });
    }

    const detail = categoryDetails.get(categoryId)!;
    detail.amount += amount;
    detail.count += 1;
  });

  const netCashFlow = totalIncome - totalExpense;

  // Create snapshot - check if it exists first
  let snapshot = await prisma.analyticsSnapshot.findFirst({
    where: {
      householdId,
      period: periodLabel,
    },
  });

  if (snapshot) {
    snapshot = await prisma.analyticsSnapshot.update({
      where: { id: snapshot.id },
      data: {
        totalIncome: new Decimal(totalIncome),
        totalExpense: new Decimal(totalExpense),
        netCashFlow: new Decimal(netCashFlow),
        updatedAt: new Date(),
      },
    });

    // Delete existing details
    await prisma.analyticsDetail.deleteMany({
      where: { snapshotId: snapshot.id },
    });
  } else {
    snapshot = await prisma.analyticsSnapshot.create({
      data: {
        householdId,
        period: periodLabel,
        periodType,
        totalIncome: new Decimal(totalIncome),
        totalExpense: new Decimal(totalExpense),
        netCashFlow: new Decimal(netCashFlow),
      },
    });
  }

  // Create details
  for (const [categoryId, detail] of categoryDetails) {
    await prisma.analyticsDetail.create({
      data: {
        snapshotId: snapshot.id,
        categoryId,
        amount: new Decimal(detail.amount),
        type: detail.type,
        transactionCount: detail.count,
      },
    });
  }

  return snapshot;
};

/**
 * Get snapshot history for a household
 */
export const getSnapshotHistory = async (householdId: string, limit: number = 12) => {
  const snapshots = await prisma.analyticsSnapshot.findMany({
    where: { householdId },
    include: {
      details: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      period: 'desc',
    },
    take: limit,
  });

  return snapshots.reverse();
};

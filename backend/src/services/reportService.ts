import prisma from '@/db';
import { MonthlySpendings, getCategoryBreakdown, getMonthlySpendings } from './analyticsService';

export interface ReportData {
  householdName: string;
  periodStart: Date;
  periodEnd: Date;
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  categoryBreakdown: {
    categoryName: string;
    amount: number;
    percentage: number;
    type: 'INCOME' | 'EXPENSE';
  }[];
  monthlySpendings: MonthlySpendings[];
}

/**
 * Prepare report data for export
 */
export const prepareReportData = async (
  householdId: string,
  startDate: Date,
  endDate: Date
): Promise<ReportData> => {
  // Get household name
  const household = await prisma.household.findUniqueOrThrow({
    where: { id: householdId },
  });

  // Get transactions in range
  const transactions = await prisma.transaction.findMany({
    where: {
      account: { householdId },
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Calculate totals
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((t) => {
    const amount = parseFloat(t.amount.toString());
    if (t.type === 'CREDIT') {
      totalIncome += amount;
    } else {
      totalExpense += amount;
    }
  });

  const netCashFlow = totalIncome - totalExpense;

  // Get category breakdown
  const categoryBreakdown = await getCategoryBreakdown(householdId, undefined);

  // Get monthly spendings
  const months = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  const monthlySpendings = await getMonthlySpendings(householdId, Math.max(months, 1));

  return {
    householdName: household.name,
    periodStart: startDate,
    periodEnd: endDate,
    totalIncome,
    totalExpense,
    netCashFlow,
    categoryBreakdown,
    monthlySpendings,
  };
};

/**
 * Log an export
 */
export const logExport = async (
  householdId: string,
  userId: string,
  format: 'PDF' | 'CSV' | 'XLSX',
  periodStart: Date,
  periodEnd: Date,
  fileName: string,
  fileSize: number,
  downloadUrl?: string
) => {
  return prisma.exportLog.create({
    data: {
      householdId,
      userId,
      format,
      periodStart,
      periodEnd,
      fileName,
      fileSize,
      downloadUrl,
    },
  });
};

/**
 * Get export history for a household
 */
export const getExportHistory = async (householdId: string, limit: number = 20) => {
  return prisma.exportLog.findMany({
    where: { householdId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
};

/**
 * Get export history for a user
 */
export const getUserExportHistory = async (userId: string, limit: number = 20) => {
  return prisma.exportLog.findMany({
    where: { userId },
    include: {
      household: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
};

/**
 * Format report data as CSV string
 */
export const formatAsCSV = (data: ReportData): string => {
  const lines: string[] = [];

  // Header
  lines.push(`Foyer: ${data.householdName}`);
  lines.push(`Période: ${data.periodStart.toLocaleDateString('fr-FR')} - ${data.periodEnd.toLocaleDateString('fr-FR')}`);
  lines.push('');

  // Summary
  lines.push('RÉSUMÉ');
  lines.push(`Revenu Total,${data.totalIncome.toFixed(2)} €`);
  lines.push(`Dépense Total,${data.totalExpense.toFixed(2)} €`);
  lines.push(`Flux Net,${data.netCashFlow.toFixed(2)} €`);
  lines.push('');

  // Category breakdown
  lines.push('RÉPARTITION PAR CATÉGORIE');
  lines.push('Catégorie,Montant,Pourcentage,Type');
  data.categoryBreakdown.forEach((cat) => {
    lines.push(`"${cat.categoryName}",${cat.amount.toFixed(2)} €,${cat.percentage.toFixed(2)}%,${cat.type}`);
  });
  lines.push('');

  // Monthly spendings
  lines.push('DÉPENSES MENSUELLES');
  lines.push('Mois,Revenu,Dépense,Flux Net');
  data.monthlySpendings.forEach((month) => {
    lines.push(
      `${month.month},${month.income.toFixed(2)} €,${month.expense.toFixed(2)} €,${month.netCashFlow.toFixed(2)} €`
    );
  });

  return lines.join('\n');
};

/**
 * Format report data as JSON
 */
export const formatAsJSON = (data: ReportData): string => {
  return JSON.stringify(data, null, 2);
};

/**
 * Generate a simple text report
 */
export const formatAsText = (data: ReportData): string => {
  const lines: string[] = [];

  lines.push('╔═══════════════════════════════════════════════════════╗');
  lines.push('║              RAPPORT FINANCIER                        ║');
  lines.push('╚═══════════════════════════════════════════════════════╝');
  lines.push('');

  lines.push(`Foyer: ${data.householdName}`);
  lines.push(`Période: ${data.periodStart.toLocaleDateString('fr-FR')} - ${data.periodEnd.toLocaleDateString('fr-FR')}`);
  lines.push('');

  lines.push('─ RÉSUMÉ FINANCIER ─');
  lines.push(
    `  Revenu Total:        ${data.totalIncome.toFixed(2).padStart(10)} €`
  );
  lines.push(
    `  Dépense Total:       ${data.totalExpense.toFixed(2).padStart(10)} €`
  );
  lines.push(
    `  Flux Net:            ${data.netCashFlow.toFixed(2).padStart(10)} €`
  );
  lines.push('');

  lines.push('─ RÉPARTITION PAR CATÉGORIE ─');
  data.categoryBreakdown.slice(0, 10).forEach((cat) => {
    const line = `  ${cat.categoryName.substring(0, 25).padEnd(25)} ${cat.amount.toFixed(2).padStart(10)} € (${cat.percentage.toFixed(1).padStart(5)}%)`;
    lines.push(line);
  });
  if (data.categoryBreakdown.length > 10) {
    lines.push(`  ... et ${data.categoryBreakdown.length - 10} autres catégories`);
  }
  lines.push('');

  lines.push('─ TENDANCE MENSUELLE ─');
  data.monthlySpendings.slice(-6).forEach((month) => {
    lines.push(`  ${month.month}  Revenu: ${month.income.toFixed(2).padStart(10)} €  Dépense: ${month.expense.toFixed(2).padStart(10)} €`);
  });

  lines.push('');
  lines.push('Rapport généré le: ' + new Date().toLocaleString('fr-FR'));

  return lines.join('\n');
};

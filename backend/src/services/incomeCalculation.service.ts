import prisma from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Calcule le revenu mensuel d'un utilisateur dans un foyer
 * Basé sur les transactions CREDIT dans la catégorie "Salaire"
 *
 * @param householdId - ID du foyer
 * @param userId - ID de l'utilisateur
 * @param year - Année (ex: 2025)
 * @param month - Mois (1-12)
 * @param salaryCategoryId - ID de la catégorie "Salaire" (optionnel, utilise un fallback)
 * @returns Montant du revenu en Decimal
 */
export const calculateMonthlyIncome = async (
  householdId: string,
  userId: string,
  year: number,
  month: number,
  salaryCategoryId?: string
): Promise<Decimal> => {
  // Déterminer la catégorie salaire
  let categoryId = salaryCategoryId;

  if (!categoryId) {
    // Chercher d'abord une catégorie marquée comme isSalaryCategory = true
    const salaryCategory = await prisma.category.findFirst({
      where: {
        householdId: householdId,
        isSalaryCategory: true,
      },
    });

    if (salaryCategory) {
      categoryId = salaryCategory.id;
    } else {
      // Fallback: Chercher une catégorie nommée "Salary" ou "Revenu"
      const namedSalaryCategory = await prisma.category.findFirst({
        where: {
          householdId: householdId,
          name: {
            in: ['Salary', 'Revenu', 'SALARY', 'REVENU'],
          },
        },
      });
      categoryId = namedSalaryCategory?.id;
    }
  }

  // Si aucune catégorie de salaire trouvée, retourner 0
  if (!categoryId) {
    return new Decimal(0);
  }

  // Calculer le début et la fin du mois
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  endDate.setHours(23, 59, 59, 999);

  // Trouver tous les comptes de l'utilisateur dans ce foyer
  const userAccounts = await prisma.account.findMany({
    where: {
      householdId: householdId,
      owners: {
        some: {
          userId: userId,
        },
      },
    },
    select: {
      id: true,
    },
  });

  const accountIds = userAccounts.map((a) => a.id);

  // Chercher toutes les transactions CREDIT du mois dans la catégorie de salaire
  const transactions = await prisma.transaction.findMany({
    where: {
      accountId: { in: accountIds },
      type: 'CREDIT',
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
      categoryId: categoryId,
    },
    select: {
      amount: true,
    },
  });

  // Sommer les montants
  const totalIncome = transactions.reduce((sum, transaction) => {
    return sum.plus(transaction.amount);
  }, new Decimal(0));

  return totalIncome;
};

/**
 * Récupère les revenus de tous les membres d'un foyer pour un mois donné
 * Retourne { userId: Decimal, ... }
 */
export const getHouseholdMonthlyIncomes = async (
  householdId: string,
  year: number,
  month: number,
  salaryCategoryId?: string
): Promise<Record<string, Decimal>> => {
  // Récupérer tous les membres du foyer
  const members = await prisma.userHousehold.findMany({
    where: { householdId },
    select: { userId: true },
  });

  const incomes: Record<string, Decimal> = {};

  // Calculer le revenu pour chaque membre
  for (const member of members) {
    const income = await calculateMonthlyIncome(
      householdId,
      member.userId,
      year,
      month,
      salaryCategoryId
    );
    incomes[member.userId] = income;
  }

  return incomes;
};

/**
 * Calcule les ratios de partage basés sur les revenus
 * Retourne { userId: pourcentage, ... }
 *
 * Exemple: { "user1": 57.14, "user2": 42.86 }
 */
export const calculateSharingRatios = async (
  householdId: string,
  year: number,
  month: number,
  salaryCategoryId?: string
): Promise<Record<string, number>> => {
  // Récupérer les revenus
  const incomes = await getHouseholdMonthlyIncomes(
    householdId,
    year,
    month,
    salaryCategoryId
  );

  // Calculer le revenu total
  const totalIncome = Object.values(incomes).reduce((sum, income) => {
    return sum.plus(income);
  }, new Decimal(0));

  // Si personne n'a de revenu, retourner des parts égales
  if (totalIncome.equals(0)) {
    const memberCount = Object.keys(incomes).length;
    const equalShare = 100 / memberCount;

    return Object.keys(incomes).reduce((acc, userId) => {
      acc[userId] = Math.round(equalShare * 100) / 100;
      return acc;
    }, {} as Record<string, number>);
  }

  // Calculer les ratios
  const ratios: Record<string, number> = {};

  for (const [userId, income] of Object.entries(incomes)) {
    const ratio = income.div(totalIncome).mul(100).toNumber();
    ratios[userId] = Math.round(ratio * 100) / 100; // Arrondir à 2 décimales
  }

  return ratios;
};

/**
 * Applique les ratios de partage à un compte
 * Met à jour les ownershipPercentage de tous les propriétaires
 */
export const applyRatiosToAccount = async (
  accountId: string,
  ratios: Record<string, number>
): Promise<void> => {
  // Mettre à jour chaque propriétaire avec son ratio
  for (const [userId, ratio] of Object.entries(ratios)) {
    await prisma.accountOwner.update({
      where: {
        accountId_userId: {
          accountId,
          userId,
        },
      },
      data: {
        ownershipPercentage: new Decimal(ratio),
      },
    });
  }
};

/**
 * Applique les ratios à plusieurs comptes
 */
export const applyRatiosToAccounts = async (
  accountIds: string[],
  ratios: Record<string, number>
): Promise<void> => {
  for (const accountId of accountIds) {
    await applyRatiosToAccount(accountId, ratios);
  }
};

/**
 * Enregistre l'historique des ratios de partage
 */
export const recordSharingRatioHistory = async (
  householdId: string,
  year: number,
  month: number,
  ratios: Record<string, number>,
  incomes: Record<string, Decimal>,
  totalIncome: Decimal,
  accountId?: string,
  appliedBy?: string
): Promise<void> => {
  await prisma.sharingRatioHistory.create({
    data: {
      householdId,
      accountId,
      year,
      month,
      ratios: ratios,
      incomes: Object.entries(incomes).reduce(
        (acc, [userId, income]) => {
          acc[userId] = income.toNumber();
          return acc;
        },
        {} as Record<string, number>
      ),
      totalIncome,
      appliedAt: new Date(),
      appliedBy,
    },
  });
};

/**
 * Récupère l'historique des ratios pour un foyer
 */
export const getSharingRatioHistory = async (
  householdId: string,
  limit: number = 24
): Promise<any[]> => {
  return prisma.sharingRatioHistory.findMany({
    where: { householdId, accountId: null }, // Récupérer l'historique au niveau foyer
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
};

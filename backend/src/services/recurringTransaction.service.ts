import prisma from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';
import { RecurringFrequency, TransactionType, RecurringTransactionLogStatus } from '@prisma/client';
import { HTTP_STATUS } from '../utils/constants';
import { verifyHouseholdMembership } from '../utils/verify';

/**
 * Crée un nouveau motif de transaction récurrente
 */
export const createRecurringPattern = async (
  householdId: string,
  userId: string,
  data: {
    accountId: string;
    name: string;
    description?: string;
    frequency: RecurringFrequency;
    type: TransactionType;
    amount: number;
    categoryId?: string;
    startDate: Date;
    endDate?: Date;
    dayOfMonth?: number;
    dayOfWeek?: number;
  }
) => {
  // Vérifier que l'utilisateur est membre du foyer
  await verifyHouseholdMembership(householdId, userId);

  // Vérifier que le compte appartient au foyer
  const account = await prisma.account.findFirst({
    where: {
      id: data.accountId,
      householdId,
    },
  });

  if (!account) {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: 'Accès refusé : ce compte n\'appartient pas à ce foyer',
    };
  }

  // Calculer la première date de génération
  const nextGenerationDate = calculateNextGenerationDate(
    data.startDate,
    data.frequency,
    data.dayOfMonth,
    data.dayOfWeek
  );

  // Créer le motif
  const pattern = await prisma.recurringPattern.create({
    data: {
      householdId,
      accountId: data.accountId,
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      frequency: data.frequency,
      type: data.type,
      amount: new Decimal(data.amount),
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      dayOfMonth: data.dayOfMonth,
      dayOfWeek: data.dayOfWeek,
      nextGenerationDate,
    },
    include: {
      account: true,
      category: true,
    },
  });

  return pattern;
};

/**
 * Récupère les motifs récurrents d'un foyer
 */
export const getHouseholdRecurringPatterns = async (
  householdId: string,
  userId: string,
  onlyActive: boolean = false
) => {
  // Vérifier que l'utilisateur est membre du foyer
  await verifyHouseholdMembership(householdId, userId);

  const patterns = await prisma.recurringPattern.findMany({
    where: {
      householdId,
      ...(onlyActive && { isActive: true, isPaused: false }),
    },
    include: {
      account: true,
      category: true,
    },
    orderBy: {
      nextGenerationDate: 'asc',
    },
  });

  return patterns;
};

/**
 * Récupère un motif récurrent spécifique
 */
export const getRecurringPattern = async (
  patternId: string,
  householdId: string,
  userId: string
) => {
  // Vérifier que l'utilisateur est membre du foyer
  await verifyHouseholdMembership(householdId, userId);

  const pattern = await prisma.recurringPattern.findFirst({
    where: {
      id: patternId,
      householdId,
    },
    include: {
      account: true,
      category: true,
      generationLogs: {
        orderBy: {
          generatedDate: 'desc',
        },
        take: 10,
      },
    },
  });

  if (!pattern) {
    throw {
      status: HTTP_STATUS.NOT_FOUND,
      message: 'Motif récurrent non trouvé',
    };
  }

  return pattern;
};

/**
 * Met à jour un motif récurrent
 */
export const updateRecurringPattern = async (
  patternId: string,
  householdId: string,
  userId: string,
  data: Partial<{
    name: string;
    description: string;
    frequency: RecurringFrequency;
    type: TransactionType;
    amount: number;
    categoryId: string | null;
    endDate: Date | null;
    dayOfMonth: number | null;
    dayOfWeek: number | null;
    isActive: boolean;
    isPaused: boolean;
  }>
) => {
  // Vérifier que l'utilisateur est membre du foyer
  await verifyHouseholdMembership(householdId, userId);

  // Vérifier que le motif appartient au foyer
  const pattern = await prisma.recurringPattern.findFirst({
    where: {
      id: patternId,
      householdId,
    },
  });

  if (!pattern) {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: 'Accès refusé : ce motif ne vous appartient pas',
    };
  }

  // Mettre à jour
  const updated = await prisma.recurringPattern.update({
    where: { id: patternId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.frequency && { frequency: data.frequency }),
      ...(data.type && { type: data.type }),
      ...(data.amount && { amount: new Decimal(data.amount) }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
      ...(data.dayOfMonth !== undefined && { dayOfMonth: data.dayOfMonth }),
      ...(data.dayOfWeek !== undefined && { dayOfWeek: data.dayOfWeek }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.isPaused !== undefined && { isPaused: data.isPaused }),
    },
    include: {
      account: true,
      category: true,
    },
  });

  return updated;
};

/**
 * Supprime un motif récurrent
 */
export const deleteRecurringPattern = async (
  patternId: string,
  householdId: string,
  userId: string
) => {
  // Vérifier que l'utilisateur est membre du foyer
  await verifyHouseholdMembership(householdId, userId);

  // Vérifier que le motif appartient au foyer
  const pattern = await prisma.recurringPattern.findFirst({
    where: {
      id: patternId,
      householdId,
    },
  });

  if (!pattern) {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: 'Accès refusé : ce motif ne vous appartient pas',
    };
  }

  await prisma.recurringPattern.delete({
    where: { id: patternId },
  });

  return { message: 'Motif récurrent supprimé avec succès' };
};

/**
 * Génère une transaction à partir d'un motif récurrent
 * Utilisée par le cron job
 */
export const generateTransactionFromPattern = async (patternId: string) => {
  const pattern = await prisma.recurringPattern.findUnique({
    where: { id: patternId },
    include: {
      account: true,
    },
  });

  if (!pattern || !pattern.isActive || pattern.isPaused) {
    return null;
  }

  // Vérifier la date de fin
  if (pattern.endDate && new Date() > pattern.endDate) {
    return null;
  }

  try {
    // Vérifier qu'il y a au moins un propriétaire du compte
    const owners = await prisma.accountOwner.findMany({
      where: { accountId: pattern.accountId },
    });

    if (owners.length === 0) {
      throw new Error('Le compte n\'a pas de propriétaire');
    }

    // Créer la transaction avec le premier propriétaire
    const transaction = await prisma.transaction.create({
      data: {
        accountId: pattern.accountId,
        userId: owners[0].userId,
        categoryId: pattern.categoryId,
        amount: pattern.amount,
        type: pattern.type,
        description: pattern.name,
        transactionDate: new Date(),
        isRecurring: true,
        recurringPatternId: pattern.id,
        notes: `Généré automatiquement de: ${pattern.name}`,
      },
      include: {
        user: true,
        category: true,
      },
    });

    // Calculer la prochaine date de génération
    const nextGenerationDate = calculateNextGenerationDate(
      new Date(),
      pattern.frequency,
      pattern.dayOfMonth,
      pattern.dayOfWeek
    );

    // Mettre à jour le motif avec les infos de génération
    await prisma.recurringPattern.update({
      where: { id: patternId },
      data: {
        nextGenerationDate,
        lastGeneratedDate: new Date(),
      },
    });

    // Créer un log de succès
    await prisma.recurringTransactionLog.create({
      data: {
        recurringPatternId: patternId,
        generatedTransactionId: transaction.id,
        generatedDate: new Date(),
        status: RecurringTransactionLogStatus.SUCCESS,
      },
    });

    return transaction;
  } catch (error) {
    // Créer un log d'erreur
    await prisma.recurringTransactionLog.create({
      data: {
        recurringPatternId: patternId,
        generatedDate: new Date(),
        status: RecurringTransactionLogStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Erreur inconnue',
      },
    });

    throw error;
  }
};

/**
 * Génère les transactions récurrentes dues
 * Appelée par le cron job chaque jour
 */
export const generateDueRecurringTransactions = async () => {
  const now = new Date();

  // Trouver tous les motifs à générer
  const duePatterns = await prisma.recurringPattern.findMany({
    where: {
      isActive: true,
      isPaused: false,
      nextGenerationDate: {
        lte: now,
      },
      OR: [
        {
          endDate: null,
        },
        {
          endDate: {
            gte: now,
          },
        },
      ],
    },
  });

  const results = [];

  for (const pattern of duePatterns) {
    try {
      const transaction = await generateTransactionFromPattern(pattern.id);
      results.push({
        patternId: pattern.id,
        status: 'success',
        transactionId: transaction?.id,
      });
    } catch (error) {
      results.push({
        patternId: pattern.id,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  return results;
};

/**
 * Récupère l'historique de génération d'un motif
 */
export const getGenerationLogs = async (
  patternId: string,
  householdId: string,
  userId: string,
  limit: number = 20
) => {
  // Vérifier que l'utilisateur est membre du foyer
  await verifyHouseholdMembership(householdId, userId);

  // Vérifier que le motif appartient au foyer
  const pattern = await prisma.recurringPattern.findFirst({
    where: {
      id: patternId,
      householdId,
    },
  });

  if (!pattern) {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: 'Accès refusé : ce motif ne vous appartient pas',
    };
  }

  const logs = await prisma.recurringTransactionLog.findMany({
    where: {
      recurringPatternId: patternId,
    },
    orderBy: {
      generatedDate: 'desc',
    },
    take: limit,
  });

  return logs;
};

/**
 * Calcule la prochaine date de génération basée sur la fréquence
 */
export const calculateNextGenerationDate = (
  baseDate: Date,
  frequency: RecurringFrequency,
  dayOfMonth?: number | null,
  _dayOfWeek?: number | null
): Date => {
  const date = new Date(baseDate);

  switch (frequency) {
    case RecurringFrequency.DAILY:
      date.setDate(date.getDate() + 1);
      break;

    case RecurringFrequency.WEEKLY:
      date.setDate(date.getDate() + 7);
      break;

    case RecurringFrequency.BIWEEKLY:
      date.setDate(date.getDate() + 14);
      break;

    case RecurringFrequency.MONTHLY:
      // Si dayOfMonth est spécifié, l'utiliser
      if (dayOfMonth) {
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        const dayToUse = Math.min(dayOfMonth, new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate());
        date.setFullYear(nextMonth.getFullYear(), nextMonth.getMonth(), dayToUse);
      } else {
        date.setMonth(date.getMonth() + 1);
      }
      break;

    case RecurringFrequency.QUARTERLY:
      date.setMonth(date.getMonth() + 3);
      break;

    case RecurringFrequency.YEARLY:
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  // Réinitialiser l'heure à 00:00:00
  date.setHours(0, 0, 0, 0);

  return date;
};

/**
 * Pause/reprend un motif récurrent
 */
export const togglePauseRecurringPattern = async (
  patternId: string,
  householdId: string,
  userId: string,
  isPaused: boolean
) => {
  // Vérifier que l'utilisateur est membre du foyer
  await verifyHouseholdMembership(householdId, userId);

  // Vérifier que le motif appartient au foyer
  const pattern = await prisma.recurringPattern.findFirst({
    where: {
      id: patternId,
      householdId,
    },
  });

  if (!pattern) {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: 'Accès refusé : ce motif ne vous appartient pas',
    };
  }

  const updated = await prisma.recurringPattern.update({
    where: { id: patternId },
    data: {
      isPaused,
    },
    include: {
      account: true,
      category: true,
    },
  });

  return updated;
};

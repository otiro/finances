import prisma from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';
import { TransactionType } from '@prisma/client';
import { HTTP_STATUS } from '../utils/constants';

/**
 * Crée une nouvelle transaction
 */
export const createTransaction = async (
  accountId: string,
  userId: string,
  data: {
    amount: number;
    type: TransactionType;
    description: string;
    categoryId?: string;
    transactionDate?: Date;
    notes?: string;
  }
) => {
  // Vérifier que l'utilisateur est propriétaire du compte
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      owners: {
        some: {
          userId,
        },
      },
    },
  });

  if (!account) {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: 'Accès refusé : vous n\'êtes pas propriétaire de ce compte',
    };
  }

  // Créer la transaction
  const transaction = await prisma.transaction.create({
    data: {
      accountId,
      userId,
      amount: new Decimal(data.amount),
      type: data.type,
      description: data.description,
      categoryId: data.categoryId,
      transactionDate: data.transactionDate ? new Date(data.transactionDate) : new Date(),
      notes: data.notes,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  return transaction;
};

/**
 * Récupère les transactions d'un compte (l'utilisateur doit être propriétaire du compte)
 */
export const getAccountTransactions = async (
  accountId: string,
  userId: string,
  limit: number = 50,
  offset: number = 0
) => {
  // Vérifier que l'utilisateur est propriétaire du compte
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      owners: {
        some: {
          userId,
        },
      },
    },
  });

  if (!account) {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: 'Accès refusé : vous n\'êtes pas propriétaire de ce compte',
    };
  }

  // Récupérer les transactions (triées par date décroissante)
  const transactions = await prisma.transaction.findMany({
    where: { accountId },
    orderBy: { transactionDate: 'desc' },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  const total = await prisma.transaction.count({ where: { accountId } });

  return {
    transactions,
    total,
    limit,
    offset,
  };
};

/**
 * Récupère une transaction par ID
 */
export const getTransactionById = async (
  transactionId: string,
  userId: string
) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      account: {
        include: {
          household: {
            include: {
              members: {
                where: { userId },
              },
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  if (!transaction) {
    throw {
      status: HTTP_STATUS.NOT_FOUND,
      message: 'Transaction non trouvée',
    };
  }

  // Vérifier l'accès
  if (transaction.account.household.members.length === 0) {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: 'Accès refusé : vous ne faites pas partie de ce foyer',
    };
  }

  return transaction;
};

/**
 * Met à jour une transaction
 */
export const updateTransaction = async (
  transactionId: string,
  userId: string,
  data: {
    amount?: number;
    type?: TransactionType;
    description?: string;
    categoryId?: string;
    transactionDate?: Date;
    notes?: string;
  }
) => {
  // Récupérer la transaction et vérifier l'accès
  const transaction = await getTransactionById(transactionId, userId);

  // Vérifier que l'utilisateur est admin du foyer
  const userHousehold = await verifyHouseholdMembership(userId, transaction.account.householdId);

  if (!userHousehold || userHousehold.role !== 'ADMIN') {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: 'Seul un administrateur du foyer peut modifier une transaction',
    };
  }

  // Mettre à jour la transaction
  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      ...(data.amount && { amount: new Decimal(data.amount) }),
      ...(data.type && { type: data.type }),
      ...(data.description && { description: data.description }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.transactionDate && { transactionDate: new Date(data.transactionDate) }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  return updated;
};

/**
 * Supprime une transaction
 */
export const deleteTransaction = async (
  transactionId: string,
  userId: string
) => {
  // Récupérer la transaction et vérifier l'accès
  const transaction = await getTransactionById(transactionId, userId);

  // Vérifier que l'utilisateur est admin du foyer
  const userHousehold = await verifyHouseholdMembership(userId, transaction.account.householdId);

  if (!userHousehold || userHousehold.role !== 'ADMIN') {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: 'Seul un administrateur du foyer peut supprimer une transaction',
    };
  }

  await prisma.transaction.delete({
    where: { id: transactionId },
  });
};

// Helper function pour éviter le bug Prisma
const verifyHouseholdMembership = async (userId: string, householdId: string) => {
  return await prisma.userHousehold.findFirst({
    where: {
      userId: userId,
      householdId: householdId,
    },
  });
};

/**
 * Calcule les dettes d'un foyer basées sur les transactions et les parts de propriété
 * Retourne: qui doit combien à qui
 */
export const calculateDebts = async (
  householdId: string,
  userId: string
) => {
  // Vérifier que l'utilisateur est membre du foyer
  const userHousehold = await verifyHouseholdMembership(userId, householdId);

  if (!userHousehold) {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: 'Vous ne faites pas partie de ce foyer',
    };
  }

  // Récupérer tous les comptes du foyer avec leurs transactions et propriétaires
  const accounts = await prisma.account.findMany({
    where: { householdId },
    include: {
      transactions: true,
      owners: {
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
      },
    },
  });

  // Structure pour tracker les dettes: Map<creditorId, Map<debtorId, amount>>
  const debtsMap = new Map<string, Map<string, number>>();

  // Traiter chaque compte
  for (const account of accounts) {
    // Ignorer les comptes CHECKING (personnels)
    if (account.type === 'CHECKING') {
      continue;
    }

    // Calculer le solde total du compte (initialBalance + transactions)
    let totalBalance = Number(account.initialBalance);
    const userPayments = new Map<string, number>(); // Qui a payé combien

    // Calculer les paiements par utilisateur
    for (const transaction of account.transactions) {
      const amount = Number(transaction.amount);

      if (transaction.type === 'DEBIT') {
        totalBalance -= amount;
        userPayments.set(
          transaction.userId,
          (userPayments.get(transaction.userId) || 0) + amount
        );
      } else {
        // CREDIT
        totalBalance += amount;
        userPayments.set(
          transaction.userId,
          (userPayments.get(transaction.userId) || 0) - amount
        );
      }
    }

    // Pour chaque propriétaire, calculer sa part et sa dette
    for (const owner of account.owners) {
      const ownershipPercent = Number(owner.ownershipPercentage) / 100;
      const ownerShare = totalBalance * ownershipPercent;
      const ownerPaid = userPayments.get(owner.userId) || 0;
      const ownerDebt = ownerShare - ownerPaid;

      // Si ownerDebt > 0, le propriétaire doit payer
      // Si ownerDebt < 0, on lui doit de l'argent

      // Chercher qui peut payer ce propriétaire (ceux avec des crédits)
      for (const creditor of account.owners) {
        if (creditor.userId === owner.userId) continue;

        const creditorOwnershipPercent = Number(creditor.ownershipPercentage) / 100;
        const creditorShare = totalBalance * creditorOwnershipPercent;
        const creditorPaid = userPayments.get(creditor.userId) || 0;
        const creditorDebt = creditorShare - creditorPaid;

        // Si creditor a un crédit (debt < 0) et owner doit payer (debt > 0)
        if (creditorDebt < 0 && ownerDebt > 0) {
          const debtAmount = Math.min(Math.abs(creditorDebt), ownerDebt);

          if (!debtsMap.has(creditor.userId)) {
            debtsMap.set(creditor.userId, new Map());
          }

          const existing = debtsMap.get(creditor.userId)?.get(owner.userId) || 0;
          debtsMap.get(creditor.userId)?.set(owner.userId, existing + debtAmount);
        }
      }
    }
  }

  // Convertir la Map en tableau lisible
  const debts: Array<{
    creditor: { id: string; firstName: string; lastName: string; email: string };
    debtor: { id: string; firstName: string; lastName: string; email: string };
    amount: number;
  }> = [];

  // Récupérer les infos utilisateur
  const allUsers = await prisma.user.findMany({
    where: {
      households: {
        some: { householdId },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  const usersMap = new Map(allUsers.map((u) => [u.id, u]));

  for (const [creditorId, debtors] of debtsMap) {
    for (const [debtorId, amount] of debtors) {
      if (amount > 0.01) {
        // Ignorer les montants négligeables
        const creditor = usersMap.get(creditorId);
        const debtor = usersMap.get(debtorId);

        if (creditor && debtor) {
          debts.push({
            creditor,
            debtor,
            amount: Math.round(amount * 100) / 100, // Arrondir à 2 décimales
          });
        }
      }
    }
  }

  return debts;
};

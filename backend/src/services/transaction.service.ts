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
  const householdIdForBalancing = householdId; // Sauvegarder le householdId pour utilisation plus tard

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

    // Pour chaque paire de propriétaires, calculer qui doit à qui
    const ownerDebts = new Map<string, number>(); // Map<userId, debtAmount>

    // D'abord, calculer la dette pour chaque propriétaire
    console.log(`\n=== Compte: ${account.id} (type: ${account.type}) ===`);
    console.log(`Total Balance: ${totalBalance}`);
    console.log(`User Payments:`, Object.fromEntries(userPayments));

    for (const owner of account.owners) {
      const ownershipPercent = Number(owner.ownershipPercentage) / 100;
      const ownerShare = totalBalance * ownershipPercent;
      const ownerPaid = userPayments.get(owner.userId) || 0;
      const ownerDebt = ownerShare - ownerPaid;
      ownerDebts.set(owner.userId, ownerDebt);
      console.log(`User ${owner.userId}: share=${ownerShare}, paid=${ownerPaid}, debt=${ownerDebt}`);
    }

    // Maintenant, créer les dettes entre propriétaires
    // ownerDebt > 0 signifie que le propriétaire doit de l'argent
    // ownerDebt < 0 signifie que le propriétaire doit recevoir de l'argent
    console.log(`Owner Debts Map:`, Object.fromEntries(ownerDebts));

    for (const debtor of account.owners) {
      const debtorAmount = ownerDebts.get(debtor.userId) || 0;

      // Sauter si ce propriétaire n'a rien à payer
      if (debtorAmount <= 0.01) {
        console.log(`Skipping debtor ${debtor.userId}: amount=${debtorAmount} (<=0.01)`);
        continue;
      }

      console.log(`Processing debtor ${debtor.userId}: amount=${debtorAmount}`);

      // Chercher des créanciers qui doivent recevoir de l'argent
      let remainingDebt = debtorAmount;

      for (const creditor of account.owners) {
        if (creditor.userId === debtor.userId) continue;

        const creditorAmount = ownerDebts.get(creditor.userId) || 0;

        // Le créancier doit recevoir de l'argent (montant négatif)
        if (creditorAmount < -0.01 && remainingDebt > 0.01) {
          const debtToTransfer = Math.min(remainingDebt, Math.abs(creditorAmount));

          if (!debtsMap.has(creditor.userId)) {
            debtsMap.set(creditor.userId, new Map());
          }

          const existing = debtsMap.get(creditor.userId)?.get(debtor.userId) || 0;
          debtsMap.get(creditor.userId)?.set(debtor.userId, existing + debtToTransfer);

          console.log(`  -> Transfer ${debtToTransfer} from ${debtor.userId} to creditor ${creditor.userId}`);

          remainingDebt -= debtToTransfer;
          ownerDebts.set(creditor.userId, creditorAmount + debtToTransfer);
        }
      }
    }

    console.log(`Final debtsMap:`, debtsMap);
  }

  // Convertir la Map en tableau lisible et créer les BalancingRecords
  const debts: Array<{
    id: string;
    creditor: { id: string; firstName: string; lastName: string; email: string };
    debtor: { id: string; firstName: string; lastName: string; email: string };
    amount: number;
    isPaid?: boolean;
    paidAt?: string;
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
          const roundedAmount = Math.round(amount * 100) / 100;

          // Chercher un enregistrement existant pour cette paire de débiteur/créancier
          let balancingRecord = await prisma.balancingRecord.findFirst({
            where: {
              householdId: householdIdForBalancing,
              fromUserId: creditorId,
              toUserId: debtorId,
            },
          });

          // Créer ou mettre à jour le BalancingRecord
          if (balancingRecord) {
            // Mettre à jour le montant et la date de fin
            balancingRecord = await prisma.balancingRecord.update({
              where: { id: balancingRecord.id },
              data: {
                amount: new Decimal(roundedAmount),
                periodEnd: new Date(),
              },
            });
          } else {
            // Créer un nouveau BalancingRecord
            balancingRecord = await prisma.balancingRecord.create({
              data: {
                householdId: householdIdForBalancing,
                fromUserId: creditorId,
                toUserId: debtorId,
                amount: new Decimal(roundedAmount),
                periodStart: new Date(),
                periodEnd: new Date(),
                status: 'PENDING' as const,
                isPaid: false,
              },
            });
          }

          debts.push({
            id: balancingRecord.id,
            creditor,
            debtor,
            amount: roundedAmount,
            isPaid: balancingRecord.isPaid,
            paidAt: balancingRecord.paidAt?.toISOString(),
          });
        }
      }
    }
  }

  return debts;
};

/**
 * Marque une dette comme payée
 */
export const markDebtAsPaid = async (
  balancingRecordId: string,
  householdId: string,
  userId: string,
  isPaid: boolean = true
) => {
  // Vérifier que l'utilisateur est membre du foyer
  const userHousehold = await verifyHouseholdMembership(userId, householdId);

  if (!userHousehold) {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: 'Vous ne faites pas partie de ce foyer',
    };
  }

  // Vérifier que l'utilisateur est impliqué dans cette dette (créancier ou débiteur)
  const balancingRecord = await prisma.balancingRecord.findUnique({
    where: { id: balancingRecordId },
  });

  if (!balancingRecord) {
    throw {
      status: HTTP_STATUS.NOT_FOUND,
      message: 'Enregistrement de bilan non trouvé',
    };
  }

  if (
    balancingRecord.householdId !== householdId ||
    (balancingRecord.fromUserId !== userId && balancingRecord.toUserId !== userId)
  ) {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: 'Vous ne pouvez pas marquer cette dette comme payée',
    };
  }

  // Mettre à jour l'enregistrement
  const updated = await prisma.balancingRecord.update({
    where: { id: balancingRecordId },
    data: {
      isPaid,
      paidAt: isPaid ? new Date() : null,
    },
    include: {
      fromUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      toUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return updated;
};

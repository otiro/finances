import prisma from '../config/database';
import { CreateAccountInput, UpdateAccountInput } from '../utils/validators';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';
import { Decimal } from '@prisma/client/runtime/library';
import { AccountType, TransactionType } from '@prisma/client';

/**
 * Calcule les parts de propriété pour chaque utilisateur
 */
const calculateOwnershipShares = async (
  ownerIds: string[],
  _householdId: string,
  sharingMode: 'EQUAL' | 'PROPORTIONAL' | 'CUSTOM'
): Promise<Record<string, number>> => {
  if (sharingMode === 'EQUAL') {
    const sharePerOwner = 100 / ownerIds.length;
    return ownerIds.reduce((acc, ownerId) => {
      acc[ownerId] = sharePerOwner;
      return acc;
    }, {} as Record<string, number>);
  }

  if (sharingMode === 'PROPORTIONAL') {
    // Récupérer les revenus des propriétaires
    const owners = await prisma.user.findMany({
      where: {
        id: { in: ownerIds },
      },
      select: {
        id: true,
        monthlyIncome: true,
      },
    });

    const totalIncome = owners.reduce(
      (sum, owner) => sum + Number(owner.monthlyIncome),
      0
    );

    if (totalIncome === 0) {
      // Si personne n'a de revenu, partage égal
      const sharePerOwner = 100 / ownerIds.length;
      return ownerIds.reduce((acc, ownerId) => {
        acc[ownerId] = sharePerOwner;
        return acc;
      }, {} as Record<string, number>);
    }

    return owners.reduce((acc, owner) => {
      const share = (Number(owner.monthlyIncome) / totalIncome) * 100;
      acc[owner.id] = Math.round(share * 100) / 100; // Arrondir à 2 décimales
      return acc;
    }, {} as Record<string, number>);
  }

  // CUSTOM: parts égales par défaut, l'utilisateur pourra les modifier plus tard
  const sharePerOwner = 100 / ownerIds.length;
  return ownerIds.reduce((acc, ownerId) => {
    acc[ownerId] = sharePerOwner;
    return acc;
  }, {} as Record<string, number>);
};

/**
 * Crée un nouveau compte bancaire
 */
export const createAccount = async (userId: string, data: CreateAccountInput) => {
  // Vérifier que l'utilisateur est membre du foyer
  const userHousehold = await prisma.userHousehold.findUnique({
    where: {
      userId_householdId: {
        userId: userId,
        householdId: data.householdId,
      },
    },
    include: {
      household: true,
    },
  });

  if (!userHousehold) {
    const error = new Error(ERROR_MESSAGES.FORBIDDEN);
    (error as any).status = HTTP_STATUS.FORBIDDEN;
    throw error;
  }

  // Vérifier que tous les propriétaires sont membres du foyer
  const allOwnersAreMember = await prisma.userHousehold.count({
    where: {
      householdId: data.householdId,
      userId: { in: data.ownerIds },
    },
  });

  if (allOwnersAreMember !== data.ownerIds.length) {
    const error = new Error('Tous les propriétaires doivent être membres du foyer');
    (error as any).status = HTTP_STATUS.BAD_REQUEST;
    throw error;
  }

  // Calculer les parts de propriété
  const ownershipShares = await calculateOwnershipShares(
    data.ownerIds,
    data.householdId,
    userHousehold.household.sharingMode
  );

  // Créer le compte avec les propriétaires
  const account = await prisma.account.create({
    data: {
      name: data.name,
      type: data.type as AccountType,
      householdId: data.householdId,
      initialBalance: new Decimal(data.initialBalance || 0),
      owners: {
        create: data.ownerIds.map((ownerId) => ({
          userId: ownerId,
          ownershipPercentage: new Decimal(ownershipShares[ownerId]),
        })),
      },
    },
    include: {
      owners: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              monthlyIncome: true,
            },
          },
        },
      },
      household: {
        select: {
          id: true,
          name: true,
          sharingMode: true,
        },
      },
    },
  });

  return account;
};

/**
 * Récupère tous les comptes de l'utilisateur
 */
export const getUserAccounts = async (userId: string) => {
  const accounts = await prisma.account.findMany({
    where: {
      household: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
    },
    include: {
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
      household: {
        select: {
          id: true,
          name: true,
          sharingMode: true,
        },
      },
      _count: {
        select: {
          transactions: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Convertir les Decimal en nombres
  return accounts.map((account: any) => ({
    ...account,
    initialBalance: Number(account.initialBalance),
    currentBalance: Number(account.currentBalance),
    owners: account.owners.map((owner: any) => ({
      ...owner,
      ownershipPercentage: Number(owner.ownershipPercentage),
    })),
  }));
};

/**
 * Récupère tous les comptes d'un foyer
 */
export const getHouseholdAccounts = async (householdId: string, userId: string) => {
  // Vérifier que l'utilisateur est membre du foyer
  const userHousehold = await prisma.userHousehold.findUnique({
    where: {
      userId_householdId: {
        userId: userId,
        householdId: householdId,
      },
    },
  });

  if (!userHousehold) {
    const error = new Error(ERROR_MESSAGES.FORBIDDEN);
    (error as any).status = HTTP_STATUS.FORBIDDEN;
    throw error;
  }

  const accounts = await prisma.account.findMany({
    where: { householdId },
    include: {
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
      _count: {
        select: {
          transactions: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Convertir les Decimal en nombres
  return accounts.map((account: any) => ({
    ...account,
    initialBalance: Number(account.initialBalance),
    currentBalance: Number(account.currentBalance),
    owners: account.owners.map((owner: any) => ({
      ...owner,
      ownershipPercentage: Number(owner.ownershipPercentage),
    })),
  }));
};

/**
 * Récupère un compte par ID
 */
export const getAccountById = async (accountId: string, userId: string) => {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      household: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
    },
    include: {
      owners: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              monthlyIncome: true,
            },
          },
        },
      },
      household: {
        select: {
          id: true,
          name: true,
          sharingMode: true,
        },
      },
      transactions: {
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!account) {
    const error = new Error('Compte non trouvé');
    (error as any).status = HTTP_STATUS.NOT_FOUND;
    throw error;
  }

  // Convertir les Decimal en nombres
  return {
    ...account,
    initialBalance: Number(account.initialBalance),
    currentBalance: Number(account.currentBalance),
    owners: account.owners.map((owner: any) => ({
      ...owner,
      ownershipPercentage: Number(owner.ownershipPercentage),
    })),
    transactions: account.transactions.map((transaction: any) => ({
      ...transaction,
      amount: Number(transaction.amount),
    })),
  };
};

/**
 * Met à jour un compte
 */
export const updateAccount = async (
  accountId: string,
  userId: string,
  data: UpdateAccountInput
) => {
  // Vérifier que l'utilisateur est propriétaire du compte ou admin du foyer
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      OR: [
        {
          owners: {
            some: {
              userId: userId,
            },
          },
        },
        {
          household: {
            members: {
              some: {
                userId: userId,
                role: 'ADMIN',
              },
            },
          },
        },
      ],
    },
  });

  if (!account) {
    const error = new Error(ERROR_MESSAGES.FORBIDDEN);
    (error as any).status = HTTP_STATUS.FORBIDDEN;
    throw error;
  }

  const updatedAccount = await prisma.account.update({
    where: { id: accountId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.initialBalance !== undefined && {
        initialBalance: new Decimal(data.initialBalance),
      }),
    },
    include: {
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

  return updatedAccount;
};

/**
 * Supprime un compte
 */
export const deleteAccount = async (accountId: string, userId: string) => {
  // Vérifier que l'utilisateur est admin du foyer
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      household: {
        members: {
          some: {
            userId: userId,
            role: 'ADMIN',
          },
        },
      },
    },
  });

  if (!account) {
    const error = new Error(ERROR_MESSAGES.FORBIDDEN);
    (error as any).status = HTTP_STATUS.FORBIDDEN;
    throw error;
  }

  // Vérifier qu'il n'y a pas de transactions
  const transactionCount = await prisma.transaction.count({
    where: { accountId },
  });

  if (transactionCount > 0) {
    const error = new Error(
      'Impossible de supprimer un compte qui contient des transactions'
    );
    (error as any).status = HTTP_STATUS.BAD_REQUEST;
    throw error;
  }

  await prisma.account.delete({
    where: { id: accountId },
  });

  return { success: true };
};

/**
 * Calcule le solde actuel d'un compte
 */
export const getAccountBalance = async (accountId: string, userId: string) => {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      household: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
    },
    include: {
      transactions: {
        select: {
          amount: true,
          type: true,
        },
      },
    },
  });

  if (!account) {
    const error = new Error('Compte non trouvé');
    (error as any).status = HTTP_STATUS.NOT_FOUND;
    throw error;
  }

  // Calculer le solde : initialBalance + somme des revenus - somme des dépenses
  const balance = account.transactions.reduce((sum, transaction) => {
    if (transaction.type === TransactionType.CREDIT) {
      return sum + Number(transaction.amount);
    } else {
      return sum - Number(transaction.amount);
    }
  }, Number(account.initialBalance));

  return {
    accountId: account.id,
    accountName: account.name,
    initialBalance: Number(account.initialBalance),
    currentBalance: balance,
    transactionCount: account.transactions.length,
  };
};

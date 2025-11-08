import prisma from '../config/database';
import { CreateHouseholdInput } from '../utils/validators';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';

/**
 * Crée un nouveau foyer avec l'utilisateur comme admin
 */
export const createHousehold = async (userId: string, data: CreateHouseholdInput) => {
  const household = await prisma.household.create({
    data: {
      name: data.name,
      sharingMode: data.sharingMode,
      members: {
        create: {
          userId: userId,
          role: 'ADMIN',
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              monthlyIncome: true,
            },
          },
        },
      },
    },
  });

  return household;
};

/**
 * Récupère tous les foyers d'un utilisateur
 */
export const getUserHouseholds = async (userId: string) => {
  const userHouseholds = await prisma.userHousehold.findMany({
    where: { userId },
    include: {
      household: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  monthlyIncome: true,
                },
              },
            },
          },
          _count: {
            select: {
              accounts: true,
            },
          },
        },
      },
    },
  });

  return userHouseholds.map((uh) => ({
    ...uh.household,
    userRole: uh.role,
  }));
};

/**
 * Récupère un foyer par ID avec vérification d'accès
 */
export const getHouseholdById = async (householdId: string, userId: string) => {
  // Récupérer le foyer avec le rôle de l'utilisateur
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

  const household = await prisma.household.findUnique({
    where: {
      id: householdId,
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              monthlyIncome: true,
            },
          },
        },
      },
      accounts: {
        include: {
          owners: {
            include: {
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
      },
    },
  });

  if (!household) {
    const error = new Error(ERROR_MESSAGES.FORBIDDEN);
    (error as any).status = HTTP_STATUS.FORBIDDEN;
    throw error;
  }

  return {
    ...household,
    userRole: userHousehold.role,
  };
};

/**
 * Ajoute un membre à un foyer
 */
export const addMemberToHousehold = async (
  householdId: string,
  userEmail: string,
  role: 'ADMIN' | 'MEMBER',
  requestingUserId: string
) => {
  // Vérifier que l'utilisateur demandeur est admin du foyer
  const userHousehold = await prisma.userHousehold.findUnique({
    where: {
      userId_householdId: {
        userId: requestingUserId,
        householdId: householdId,
      },
    },
  });

  if (!userHousehold || userHousehold.role !== 'ADMIN') {
    const error = new Error(ERROR_MESSAGES.FORBIDDEN);
    (error as any).status = HTTP_STATUS.FORBIDDEN;
    throw error;
  }

  // Trouver l'utilisateur à ajouter
  const userToAdd = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!userToAdd) {
    const error = new Error('Utilisateur non trouvé');
    (error as any).status = HTTP_STATUS.NOT_FOUND;
    throw error;
  }

  // Vérifier qu'il n'est pas déjà membre
  const existingMembership = await prisma.userHousehold.findUnique({
    where: {
      userId_householdId: {
        userId: userToAdd.id,
        householdId: householdId,
      },
    },
  });

  if (existingMembership) {
    const error = new Error('Cet utilisateur est déjà membre du foyer');
    (error as any).status = HTTP_STATUS.BAD_REQUEST;
    throw error;
  }

  // Ajouter le membre
  const membership = await prisma.userHousehold.create({
    data: {
      userId: userToAdd.id,
      householdId: householdId,
      role: role,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          monthlyIncome: true,
        },
      },
    },
  });

  return membership;
};

/**
 * Supprime un membre d'un foyer
 */
export const removeMemberFromHousehold = async (
  householdId: string,
  memberUserId: string,
  requestingUserId: string
) => {
  // Vérifier que l'utilisateur demandeur est admin du foyer
  const userHousehold = await prisma.userHousehold.findUnique({
    where: {
      userId_householdId: {
        userId: requestingUserId,
        householdId: householdId,
      },
    },
  });

  if (!userHousehold || userHousehold.role !== 'ADMIN') {
    const error = new Error(ERROR_MESSAGES.FORBIDDEN);
    (error as any).status = HTTP_STATUS.FORBIDDEN;
    throw error;
  }

  // Vérifier qu'on ne supprime pas le dernier admin
  if (memberUserId === requestingUserId) {
    const adminCount = await prisma.userHousehold.count({
      where: {
        householdId: householdId,
        role: 'ADMIN',
      },
    });

    if (adminCount <= 1) {
      const error = new Error('Impossible de supprimer le dernier administrateur du foyer');
      (error as any).status = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }
  }

  // Supprimer le membre
  await prisma.userHousehold.delete({
    where: {
      userId_householdId: {
        userId: memberUserId,
        householdId: householdId,
      },
    },
  });

  return { success: true };
};

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
 * Met à jour le mode de partage d'un foyer
 * Recalcule les parts de propriété de tous les comptes du foyer
 */
export const updateHouseholdSharingMode = async (
  householdId: string,
  sharingMode: 'EQUAL' | 'PROPORTIONAL' | 'CUSTOM',
  requestingUserId: string
) => {
  // Vérifier que l'utilisateur demandeur est admin du foyer
  const userHousehold = await prisma.userHousehold.findUnique({
    where: {
      userId_householdId: {
        userId: requestingUserId,
        householdId: householdId,
      },
    },
  });

  if (!userHousehold || userHousehold.role !== 'ADMIN') {
    const error = new Error(ERROR_MESSAGES.FORBIDDEN);
    (error as any).status = HTTP_STATUS.FORBIDDEN;
    throw error;
  }

  // Récupérer tous les comptes du foyer avec leurs propriétaires
  const accounts = await prisma.account.findMany({
    where: { householdId: householdId },
    include: {
      owners: {
        select: {
          userId: true,
        },
      },
    },
  });

  // Mettre à jour le mode de partage du foyer
  const household = await prisma.household.update({
    where: { id: householdId },
    data: { sharingMode },
  });

  // Recalculer et mettre à jour les parts de propriété pour chaque compte
  for (const account of accounts) {
    const ownerIds = account.owners.map((o) => o.userId);

    // Calculer les nouvelles parts selon le nouveau mode
    const newShares = await calculateOwnershipShares(
      ownerIds,
      householdId,
      sharingMode
    );

    // Mettre à jour les parts pour chaque propriétaire
    for (const ownerId of ownerIds) {
      await prisma.accountOwner.update({
        where: {
          accountId_userId: {
            accountId: account.id,
            userId: ownerId,
          },
        },
        data: {
          ownershipPercentage: newShares[ownerId],
        },
      });
    }
  }

  return household;
};

/**
 * Promeut un MEMBER à ADMIN dans un foyer
 * Nécessite que l'utilisateur demandeur soit ADMIN
 */
export const promoteMemberToAdmin = async (
  householdId: string,
  memberUserId: string,
  requestingUserId: string
) => {
  // Vérifier que l'utilisateur demandeur est admin
  const requesterMembership = await prisma.userHousehold.findUnique({
    where: {
      userId_householdId: {
        userId: requestingUserId,
        householdId: householdId,
      },
    },
  });

  if (!requesterMembership || requesterMembership.role !== 'ADMIN') {
    const error = new Error(ERROR_MESSAGES.FORBIDDEN);
    (error as any).status = HTTP_STATUS.FORBIDDEN;
    throw error;
  }

  // Vérifier que le membre existe dans ce foyer
  const memberMembership = await prisma.userHousehold.findUnique({
    where: {
      userId_householdId: {
        userId: memberUserId,
        householdId: householdId,
      },
    },
  });

  if (!memberMembership) {
    const error = new Error('Membre non trouvé dans ce foyer');
    (error as any).status = HTTP_STATUS.NOT_FOUND;
    throw error;
  }

  if (memberMembership.role === 'ADMIN') {
    const error = new Error('Cet utilisateur est déjà administrateur');
    (error as any).status = HTTP_STATUS.BAD_REQUEST;
    throw error;
  }

  // Promouvoir le membre
  const updated = await prisma.userHousehold.update({
    where: {
      userId_householdId: {
        userId: memberUserId,
        householdId: householdId,
      },
    },
    data: { role: 'ADMIN' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return updated;
};

/**
 * Rétrograde un ADMIN à MEMBER dans un foyer
 * Vérifie qu'il y aura au moins 1 ADMIN après la rétrogradation
 */
export const demoteAdminToMember = async (
  householdId: string,
  adminUserId: string,
  requestingUserId: string
) => {
  // Vérifier que l'utilisateur demandeur est admin
  const requesterMembership = await prisma.userHousehold.findUnique({
    where: {
      userId_householdId: {
        userId: requestingUserId,
        householdId: householdId,
      },
    },
  });

  if (!requesterMembership || requesterMembership.role !== 'ADMIN') {
    const error = new Error(ERROR_MESSAGES.FORBIDDEN);
    (error as any).status = HTTP_STATUS.FORBIDDEN;
    throw error;
  }

  // Vérifier que le membre existe dans ce foyer
  const memberMembership = await prisma.userHousehold.findUnique({
    where: {
      userId_householdId: {
        userId: adminUserId,
        householdId: householdId,
      },
    },
  });

  if (!memberMembership) {
    const error = new Error('Membre non trouvé dans ce foyer');
    (error as any).status = HTTP_STATUS.NOT_FOUND;
    throw error;
  }

  if (memberMembership.role !== 'ADMIN') {
    const error = new Error('Cet utilisateur n\'est pas administrateur');
    (error as any).status = HTTP_STATUS.BAD_REQUEST;
    throw error;
  }

  // Vérifier qu'il y aura au moins 1 ADMIN après la rétrogradation
  const adminCount = await prisma.userHousehold.count({
    where: {
      householdId: householdId,
      role: 'ADMIN',
    },
  });

  if (adminCount <= 1) {
    const error = new Error(
      'Impossible de rétrograder le dernier administrateur du foyer. Il doit y avoir au moins un administrateur.'
    );
    (error as any).status = HTTP_STATUS.BAD_REQUEST;
    throw error;
  }

  // Rétrograder le membre
  const updated = await prisma.userHousehold.update({
    where: {
      userId_householdId: {
        userId: adminUserId,
        householdId: householdId,
      },
    },
    data: { role: 'MEMBER' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return updated;
};

/**
 * Supprime un foyer et toutes ses données associées (DEV only)
 * Seulement les admins du foyer peuvent le supprimer
 */
export const deleteHousehold = async (householdId: string, requestingUserId: string) => {
  // Vérifier que l'utilisateur est admin du foyer
  const userHousehold = await prisma.userHousehold.findUnique({
    where: {
      userId_householdId: {
        userId: requestingUserId,
        householdId,
      },
    },
  });

  if (!userHousehold || userHousehold.role !== 'ADMIN') {
    const error = new Error('Vous devez être administrateur du foyer pour le supprimer');
    (error as any).status = 403;
    throw error;
  }

  // Supprimer le foyer (cascade supprimera les données liées)
  const deleted = await prisma.household.delete({
    where: { id: householdId },
  });

  return deleted;
};

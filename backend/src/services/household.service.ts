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
 * Met à jour le mode de partage d'un foyer
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

  const household = await prisma.household.update({
    where: { id: householdId },
    data: { sharingMode },
  });

  return household;
};

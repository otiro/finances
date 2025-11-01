import prisma from '../config/database';
import { HTTP_STATUS } from './constants';

/**
 * Vérifie qu'un utilisateur est membre d'un foyer
 * Lance une erreur s'il ne l'est pas
 */
export const verifyHouseholdMembership = async (householdId: string, userId: string) => {
  const membership = await prisma.userHousehold.findUnique({
    where: {
      userId_householdId: {
        userId,
        householdId,
      },
    },
  });

  if (!membership) {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: 'Accès refusé : vous n\'êtes pas membre de ce foyer',
    };
  }

  return membership;
};

import prisma from '../config/database';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';

/**
 * Récupère les catégories d'un foyer
 */
export const getHouseholdCategories = async (householdId: string, userId: string) => {
  // Vérifier que l'utilisateur est membre du foyer
  const userHousehold = await prisma.userHousehold.findFirst({
    where: {
      userId,
      householdId,
    },
  });

  if (!userHousehold) {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

  const categories = await prisma.category.findMany({
    where: {
      householdId,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return categories;
};

/**
 * Récupère les catégories système (globales)
 */
export const getSystemCategories = async () => {
  const categories = await prisma.category.findMany({
    where: {
      isSystem: true,
      householdId: null,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return categories;
};

/**
 * Crée une catégorie personnalisée pour un foyer
 */
export const createCategory = async (
  householdId: string,
  userId: string,
  data: {
    name: string;
    color?: string;
    icon?: string;
  }
) => {
  // Vérifier que l'utilisateur est admin du foyer
  const userHousehold = await prisma.userHousehold.findFirst({
    where: {
      userId,
      householdId,
    },
  });

  if (!userHousehold || userHousehold.role !== 'ADMIN') {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: 'Seul un administrateur peut créer des catégories',
    };
  }

  const category = await prisma.category.create({
    data: {
      householdId,
      name: data.name,
      color: data.color || '#3f51b5',
      icon: data.icon,
      isSystem: false,
    },
  });

  return category;
};

/**
 * Récupère toutes les catégories disponibles (système + foyer)
 */
export const getAllAvailableCategories = async (householdId: string, userId: string) => {
  // Vérifier que l'utilisateur est membre du foyer
  const userHousehold = await prisma.userHousehold.findFirst({
    where: {
      userId,
      householdId,
    },
  });

  if (!userHousehold) {
    throw {
      status: HTTP_STATUS.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

  // Récupérer les catégories système et les catégories du foyer
  const [systemCategories, householdCategories] = await Promise.all([
    prisma.category.findMany({
      where: {
        isSystem: true,
        householdId: null,
      },
      orderBy: { name: 'asc' },
    }),
    prisma.category.findMany({
      where: {
        householdId,
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  return {
    system: systemCategories,
    household: householdCategories,
  };
};

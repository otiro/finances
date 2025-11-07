import { Request, Response, NextFunction } from 'express';
import * as householdService from '../services/household.service';
import { HTTP_STATUS } from '../utils/constants';

/**
 * Crée un nouveau foyer
 */
export const createHousehold = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: 'Non authentifié',
      });
      return;
    }

    const household = await householdService.createHousehold(req.userId, req.body);

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      message: 'Foyer créé avec succès',
      data: household,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère tous les foyers de l'utilisateur
 */
export const getUserHouseholds = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: 'Non authentifié',
      });
      return;
    }

    const households = await householdService.getUserHouseholds(req.userId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: households,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère un foyer par ID
 */
export const getHouseholdById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: 'Non authentifié',
      });
      return;
    }

    const household = await householdService.getHouseholdById(
      req.params.id,
      req.userId
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: household,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ajoute un membre à un foyer
 */
export const addMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: 'Non authentifié',
      });
      return;
    }

    const membership = await householdService.addMemberToHousehold(
      req.params.id,
      req.body.email,
      req.body.role || 'MEMBER',
      req.userId
    );

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      message: 'Membre ajouté avec succès',
      data: membership,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprime un membre d'un foyer
 */
export const removeMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: 'Non authentifié',
      });
      return;
    }

    await householdService.removeMemberFromHousehold(
      req.params.id,
      req.params.memberId,
      req.userId
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Membre supprimé avec succès',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Met à jour le mode de partage d'un foyer
 */
export const updateSharingMode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: 'Non authentifié',
      });
      return;
    }

    const household = await householdService.updateHouseholdSharingMode(
      req.params.id,
      req.body.sharingMode,
      req.userId
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Mode de partage mis à jour',
      data: household,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Promeut un MEMBER à ADMIN
 */
export const promoteMemberToAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: 'Non authentifié',
      });
      return;
    }

    const updated = await householdService.promoteMemberToAdmin(
      req.params.id,
      req.params.memberId,
      req.userId
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Membre promu administrateur',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rétrograde un ADMIN à MEMBER
 */
export const demoteAdminToMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: 'Non authentifié',
      });
      return;
    }

    const updated = await householdService.demoteAdminToMember(
      req.params.id,
      req.params.memberId,
      req.userId
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Administrateur rétrogradé en membre',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère les revenus mensuels et les ratios de partage calculés
 */
export const getIncomeAnalysis = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: 'Non authentifié',
      });
      return;
    }

    const { id: householdId } = req.params;
    const { year, month } = req.query;

    if (!year || !month) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'year et month sont requis',
      });
      return;
    }

    const incomeCalculationService = await import(
      '../services/incomeCalculation.service'
    );

    const incomes = await incomeCalculationService.getHouseholdMonthlyIncomes(
      householdId,
      Number(year),
      Number(month)
    );

    const ratios = await incomeCalculationService.calculateSharingRatios(
      householdId,
      Number(year),
      Number(month)
    );

    // Récupérer les infos des membres
    const members = await householdService.getHouseholdById(householdId, req.userId);

    const analysis = members.members.map((member) => ({
      userId: member.userId,
      name: `${member.user.firstName} ${member.user.lastName}`,
      email: member.user.email,
      salary: incomes[member.userId]?.toNumber() || 0,
      ratio: ratios[member.userId] || 0,
    }));

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: {
        month: `${year}-${String(month).padStart(2, '0')}`,
        members: analysis,
        totalIncome: Object.values(incomes).reduce((sum, val) => sum.plus(val)).toNumber(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère la configuration de partage proportionnel
 */
export const getSharingConfiguration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: 'Non authentifié',
      });
      return;
    }

    const { id: householdId } = req.params;

    const config = await (
      await import('../config/database')
    ).default.householdConfiguration.findUnique({
      where: { householdId },
    });

    if (!config) {
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        data: {
          householdId,
          autoAdjustRatios: true,
          ratioAdjustmentDay: 1,
          salaryCategoryId: null,
          proportionalAccounts: [],
        },
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Met à jour la configuration de partage proportionnel
 */
export const updateSharingConfiguration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: 'Non authentifié',
      });
      return;
    }

    const { id: householdId } = req.params;
    const { autoAdjustRatios, ratioAdjustmentDay, salaryCategoryId, proportionalAccounts } = req.body;

    const prisma = (await import('../config/database')).default;

    // Créer ou mettre à jour la configuration
    const config = await prisma.householdConfiguration.upsert({
      where: { householdId },
      update: {
        autoAdjustRatios: autoAdjustRatios ?? undefined,
        ratioAdjustmentDay: ratioAdjustmentDay ?? undefined,
        salaryCategoryId: salaryCategoryId ?? undefined,
        proportionalAccounts: proportionalAccounts ?? undefined,
      },
      create: {
        householdId,
        autoAdjustRatios: autoAdjustRatios ?? true,
        ratioAdjustmentDay: ratioAdjustmentDay ?? 1,
        salaryCategoryId: salaryCategoryId ?? null,
        proportionalAccounts: proportionalAccounts ?? [],
      },
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Configuration mise à jour',
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère l'historique des ratios de partage
 */
export const getSharingHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: 'Non authentifié',
      });
      return;
    }

    const { id: householdId } = req.params;
    const { limit } = req.query;

    const incomeCalculationService = await import(
      '../services/incomeCalculation.service'
    );

    const history = await incomeCalculationService.getSharingRatioHistory(
      householdId,
      Number(limit) || 24
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Applique les ratios de partage immédiatement (manuel)
 */
export const applySharingRatios = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: 'Non authentifié',
      });
      return;
    }

    const { id: householdId } = req.params;
    const { year, month } = req.body;

    if (!year || !month) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'year et month sont requis',
      });
      return;
    }

    const adjustSharingRatioJob = await import('../jobs/adjustSharingRatioJob');

    const result = await adjustSharingRatioJob.adjustSharingRatiosNow(
      householdId,
      Number(year),
      Number(month),
      req.userId
    );

    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: result.message,
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: result.message,
      data: result.ratios,
    });
  } catch (error) {
    next(error);
  }
};

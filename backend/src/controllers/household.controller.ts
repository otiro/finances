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

import { Request, Response, NextFunction } from 'express';
import * as accountService from '../services/account.service';
import { HTTP_STATUS } from '../utils/constants';

/**
 * Crée un nouveau compte
 */
export const createAccount = async (
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

    const account = await accountService.createAccount(req.userId, req.body);

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      message: 'Compte créé avec succès',
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère tous les comptes de l'utilisateur
 */
export const getUserAccounts = async (
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

    const accounts = await accountService.getUserAccounts(req.userId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère tous les comptes d'un foyer
 */
export const getHouseholdAccounts = async (
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

    const accounts = await accountService.getHouseholdAccounts(
      req.params.householdId,
      req.userId
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère un compte par ID
 */
export const getAccountById = async (
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

    const account = await accountService.getAccountById(req.params.id, req.userId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Met à jour un compte
 */
export const updateAccount = async (
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

    const account = await accountService.updateAccount(
      req.params.id,
      req.userId,
      req.body
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Compte mis à jour',
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprime un compte
 */
export const deleteAccount = async (
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

    await accountService.deleteAccount(req.params.id, req.userId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Compte supprimé',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère le solde d'un compte
 */
export const getAccountBalance = async (
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

    const balance = await accountService.getAccountBalance(
      req.params.id,
      req.userId
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: balance,
    });
  } catch (error) {
    next(error);
  }
};

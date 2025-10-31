import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../utils/constants';

/**
 * Inscription d'un nouvel utilisateur
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      message: SUCCESS_MESSAGES.USER_REGISTERED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Connexion d'un utilisateur
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer le profil de l'utilisateur connecté
 * GET /api/auth/me
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: 'Non autorisé',
      });
    }

    const user = await authService.getUserById(req.userId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Déconnexion (côté client, suppression du token)
 * POST /api/auth/logout
 */
export const logout = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // La déconnexion est gérée côté client en supprimant le token
    // On peut ajouter ici une logique de blacklist de tokens si nécessaire

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
    });
  } catch (error) {
    next(error);
  }
};

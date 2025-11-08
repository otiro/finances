import { Request, Response } from 'express';
import * as categoryService from '../services/category.service';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * GET /api/households/:householdId/categories
 * Récupère toutes les catégories disponibles (système + foyer)
 */
export const getAllAvailableCategories = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId } = req.params;

    const categories = await categoryService.getAllAvailableCategories(householdId, userId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: categories,
    });
  } catch (error: any) {
    const status = error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || ERROR_MESSAGES.INTERNAL_ERROR;

    res.status(status).json({
      status: 'error',
      message,
    });
  }
};

/**
 * GET /api/households/:householdId/categories/household
 * Récupère les catégories du foyer
 */
export const getHouseholdCategories = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId } = req.params;

    const categories = await categoryService.getHouseholdCategories(householdId, userId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: categories,
    });
  } catch (error: any) {
    const status = error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || ERROR_MESSAGES.INTERNAL_ERROR;

    res.status(status).json({
      status: 'error',
      message,
    });
  }
};

/**
 * GET /api/categories/system
 * Récupère les catégories système
 */
export const getSystemCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await categoryService.getSystemCategories();

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: categories,
    });
  } catch (error: any) {
    const status = error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || ERROR_MESSAGES.INTERNAL_ERROR;

    res.status(status).json({
      status: 'error',
      message,
    });
  }
};

/**
 * POST /api/households/:householdId/categories
 * Crée une nouvelle catégorie personnalisée
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId } = req.params;
    const { name, color, icon, isSalaryCategory } = req.body;

    if (!name) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'Le nom de la catégorie est requis',
      });
      return;
    }

    const category = await categoryService.createCategory(householdId, userId, {
      name,
      color,
      icon,
      isSalaryCategory,
    });

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      message: 'Catégorie créée avec succès',
      data: category,
    });
  } catch (error: any) {
    const status = error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || ERROR_MESSAGES.INTERNAL_ERROR;

    res.status(status).json({
      status: 'error',
      message,
    });
  }
};

/**
 * PATCH /api/households/:householdId/categories/:categoryId
 * Met à jour une catégorie
 */
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId, categoryId } = req.params;
    const { name, color, icon, isSalaryCategory } = req.body;

    const category = await categoryService.updateCategory(householdId, userId, categoryId, {
      name,
      color,
      icon,
      isSalaryCategory,
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Catégorie mise à jour avec succès',
      data: category,
    });
  } catch (error: any) {
    const status = error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || ERROR_MESSAGES.INTERNAL_ERROR;

    res.status(status).json({
      status: 'error',
      message,
    });
  }
};

/**
 * DELETE /api/households/:householdId/categories/:categoryId
 * Supprime une catégorie
 */
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId, categoryId } = req.params;

    await categoryService.deleteCategory(householdId, userId, categoryId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Catégorie supprimée avec succès',
    });
  } catch (error: any) {
    const status = error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || ERROR_MESSAGES.INTERNAL_ERROR;

    res.status(status).json({
      status: 'error',
      message,
    });
  }
};

/**
 * GET /api/households/:householdId/salary-category
 * Récupère la catégorie de salaire configurée pour le foyer
 */
export const getSalaryCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId } = req.params;

    const category = await categoryService.getSalaryCategoryForHousehold(householdId, userId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: category,
    });
  } catch (error: any) {
    const status = error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || ERROR_MESSAGES.INTERNAL_ERROR;

    res.status(status).json({
      status: 'error',
      message,
    });
  }
};

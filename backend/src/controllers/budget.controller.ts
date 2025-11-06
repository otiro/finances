import { Request, Response } from 'express';
import * as budgetService from '../services/budget.service';
import { createBudgetSchema, updateBudgetSchema } from '../utils/validators';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * GET /api/households/:householdId/budgets
 * Récupère tous les budgets d'un foyer
 */
export const getHouseholdBudgets = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId } = req.params;

    const budgets = await budgetService.getHouseholdBudgets(householdId, userId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: budgets,
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
 * GET /api/households/:householdId/budgets/summary
 * Récupère un résumé de tous les budgets avec leur statut
 */
export const getHouseholdBudgetsSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId } = req.params;

    const summary = await budgetService.getHouseholdBudgetsSummary(householdId, userId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: summary,
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
 * GET /api/households/:householdId/budgets/:budgetId
 * Récupère un budget spécifique avec son statut
 */
export const getBudgetById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId, budgetId } = req.params;

    const status = await budgetService.getBudgetStatus(budgetId, householdId, userId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: status,
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
 * GET /api/households/:householdId/budgets/:budgetId/alerts
 * Récupère les alertes d'un budget
 */
export const getBudgetAlerts = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId, budgetId } = req.params;

    const alerts = await budgetService.getBudgetAlerts(budgetId, householdId, userId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: alerts,
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
 * POST /api/households/:householdId/budgets
 * Crée un nouveau budget pour un foyer
 */
export const createBudget = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId } = req.params;
    const body = req.body;

    // Validation
    const validatedData = createBudgetSchema.parse(body);

    const budget = await budgetService.createBudget(
      householdId,
      userId,
      validatedData
    );

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      data: budget,
      message: 'Budget créé avec succès',
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'Données invalides',
        errors: error.errors,
      });
    }

    const status = error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || ERROR_MESSAGES.INTERNAL_ERROR;

    res.status(status).json({
      status: 'error',
      message,
    });
  }
};

/**
 * PATCH /api/households/:householdId/budgets/:budgetId
 * Met à jour un budget existant
 */
export const updateBudget = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId, budgetId } = req.params;
    const body = req.body;

    // Validation
    const validatedData = updateBudgetSchema.parse(body);

    const budget = await budgetService.updateBudget(
      budgetId,
      householdId,
      userId,
      validatedData
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: budget,
      message: 'Budget mis à jour avec succès',
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'Données invalides',
        errors: error.errors,
      });
    }

    const status = error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || ERROR_MESSAGES.INTERNAL_ERROR;

    res.status(status).json({
      status: 'error',
      message,
    });
  }
};

/**
 * DELETE /api/households/:householdId/budgets/:budgetId
 * Supprime un budget
 */
export const deleteBudget = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId, budgetId } = req.params;

    const result = await budgetService.deleteBudget(budgetId, householdId, userId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: result,
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

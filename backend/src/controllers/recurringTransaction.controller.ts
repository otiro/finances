import { Request, Response } from 'express';
import * as recurringTransactionService from '../services/recurringTransaction.service';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';
import { createRecurringPatternSchema, updateRecurringPatternSchema } from '../utils/validators';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * POST /api/households/:householdId/recurring-patterns
 * Crée un nouveau motif de transaction récurrente
 */
export const createRecurringPattern = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId } = req.params;

    // Valider les données
    const validationResult = createRecurringPatternSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: JSON.stringify(errors),
      });
    }

    const {
      accountId,
      name,
      description,
      frequency,
      type,
      amount,
      categoryId,
      startDate,
      endDate,
      dayOfMonth,
      dayOfWeek,
    } = validationResult.data;

    const pattern = await recurringTransactionService.createRecurringPattern(
      householdId,
      userId,
      {
        accountId,
        name,
        description,
        frequency,
        type,
        amount,
        categoryId: categoryId || undefined,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        dayOfMonth,
        dayOfWeek,
      }
    );

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      message: 'Motif récurrent créé avec succès',
      data: pattern,
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
 * GET /api/households/:householdId/recurring-patterns
 * Récupère les motifs récurrents d'un foyer
 */
export const getHouseholdRecurringPatterns = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId } = req.params;
    const { onlyActive } = req.query;

    const patterns = await recurringTransactionService.getHouseholdRecurringPatterns(
      householdId,
      userId,
      onlyActive === 'true'
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Motifs récurrents récupérés avec succès',
      data: patterns,
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
 * GET /api/households/:householdId/recurring-patterns/:patternId
 * Récupère un motif récurrent spécifique
 */
export const getRecurringPattern = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId, patternId } = req.params;

    const pattern = await recurringTransactionService.getRecurringPattern(
      patternId,
      householdId,
      userId
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Motif récurrent récupéré avec succès',
      data: pattern,
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
 * PATCH /api/households/:householdId/recurring-patterns/:patternId
 * Met à jour un motif récurrent
 */
export const updateRecurringPattern = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId, patternId } = req.params;

    // Valider les données
    const validationResult = updateRecurringPatternSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: JSON.stringify(errors),
      });
    }

    const data = validationResult.data;

    const updated = await recurringTransactionService.updateRecurringPattern(
      patternId,
      householdId,
      userId,
      {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.frequency && { frequency: data.frequency }),
        ...(data.type && { type: data.type }),
        ...(data.amount && { amount: data.amount }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.endDate !== undefined && {
          endDate: data.endDate ? new Date(data.endDate) : null,
        }),
        ...(data.dayOfMonth !== undefined && { dayOfMonth: data.dayOfMonth }),
        ...(data.dayOfWeek !== undefined && { dayOfWeek: data.dayOfWeek }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.isPaused !== undefined && { isPaused: data.isPaused }),
      }
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Motif récurrent mis à jour avec succès',
      data: updated,
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
 * DELETE /api/households/:householdId/recurring-patterns/:patternId
 * Supprime un motif récurrent
 */
export const deleteRecurringPattern = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId, patternId } = req.params;

    const result = await recurringTransactionService.deleteRecurringPattern(
      patternId,
      householdId,
      userId
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Motif récurrent supprimé avec succès',
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

/**
 * PATCH /api/households/:householdId/recurring-patterns/:patternId/pause
 * Pause ou reprend un motif récurrent
 */
export const togglePauseRecurringPattern = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId, patternId } = req.params;
    const { isPaused } = req.body;

    const updated = await recurringTransactionService.togglePauseRecurringPattern(
      patternId,
      householdId,
      userId,
      isPaused
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: isPaused ? 'Motif récurrent pausé' : 'Motif récurrent repris',
      data: updated,
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
 * GET /api/households/:householdId/recurring-patterns/:patternId/logs
 * Récupère l'historique de génération d'un motif
 */
export const getGenerationLogs = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId, patternId } = req.params;
    const { limit } = req.query;

    const logs = await recurringTransactionService.getGenerationLogs(
      patternId,
      householdId,
      userId,
      limit ? parseInt(limit as string) : 20
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Historique de génération récupéré avec succès',
      data: logs,
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
 * POST /api/recurring-patterns/generate
 * Génère les transactions récurrentes dues (pour le cron job)
 * Note: Cette route devrait être protégée avec une clé secrète ou un JWT admin
 */
export const generateDueRecurringTransactions = async (_req: Request, res: Response) => {
  try {
    const results = await recurringTransactionService.generateDueRecurringTransactions();

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Transactions récurrentes générées',
      data: {
        count: results.length,
        results,
      },
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

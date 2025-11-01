import { Request, Response } from 'express';
import * as transactionService from '../services/transaction.service';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * POST /api/accounts/:accountId/transactions
 * Crée une nouvelle transaction
 */
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { accountId } = req.params;
    const { amount, type, description, categoryId, transactionDate, notes } = req.body;

    const transaction = await transactionService.createTransaction(
      accountId,
      userId,
      {
        amount,
        type,
        description,
        categoryId,
        transactionDate,
        notes,
      }
    );

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      message: 'Transaction créée avec succès',
      data: transaction,
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
 * GET /api/accounts/:accountId/transactions
 * Récupère les transactions d'un compte
 */
export const getAccountTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { accountId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await transactionService.getAccountTransactions(
      accountId,
      userId,
      limit,
      offset
    );

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

/**
 * GET /api/accounts/:accountId/transactions/:transactionId
 * Récupère une transaction spécifique
 */
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { transactionId } = req.params;

    const transaction = await transactionService.getTransactionById(
      transactionId,
      userId
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: transaction,
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
 * PATCH /api/accounts/:accountId/transactions/:transactionId
 * Met à jour une transaction
 */
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { transactionId } = req.params;
    const { amount, type, description, categoryId, transactionDate, notes } = req.body;

    const transaction = await transactionService.updateTransaction(
      transactionId,
      userId,
      {
        amount,
        type,
        description,
        categoryId,
        transactionDate,
        notes,
      }
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Transaction mise à jour avec succès',
      data: transaction,
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
 * DELETE /api/accounts/:accountId/transactions/:transactionId
 * Supprime une transaction
 */
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { transactionId } = req.params;

    await transactionService.deleteTransaction(transactionId, userId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Transaction supprimée avec succès',
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
 * GET /api/households/:householdId/debts
 * Récupère les dettes d'un foyer
 */
export const getHouseholdDebts = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId } = req.params;

    const debts = await transactionService.calculateDebts(householdId, userId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: debts,
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

import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createTransactionSchema, updateTransactionSchema } from '../utils/validators';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

/**
 * POST /api/accounts/:accountId/transactions
 * Crée une nouvelle transaction
 */
router.post(
  '/:accountId/transactions',
  validate(createTransactionSchema),
  transactionController.createTransaction
);

/**
 * GET /api/accounts/:accountId/transactions
 * Récupère les transactions d'un compte
 */
router.get(
  '/:accountId/transactions',
  transactionController.getAccountTransactions
);

/**
 * GET /api/accounts/:accountId/transactions/:transactionId
 * Récupère une transaction spécifique
 */
router.get(
  '/:accountId/transactions/:transactionId',
  transactionController.getTransactionById
);

/**
 * PATCH /api/accounts/:accountId/transactions/:transactionId
 * Met à jour une transaction
 */
router.patch(
  '/:accountId/transactions/:transactionId',
  validate(updateTransactionSchema),
  transactionController.updateTransaction
);

/**
 * DELETE /api/accounts/:accountId/transactions/:transactionId
 * Supprime une transaction
 */
router.delete(
  '/:accountId/transactions/:transactionId',
  transactionController.deleteTransaction
);

export default router;

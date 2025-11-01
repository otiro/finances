import { Router } from 'express';
import * as recurringTransactionController from '../controllers/recurringTransaction.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createRecurringPatternSchema, updateRecurringPatternSchema } from '../utils/validators';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

/**
 * POST /api/households/:householdId/recurring-patterns
 * Crée un nouveau motif de transaction récurrente
 */
router.post(
  '/:householdId/recurring-patterns',
  validate(createRecurringPatternSchema),
  recurringTransactionController.createRecurringPattern
);

/**
 * GET /api/households/:householdId/recurring-patterns
 * Récupère les motifs récurrents d'un foyer
 */
router.get(
  '/:householdId/recurring-patterns',
  recurringTransactionController.getHouseholdRecurringPatterns
);

/**
 * GET /api/households/:householdId/recurring-patterns/:patternId
 * Récupère un motif récurrent spécifique
 */
router.get(
  '/:householdId/recurring-patterns/:patternId',
  recurringTransactionController.getRecurringPattern
);

/**
 * PATCH /api/households/:householdId/recurring-patterns/:patternId
 * Met à jour un motif récurrent
 */
router.patch(
  '/:householdId/recurring-patterns/:patternId',
  validate(updateRecurringPatternSchema),
  recurringTransactionController.updateRecurringPattern
);

/**
 * DELETE /api/households/:householdId/recurring-patterns/:patternId
 * Supprime un motif récurrent
 */
router.delete(
  '/:householdId/recurring-patterns/:patternId',
  recurringTransactionController.deleteRecurringPattern
);

/**
 * PATCH /api/households/:householdId/recurring-patterns/:patternId/pause
 * Pause ou reprend un motif récurrent
 */
router.patch(
  '/:householdId/recurring-patterns/:patternId/pause',
  recurringTransactionController.togglePauseRecurringPattern
);

/**
 * GET /api/households/:householdId/recurring-patterns/:patternId/logs
 * Récupère l'historique de génération d'un motif
 */
router.get(
  '/:householdId/recurring-patterns/:patternId/logs',
  recurringTransactionController.getGenerationLogs
);

export default router;

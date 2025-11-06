import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as budgetController from '../controllers/budget.controller';

const router = Router();

// Protéger toutes les routes avec l'authentification
router.use(authenticate);

/**
 * GET /api/households/:householdId/budgets
 * Récupère tous les budgets d'un foyer
 */
router.get('/:householdId/budgets', budgetController.getHouseholdBudgets);

/**
 * GET /api/households/:householdId/budgets/summary
 * Récupère un résumé des budgets avec statuts
 * DOIT être avant /:budgetId car sinon "summary" sera traité comme un budgetId
 */
router.get('/:householdId/budgets/summary', budgetController.getHouseholdBudgetsSummary);

/**
 * GET /api/households/:householdId/budgets/:budgetId/alerts
 * Récupère les alertes d'un budget
 * DOIT être avant /:budgetId seul car sinon "/alerts" sera traité comme un budgetId
 */
router.get('/:householdId/budgets/:budgetId/alerts', budgetController.getBudgetAlerts);

/**
 * GET /api/households/:householdId/budgets/:budgetId
 * Récupère un budget spécifique avec son statut
 */
router.get('/:householdId/budgets/:budgetId', budgetController.getBudgetById);

/**
 * POST /api/households/:householdId/budgets
 * Crée un nouveau budget pour un foyer
 */
router.post('/:householdId/budgets', budgetController.createBudget);

/**
 * PATCH /api/households/:householdId/budgets/:budgetId
 * Met à jour un budget existant
 */
router.patch('/:householdId/budgets/:budgetId', budgetController.updateBudget);

/**
 * DELETE /api/households/:householdId/budgets/:budgetId
 * Supprime un budget
 */
router.delete('/:householdId/budgets/:budgetId', budgetController.deleteBudget);

export default router;

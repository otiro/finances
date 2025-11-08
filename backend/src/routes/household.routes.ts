import { Router } from 'express';
import * as householdController from '../controllers/household.controller';
import * as transactionController from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createHouseholdSchema, addMemberSchema } from '../utils/validators';
import { z } from 'zod';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

/**
 * POST /api/households
 * Crée un nouveau foyer
 */
router.post(
  '/',
  validate(createHouseholdSchema),
  householdController.createHousehold
);

/**
 * GET /api/households
 * Récupère tous les foyers de l'utilisateur connecté
 */
router.get('/', householdController.getUserHouseholds);

/**
 * GET /api/households/:id
 * Récupère un foyer par ID
 */
router.get('/:id', householdController.getHouseholdById);

/**
 * POST /api/households/:id/members
 * Ajoute un membre à un foyer
 */
router.post(
  '/:id/members',
  validate(addMemberSchema),
  householdController.addMember
);

/**
 * DELETE /api/households/:id/members/:memberId
 * Supprime un membre d'un foyer
 */
router.delete('/:id/members/:memberId', householdController.removeMember);

/**
 * POST /api/households/:id/members/:memberId/promote
 * Promeut un MEMBER à ADMIN (nécessite que l'utilisateur soit ADMIN)
 */
router.post(
  '/:id/members/:memberId/promote',
  householdController.promoteMemberToAdmin
);

/**
 * POST /api/households/:id/members/:memberId/demote
 * Rétrograde un ADMIN à MEMBER (nécessite que l'utilisateur soit ADMIN)
 */
router.post(
  '/:id/members/:memberId/demote',
  householdController.demoteAdminToMember
);

/**
 * PATCH /api/households/:id/sharing-mode
 * Met à jour le mode de partage d'un foyer
 */
router.patch(
  '/:id/sharing-mode',
  validate(
    z.object({
      sharingMode: z.enum(['EQUAL', 'PROPORTIONAL', 'CUSTOM']),
    })
  ),
  householdController.updateSharingMode
);

/**
 * GET /api/households/:id/debts
 * Récupère les dettes d'un foyer
 */
router.get('/:id/debts', transactionController.getHouseholdDebts);

/**
 * PATCH /api/households/:id/balancing-records/:recordId/mark-paid
 * Marque une dette comme payée
 */
router.patch(
  '/:id/balancing-records/:recordId/mark-paid',
  transactionController.markDebtAsPaid
);

/**
 * GET /api/households/:id/income-analysis
 * Récupère l'analyse des revenus et les ratios de partage pour un mois
 */
router.get('/:id/income-analysis', householdController.getIncomeAnalysis);

/**
 * GET /api/households/:id/sharing-configuration
 * Récupère la configuration du partage proportionnel
 */
router.get('/:id/sharing-configuration', householdController.getSharingConfiguration);

/**
 * PATCH /api/households/:id/sharing-configuration
 * Met à jour la configuration du partage proportionnel
 */
router.patch(
  '/:id/sharing-configuration',
  householdController.updateSharingConfiguration
);

/**
 * GET /api/households/:id/sharing-history
 * Récupère l'historique des ratios de partage
 */
router.get('/:id/sharing-history', householdController.getSharingHistory);

/**
 * POST /api/households/:id/apply-sharing-ratios
 * Applique les ratios de partage immédiatement (manuel)
 */
router.post('/:id/apply-sharing-ratios', householdController.applySharingRatios);

/**
 * DELETE /api/households/:id
 * Supprime un foyer (DEV only - pour tests)
 */
router.delete('/:id', householdController.deleteHousehold);

export default router;

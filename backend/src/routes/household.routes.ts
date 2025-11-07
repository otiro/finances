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

export default router;

import { Router } from 'express';
import * as householdController from '../controllers/household.controller';
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

export default router;

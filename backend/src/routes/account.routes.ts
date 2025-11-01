import { Router } from 'express';
import * as accountController from '../controllers/account.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createAccountSchema, updateAccountSchema } from '../utils/validators';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

/**
 * POST /api/accounts
 * Crée un nouveau compte
 */
router.post('/', validate(createAccountSchema), accountController.createAccount);

/**
 * GET /api/accounts
 * Récupère tous les comptes de l'utilisateur
 */
router.get('/', accountController.getUserAccounts);

/**
 * GET /api/accounts/household/:householdId
 * Récupère tous les comptes d'un foyer
 */
router.get('/household/:householdId', accountController.getHouseholdAccounts);

/**
 * GET /api/accounts/:id
 * Récupère un compte par ID
 */
router.get('/:id', accountController.getAccountById);

/**
 * GET /api/accounts/:id/balance
 * Récupère le solde d'un compte
 */
router.get('/:id/balance', accountController.getAccountBalance);

/**
 * PATCH /api/accounts/:id
 * Met à jour un compte
 */
router.patch(
  '/:id',
  validate(updateAccountSchema),
  accountController.updateAccount
);

/**
 * DELETE /api/accounts/:id
 * Supprime un compte
 */
router.delete('/:id', accountController.deleteAccount);

/**
 * POST /api/accounts/:id/owners
 * Ajoute un propriétaire à un compte
 */
router.post('/:id/owners', accountController.addAccountOwner);

/**
 * DELETE /api/accounts/:id/owners/:ownerId
 * Retire un propriétaire d'un compte
 */
router.delete('/:id/owners/:ownerId', accountController.removeAccountOwner);

export default router;

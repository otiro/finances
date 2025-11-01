import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as categoryController from '../controllers/category.controller';

const router = Router();

// Protéger toutes les routes avec l'authentification
router.use(authenticateToken);

/**
 * GET /api/categories/system
 * Récupère les catégories système
 */
router.get('/system', categoryController.getSystemCategories);

/**
 * GET /api/households/:householdId/categories
 * Récupère toutes les catégories disponibles (système + foyer)
 */
router.get('/households/:householdId/categories', categoryController.getAllAvailableCategories);

/**
 * GET /api/households/:householdId/categories/household
 * Récupère les catégories du foyer
 */
router.get('/households/:householdId/categories/household', categoryController.getHouseholdCategories);

/**
 * POST /api/households/:householdId/categories
 * Crée une nouvelle catégorie personnalisée
 */
router.post('/households/:householdId/categories', categoryController.createCategory);

export default router;

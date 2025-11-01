import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as categoryController from '../controllers/category.controller';

const router = Router();

// Protéger toutes les routes avec l'authentification
router.use(authenticate);

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

/**
 * PATCH /api/households/:householdId/categories/:categoryId
 * Met à jour une catégorie
 */
router.patch('/households/:householdId/categories/:categoryId', categoryController.updateCategory);

/**
 * DELETE /api/households/:householdId/categories/:categoryId
 * Supprime une catégorie
 */
router.delete('/households/:householdId/categories/:categoryId', categoryController.deleteCategory);

export default router;

import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { registerSchema, loginSchema } from '../utils/validators';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Inscription d'un nouvel utilisateur
 * @access Public
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @route POST /api/auth/login
 * @desc Connexion d'un utilisateur
 * @access Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route GET /api/auth/me
 * @desc Récupérer le profil de l'utilisateur connecté
 * @access Private
 */
router.get('/me', authenticate, authController.getProfile);

/**
 * @route POST /api/auth/logout
 * @desc Déconnexion de l'utilisateur
 * @access Private
 */
router.post('/logout', authenticate, authController.logout);

export default router;

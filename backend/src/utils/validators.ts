import { z } from 'zod';

/**
 * Schéma de validation pour l'inscription
 */
export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  monthlyIncome: z.number().min(0, 'Le revenu mensuel doit être positif').optional(),
});

/**
 * Schéma de validation pour la connexion
 */
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

/**
 * Schéma de validation pour la mise à jour du profil
 */
export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  monthlyIncome: z.number().min(0).optional(),
  profilePictureUrl: z.string().url().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

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

/**
 * Schéma de validation pour la création d'un foyer
 */
export const createHouseholdSchema = z.object({
  name: z.string().min(1, 'Le nom du foyer est requis'),
  sharingMode: z.enum(['EQUAL', 'PROPORTIONAL', 'CUSTOM'], {
    errorMap: () => ({ message: 'Mode de partage invalide' }),
  }),
});

/**
 * Schéma de validation pour l'ajout d'un membre au foyer
 */
export const addMemberSchema = z.object({
  email: z.string().email('Email invalide'),
  role: z.enum(['ADMIN', 'MEMBER'], {
    errorMap: () => ({ message: 'Rôle invalide' }),
  }).optional().default('MEMBER'),
});

/**
 * Schéma de validation pour la création d'un compte
 */
export const createAccountSchema = z.object({
  name: z.string().min(1, 'Le nom du compte est requis'),
  type: z.enum(['CHECKING', 'JOINT', 'SAVINGS'], {
    errorMap: () => ({ message: 'Type de compte invalide' }),
  }),
  householdId: z.string().min(1, 'L\'identifiant du foyer est requis'),
  initialBalance: z.number().optional().default(0),
  ownerIds: z.array(z.string()).min(1, 'Au moins un propriétaire est requis'),
});

/**
 * Schéma de validation pour la mise à jour d'un compte
 */
export const updateAccountSchema = z.object({
  name: z.string().min(1).optional(),
  initialBalance: z.number().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateHouseholdInput = z.infer<typeof createHouseholdSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

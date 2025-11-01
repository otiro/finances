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

/**
 * Schéma de validation pour la création d'une transaction
 */
export const createTransactionSchema = z.object({
  amount: z.number().positive('Le montant doit être positif').max(999999.99, 'Montant maximal dépassé'),
  type: z.enum(['DEBIT', 'CREDIT'], {
    errorMap: () => ({ message: 'Type de transaction invalide' }),
  }),
  description: z.string().min(1, 'La description est requise').max(500),
  categoryId: z.string().optional(),
  transactionDate: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
});

/**
 * Schéma de validation pour la mise à jour d'une transaction
 */
export const updateTransactionSchema = z.object({
  amount: z.number().positive().max(999999.99).optional(),
  type: z.enum(['DEBIT', 'CREDIT']).optional(),
  description: z.string().min(1).max(500).optional(),
  categoryId: z.string().optional(),
  transactionDate: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
}).strict();

export type RegisterInput = z.infer<typeof registerSchema>;
/**
 * Schéma de validation pour la création d'un motif de transaction récurrente
 */
export const createRecurringPatternSchema = z.object({
  accountId: z.string().min(1, 'L\'ID du compte est requis'),
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'], {
    errorMap: () => ({ message: 'Fréquence invalide' }),
  }),
  type: z.enum(['DEBIT', 'CREDIT'], {
    errorMap: () => ({ message: 'Type de transaction invalide' }),
  }),
  amount: z.number().positive('Le montant doit être positif'),
  categoryId: z.string().optional().nullable(),
  startDate: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    'Date de début invalide'
  ),
  endDate: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    'Date de fin invalide'
  ).optional().nullable(),
  dayOfMonth: z.number().min(1).max(31).optional().nullable(),
  dayOfWeek: z.number().min(0).max(6).optional().nullable(),
});

/**
 * Schéma de validation pour la mise à jour d'un motif de transaction récurrente
 */
export const updateRecurringPatternSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
  type: z.enum(['DEBIT', 'CREDIT']).optional(),
  amount: z.number().positive().optional(),
  categoryId: z.string().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  dayOfMonth: z.number().min(1).max(31).optional().nullable(),
  dayOfWeek: z.number().min(0).max(6).optional().nullable(),
  isActive: z.boolean().optional(),
  isPaused: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateHouseholdInput = z.infer<typeof createHouseholdSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type CreateRecurringPatternInput = z.infer<typeof createRecurringPatternSchema>;
export type UpdateRecurringPatternInput = z.infer<typeof updateRecurringPatternSchema>;

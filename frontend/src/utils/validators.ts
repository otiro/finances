import { z } from 'zod';

/**
 * Schema de validation pour la création d'un budget
 */
export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, 'La catégorie est requise'),
  name: z.string().min(1, 'Le nom du budget est requis').max(255),
  description: z.string().max(1000).optional(),
  amount: z.number().positive('Le montant doit être positif').max(999999.99, 'Montant maximal dépassé'),
  period: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY'] as const, {
    errorMap: () => ({ message: 'Période invalide' }),
  }).default('MONTHLY'),
  startDate: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    'Date de début invalide'
  ),
  endDate: z.string().refine(
    (val) => val === '' || !isNaN(Date.parse(val)),
    'Date de fin invalide'
  ).optional().nullable(),
  alertThreshold: z.number().min(0).max(100, 'Seuil d\'alerte entre 0 et 100').default(80),
  alertEnabled: z.boolean().default(true),
});

/**
 * Schema de validation pour la mise à jour d'un budget
 */
export const updateBudgetSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  amount: z.number().positive().max(999999.99).optional(),
  period: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY'] as const).optional(),
  endDate: z.string().datetime().optional().nullable(),
  alertThreshold: z.number().min(0).max(100).optional(),
  alertEnabled: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

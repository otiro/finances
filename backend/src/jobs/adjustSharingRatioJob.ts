import prisma from '../config/database';
import * as incomeCalculationService from '../services/incomeCalculation.service';
import * as householdService from '../services/household.service';

/**
 * Tâche cron: Ajuste les ratios de partage pour les foyers en PROPORTIONAL
 * S'exécute quotidiennement et vérifie si c'est le jour d'ajustement configuré
 *
 * Logique:
 * 1. Récupère tous les foyers avec configuration
 * 2. Pour chaque foyer: vérifie si c'est le jour d'ajustement
 * 3. Si oui: calcule les nouveaux ratios basés sur les revenus du mois précédent
 * 4. Applique les ratios aux comptes configurés
 * 5. Enregistre l'historique
 */
export const adjustSharingRatiosJob = async (): Promise<void> => {
  console.log('[SharingRatioJob] Starting sharing ratio adjustment...');

  try {
    // Récupérer la date actuelle
    const now = new Date();
    const today = now.getDate();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    // Récupérer tous les foyers avec configuration
    const configurations = await prisma.householdConfiguration.findMany({
      where: {
        autoAdjustRatios: true,
      },
      include: {
        household: {
          select: {
            id: true,
            sharingMode: true,
          },
        },
      },
    });

    console.log(
      `[SharingRatioJob] Found ${configurations.length} households with auto-adjust enabled`
    );

    for (const config of configurations) {
      try {
        // Vérifie si c'est le jour d'ajustement
        if (today !== config.ratioAdjustmentDay) {
          continue; // Pas le bon jour, passer au suivant
        }

        const householdId = config.household.id;

        // Vérifier que le foyer est en mode PROPORTIONAL
        if (config.household.sharingMode !== 'PROPORTIONAL') {
          console.log(
            `[SharingRatioJob] Household ${householdId} is not in PROPORTIONAL mode, skipping`
          );
          continue;
        }

        // Déterminer le mois à calculer (mois précédent)
        let calcMonth = currentMonth - 1;
        let calcYear = currentYear;

        if (calcMonth === 0) {
          calcMonth = 12;
          calcYear = currentYear - 1;
        }

        console.log(
          `[SharingRatioJob] Processing household ${householdId} for ${calcYear}-${String(calcMonth).padStart(2, '0')}`
        );

        // Calculer les nouveaux ratios
        const ratios = await incomeCalculationService.calculateSharingRatios(
          householdId,
          calcYear,
          calcMonth,
          config.salaryCategoryId || undefined
        );

        // Récupérer les revenus pour l'historique
        const incomes = await incomeCalculationService.getHouseholdMonthlyIncomes(
          householdId,
          calcYear,
          calcMonth,
          config.salaryCategoryId || undefined
        );

        // Calculer le revenu total
        const totalIncome = Object.values(incomes).reduce((sum, income) => {
          return sum.plus(income);
        }, new (require('decimal.js') as any)(0));

        // Obtenir les comptes proportionnels
        const accountIds = config.proportionalAccounts || [];

        if (accountIds.length === 0) {
          console.log(
            `[SharingRatioJob] No proportional accounts configured for household ${householdId}`
          );
          continue;
        }

        // Appliquer les ratios aux comptes
        for (const accountId of accountIds) {
          try {
            await incomeCalculationService.applyRatiosToAccount(accountId, ratios);
            console.log(
              `[SharingRatioJob] Applied ratios to account ${accountId}`
            );
          } catch (err) {
            console.error(
              `[SharingRatioJob] Error applying ratios to account ${accountId}:`,
              err
            );
          }
        }

        // Enregistrer l'historique
        await incomeCalculationService.recordSharingRatioHistory(
          householdId,
          calcYear,
          calcMonth,
          ratios,
          incomes,
          totalIncome,
          undefined, // accountId = null (foyer-wide)
          'SYSTEM' // appliedBy
        );

        console.log(
          `[SharingRatioJob] Successfully processed household ${householdId}`
        );
      } catch (err) {
        console.error(
          `[SharingRatioJob] Error processing household ${config.household.id}:`,
          err
        );
      }
    }

    console.log('[SharingRatioJob] Sharing ratio adjustment completed');
  } catch (err) {
    console.error('[SharingRatioJob] Fatal error:', err);
  }
};

/**
 * Version manuelle: ajuste les ratios immédiatement pour un foyer
 * Utilisée quand l'admin clique sur "Appliquer maintenant"
 */
export const adjustSharingRatiosNow = async (
  householdId: string,
  year: number,
  month: number,
  userId?: string
): Promise<{
  success: boolean;
  message: string;
  ratios?: Record<string, number>;
}> => {
  try {
    // Récupérer la configuration du foyer
    const config = await prisma.householdConfiguration.findUnique({
      where: { householdId },
    });

    if (!config) {
      return {
        success: false,
        message: 'Configuration de partage non trouvée pour ce foyer',
      };
    }

    // Vérifier que le foyer est en mode PROPORTIONAL
    const household = await prisma.household.findUnique({
      where: { id: householdId },
    });

    if (household?.sharingMode !== 'PROPORTIONAL') {
      return {
        success: false,
        message: 'Ce foyer n\'est pas en mode de partage proportionnel',
      };
    }

    // Calculer les nouveaux ratios
    const ratios = await incomeCalculationService.calculateSharingRatios(
      householdId,
      year,
      month,
      config.salaryCategoryId || undefined
    );

    // Récupérer les revenus
    const incomes = await incomeCalculationService.getHouseholdMonthlyIncomes(
      householdId,
      year,
      month,
      config.salaryCategoryId || undefined
    );

    // Calculer le revenu total
    const totalIncome = Object.values(incomes).reduce((sum, income) => {
      return sum.plus(income);
    }, new (require('decimal.js') as any)(0));

    // Appliquer les ratios aux comptes configurés
    const accountIds = config.proportionalAccounts || [];

    for (const accountId of accountIds) {
      await incomeCalculationService.applyRatiosToAccount(accountId, ratios);
    }

    // Enregistrer l'historique
    await incomeCalculationService.recordSharingRatioHistory(
      householdId,
      year,
      month,
      ratios,
      incomes,
      totalIncome,
      undefined, // accountId = null (foyer-wide)
      userId // appliedBy = user who triggered it
    );

    return {
      success: true,
      message: `Ratios appliqués avec succès pour ${year}-${String(month).padStart(2, '0')}`,
      ratios,
    };
  } catch (err: any) {
    console.error('Error in adjustSharingRatiosNow:', err);
    return {
      success: false,
      message: `Erreur lors de l'application des ratios: ${err.message}`,
    };
  }
};

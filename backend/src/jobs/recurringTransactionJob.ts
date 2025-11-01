import { logger } from '../utils/logger';
import * as recurringTransactionService from '../services/recurringTransaction.service';

/**
 * Calcule le délai jusqu'à la prochaine exécution à une heure donnée
 */
const getDelayUntilNextRun = (hour: number, minute: number = 0): number => {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);

  // Si l'heure est déjà passée aujourd'hui, attendre jusqu'à demain
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next.getTime() - now.getTime();
};

/**
 * Cron job pour générer les transactions récurrentes dues
 * S'exécute quotidiennement à 00:00 (minuit) UTC
 * Utilise setInterval plutôt que node-cron pour éviter les dépendances externes
 */
export const startRecurringTransactionCronJob = (): NodeJS.Timer => {
  const executeJob = async () => {
    logger.info('[Cron Job] Starting recurring transaction generation...');

    try {
      const results = await recurringTransactionService.generateDueRecurringTransactions();

      const successCount = results.filter((r) => r.status === 'success').length;
      const failedCount = results.filter((r) => r.status === 'failed').length;

      logger.info(`[Cron Job] Recurring transaction generation completed`);
      logger.info(`  - Success: ${successCount}`);
      logger.info(`  - Failed: ${failedCount}`);
      logger.info(`  - Total: ${results.length}`);

      if (failedCount > 0) {
        logger.warn(`[Cron Job] ${failedCount} transaction(s) failed to generate`);
        results
          .filter((r) => r.status === 'failed')
          .forEach((r) => {
            logger.warn(`  - Pattern ${r.patternId}: ${r.error}`);
          });
      }
    } catch (error) {
      logger.error('[Cron Job] Error generating recurring transactions: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Exécuter au démarrage
  executeJob();

  // Puis exécuter tous les jours à 00:00
  const firstDelay = getDelayUntilNextRun(0, 0);
  setTimeout(() => {
    executeJob();
    // Après la première exécution, exécuter toutes les 24 heures
    setInterval(executeJob, 24 * 60 * 60 * 1000);
  }, firstDelay);

  // Retourner un handle pour pouvoir arrêter si nécessaire
  return setInterval(() => {
    // Cet interval est juste un placeholder retourné pour permettre clearInterval si needed
  }, 24 * 60 * 60 * 1000);
};

/**
 * Alternative: Exécuter à des intervalles plus fréquents (test/développement)
 * S'exécute toutes les heures
 */
export const startRecurringTransactionCronJobHourly = (): NodeJS.Timer => {
  const executeJob = async () => {
    logger.info('[Cron Job - Hourly] Starting recurring transaction generation...');

    try {
      const results = await recurringTransactionService.generateDueRecurringTransactions();

      const successCount = results.filter((r) => r.status === 'success').length;
      const failedCount = results.filter((r) => r.status === 'failed').length;

      logger.info(`[Cron Job - Hourly] Generation completed`);
      logger.info(`  - Success: ${successCount}`);
      logger.info(`  - Failed: ${failedCount}`);
    } catch (error) {
      logger.error('[Cron Job - Hourly] Error: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Exécuter au démarrage
  executeJob();

  // Puis exécuter toutes les heures
  return setInterval(executeJob, 60 * 60 * 1000);
};

/**
 * Alternative: Exécuter à des intervalles très fréquents (développement/test)
 * S'exécute toutes les 5 minutes
 */
export const startRecurringTransactionCronJobDevelopment = (): NodeJS.Timer => {
  const executeJob = async () => {
    logger.info('[Cron Job - Dev] Starting recurring transaction generation...');

    try {
      const results = await recurringTransactionService.generateDueRecurringTransactions();

      const successCount = results.filter((r) => r.status === 'success').length;

      if (successCount > 0) {
        logger.info(`[Cron Job - Dev] Generated ${successCount} transaction(s)`);
      }
    } catch (error) {
      logger.error('[Cron Job - Dev] Error: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Exécuter au démarrage
  executeJob();

  // Puis exécuter toutes les 5 minutes
  return setInterval(executeJob, 5 * 60 * 1000);
};

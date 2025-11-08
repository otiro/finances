import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';

const router = Router();

// Analytics endpoints
// GET /api/households/:householdId/analytics/breakdown
router.get('/:householdId/analytics/breakdown', analyticsController.getCategoryBreakdown);

// GET /api/households/:householdId/analytics/monthly
router.get('/:householdId/analytics/monthly', analyticsController.getMonthlySpendings);

// GET /api/households/:householdId/analytics/trends/:categoryId
router.get('/:householdId/analytics/trends/:categoryId', analyticsController.getCategoryTrends);

// GET /api/households/:householdId/analytics/compare
router.get('/:householdId/analytics/compare', analyticsController.comparePeriods);

// GET /api/households/:householdId/analytics/snapshot/:period
router.get('/:householdId/analytics/snapshot/:period', analyticsController.getSnapshot);

// GET /api/households/:householdId/analytics/snapshots
router.get('/:householdId/analytics/snapshots', analyticsController.getSnapshots);

// GET /api/households/:householdId/analytics/projections
router.get('/:householdId/analytics/projections', analyticsController.getProjections);

// GET /api/households/:householdId/analytics/anomalies
router.get('/:householdId/analytics/anomalies', analyticsController.getAnomalies);

// GET /api/households/:householdId/analytics/suggestions/budgets
router.get('/:householdId/analytics/suggestions/budgets', analyticsController.getBudgetSuggestions);

// Report endpoints
// POST /api/households/:householdId/reports/generate
router.post('/:householdId/reports/generate', analyticsController.generateReport);

// GET /api/households/:householdId/reports/history
router.get('/:householdId/reports/history', analyticsController.getReportHistory);

export default router;

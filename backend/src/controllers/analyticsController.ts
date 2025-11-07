import { Request, Response } from 'express';
import * as analyticsService from '@/services/analyticsService';
import * as reportService from '@/services/reportService';
import * as projectionService from '@/services/projectionService';
import { HTTP_STATUS } from '../utils/constants';

// Helper to validate household access
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const validateHouseholdAccess = async (_userId: string, _householdId: string) => {
  // This is a simplified check - adjust based on your actual household service
  // For now, we assume authorization is handled by the middleware
  return true;
};

/**
 * GET /api/households/:householdId/analytics/breakdown
 * Get category breakdown for current period
 */
export const getCategoryBreakdown = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { householdId } = req.params;
    const { type } = req.query as { type?: 'INCOME' | 'EXPENSE' };

    // Validate access
    const hasAccess = await validateHouseholdAccess(userId, householdId);
    if (!hasAccess) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        status: 'error',
        message: 'Access denied to this household',
      });
      return;
    }

    const breakdown = await analyticsService.getCategoryBreakdown(householdId, type);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: breakdown,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
    });
  }
};

/**
 * GET /api/households/:householdId/analytics/monthly
 * Get monthly income and expense totals
 */
export const getMonthlySpendings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { householdId } = req.params;
    const { months } = req.query as { months?: string };

    // Validate access
    const hasAccess = await validateHouseholdAccess(userId, householdId);
    if (!hasAccess) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        status: 'error',
        message: 'Access denied to this household',
      });
      return;
    }

    const monthsCount = months ? parseInt(months, 10) : 12;
    const spendings = await analyticsService.getMonthlySpendings(householdId, monthsCount);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: spendings,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
    });
  }
};

/**
 * GET /api/households/:householdId/analytics/trends/:categoryId
 * Get spending trends for a category
 */
export const getCategoryTrends = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { householdId, categoryId } = req.params;
    const { months } = req.query as { months?: string };

    // Validate access
    const hasAccess = await validateHouseholdAccess(userId, householdId);
    if (!hasAccess) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        status: 'error',
        message: 'Access denied to this household',
      });
      return;
    }

    const monthsCount = months ? parseInt(months, 10) : 12;
    const trends = await analyticsService.getCategoryTrends(householdId, categoryId, monthsCount);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: trends,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
    });
  }
};

/**
 * GET /api/households/:householdId/analytics/compare
 * Compare spending between two periods
 */
export const comparePeriods = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { householdId } = req.params;
    const { startDate1, endDate1, startDate2, endDate2 } = req.query as Record<string, string>;

    // Validate access
    const hasAccess = await validateHouseholdAccess(userId, householdId);
    if (!hasAccess) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        status: 'error',
        message: 'Access denied to this household',
      });
      return;
    }

    if (!startDate1 || !endDate1 || !startDate2 || !endDate2) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'Missing required date parameters',
      });
      return;
    }

    const comparison = await analyticsService.comparePeriods(
      householdId,
      new Date(startDate1),
      new Date(endDate1),
      new Date(startDate2),
      new Date(endDate2)
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: comparison,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
    });
  }
};

/**
 * GET /api/households/:householdId/analytics/snapshot/:period
 * Get or generate snapshot for a period
 */
export const getSnapshot = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { householdId, period } = req.params;

    // Validate access
    const hasAccess = await validateHouseholdAccess(userId, householdId);
    if (!hasAccess) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        status: 'error',
        message: 'Access denied to this household',
      });
      return;
    }

    // Parse period (YYYY-MM format)
    const [year, month] = period.split('-').map(Number);
    if (!year || !month || month < 1 || month > 12) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'Invalid period format. Use YYYY-MM',
      });
      return;
    }

    const snapshot = await analyticsService.generateSnapshot(householdId, year, month, 'MONTHLY');

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: snapshot,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
    });
  }
};

/**
 * GET /api/households/:householdId/analytics/snapshots
 * Get snapshot history
 */
export const getSnapshots = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { householdId } = req.params;
    const { limit } = req.query as { limit?: string };

    // Validate access
    const hasAccess = await validateHouseholdAccess(userId, householdId);
    if (!hasAccess) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        status: 'error',
        message: 'Access denied to this household',
      });
      return;
    }

    const limitCount = limit ? parseInt(limit, 10) : 12;
    const snapshots = await analyticsService.getSnapshotHistory(householdId, limitCount);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: snapshots,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
    });
  }
};

/**
 * GET /api/households/:householdId/analytics/projections
 * Get expense projections
 */
export const getProjections = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { householdId } = req.params;
    const { months } = req.query as { months?: string };

    // Validate access
    const hasAccess = await validateHouseholdAccess(userId, householdId);
    if (!hasAccess) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        status: 'error',
        message: 'Access denied to this household',
      });
      return;
    }

    const monthsCount = months ? parseInt(months, 10) : 6;
    const projections = await projectionService.projectExpenses(householdId, monthsCount);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: projections,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
    });
  }
};

/**
 * GET /api/households/:householdId/analytics/anomalies
 * Detect spending anomalies
 */
export const getAnomalies = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { householdId } = req.params;
    const { sensitivity } = req.query as { sensitivity?: 'low' | 'medium' | 'high' };

    // Validate access
    const hasAccess = await validateHouseholdAccess(userId, householdId);
    if (!hasAccess) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        status: 'error',
        message: 'Access denied to this household',
      });
      return;
    }

    const sens = sensitivity || 'medium';
    const anomalies = await projectionService.detectAnomalies(householdId, sens);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: anomalies,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
    });
  }
};

/**
 * GET /api/households/:householdId/analytics/suggestions/budgets
 * Get budget suggestions based on spending patterns
 */
export const getBudgetSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { householdId } = req.params;

    // Validate access
    const hasAccess = await validateHouseholdAccess(userId, householdId);
    if (!hasAccess) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        status: 'error',
        message: 'Access denied to this household',
      });
      return;
    }

    const suggestions = await projectionService.suggestBudgets(householdId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: suggestions,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
    });
  }
};

/**
 * POST /api/households/:householdId/reports/generate
 * Generate a report for export
 */
export const generateReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { householdId } = req.params;
    const { startDate, endDate, format } = req.body as {
      startDate: string;
      endDate: string;
      format: 'PDF' | 'CSV' | 'XLSX' | 'JSON' | 'TEXT';
    };

    // Validate access
    const hasAccess = await validateHouseholdAccess(userId, householdId);
    if (!hasAccess) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        status: 'error',
        message: 'Access denied to this household',
      });
      return;
    }

    if (!startDate || !endDate || !format) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'Missing required fields: startDate, endDate, format',
      });
      return;
    }

    const reportData = await reportService.prepareReportData(householdId, new Date(startDate), new Date(endDate));

    let content: string;
    let mimeType: string;
    let fileExtension: string;

    switch (format) {
      case 'CSV':
        content = reportService.formatAsCSV(reportData);
        mimeType = 'text/csv';
        fileExtension = 'csv';
        break;
      case 'JSON':
        content = reportService.formatAsJSON(reportData);
        mimeType = 'application/json';
        fileExtension = 'json';
        break;
      case 'TEXT':
        content = reportService.formatAsText(reportData);
        mimeType = 'text/plain';
        fileExtension = 'txt';
        break;
      case 'PDF':
        // For now, return a message that PDF requires additional setup
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: 'error',
          message: 'PDF export requires additional configuration',
          supportedFormats: ['CSV', 'JSON', 'TEXT'],
        });
        return;
      case 'XLSX':
        // For now, return a message that XLSX requires additional setup
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: 'error',
          message: 'XLSX export requires additional configuration',
          supportedFormats: ['CSV', 'JSON', 'TEXT'],
        });
        return;
      default:
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: 'error',
          message: `Unsupported format: ${format}`,
          supportedFormats: ['CSV', 'JSON', 'TEXT'],
        });
        return;
    }

    // Log the export (only for supported formats)
    const fileName = `report_${householdId}_${Date.now()}.${fileExtension}`;
    const fileSize = Buffer.byteLength(content, 'utf-8');

    // Only log formats that are supported by the service
    if (format === 'PDF' || format === 'CSV' || format === 'XLSX') {
      await reportService.logExport(householdId, userId, format, new Date(startDate), new Date(endDate), fileName, fileSize);
    }

    // Set response headers for download
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', fileSize);

    res.status(HTTP_STATUS.OK).send(content);
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
    });
  }
};

/**
 * GET /api/households/:householdId/reports/history
 * Get report export history
 */
export const getReportHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { householdId } = req.params;
    const { limit } = req.query as { limit?: string };

    // Validate access
    const hasAccess = await validateHouseholdAccess(userId, householdId);
    if (!hasAccess) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        status: 'error',
        message: 'Access denied to this household',
      });
      return;
    }

    const limitCount = limit ? parseInt(limit, 10) : 20;
    const history = await reportService.getExportHistory(householdId, limitCount);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: history,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: error.message,
    });
  }
};

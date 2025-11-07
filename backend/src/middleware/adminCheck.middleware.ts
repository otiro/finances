import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';

/**
 * Middleware to check if user is ADMIN in the specified household
 * Household ID should be in req.params.householdId or req.params.id
 *
 * Usage: router.patch('/:id/members/:memberId/promote', requireHouseholdAdmin, controller)
 */
export const requireHouseholdAdmin = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const householdId = req.params.householdId || req.params.id;

    if (!userId || !householdId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Missing user or household ID',
      });
    }

    // Check if user is member of this household with ADMIN role
    const userHousehold = await prisma.userHousehold.findUnique({
      where: {
        userId_householdId: {
          userId: userId,
          householdId: householdId,
        },
      },
    });

    if (!userHousehold) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: ERROR_MESSAGES.FORBIDDEN,
      });
    }

    if (userHousehold.role !== 'ADMIN') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: 'You must be an admin to perform this action',
      });
    }

    // Attach household info to request for later use
    (req as any).householdId = householdId;
    (req as any).userHouseholdRole = userHousehold.role;

    next();
  } catch (error) {
    console.error('Admin check middleware error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

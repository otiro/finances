import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from './error.middleware';
import { HTTP_STATUS } from '../utils/constants';

/**
 * Middleware de validation avec Zod
 */
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        next(
          new AppError(
            JSON.stringify(errorMessages),
            HTTP_STATUS.BAD_REQUEST
          )
        );
      } else {
        next(error);
      }
    }
  };
};

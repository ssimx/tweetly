import { ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorResponse } from 'tweetly-shared';

// Middleware, will always be called if there's 4th argument passed (error)
export const errorHandler = (err: Error | AppError | ZodError, req: Request, res: Response, next: NextFunction): void => {
    console.error(err);

    // Check for Zod validation error
    if (err instanceof ZodError) {
        const errorResponse: ErrorResponse = {
            success: false,
            error: {
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: err.issues,
            },
        };

        res.status(400).json(errorResponse);
    }

    // Default responses
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err.message || 'Internal Server Error';
    const code = err instanceof AppError ? err.code ? err.code : 'INTERNAL_ERROR' : 'INTERNAL_ERROR';

    const errorResponse: ErrorResponse = {
        success: false,
        error: {
            message,
            code,
        },
    };

    res.status(statusCode).json(errorResponse);
};
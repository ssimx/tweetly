import { Request, Response, NextFunction } from 'express';

// Custom error class for error handling
export class AppError extends Error {

    // When new AppError(...) is called, use this constructor to initialize a new instance/object
    constructor(public message: string, public statusCode: number, public code?: string) {
        // super calls the constructor of the Error class
        // passes the message argument to the Error constructor, which sets the
        //      message property of the Error object
        super(message);
        this.code = code;

        // Subclass (AppError) does not automatically inherit the correct prototype chain in some environments
        // Ensure the prototype of the instance is explicitly set to the AppError class to maintain prototype chain
        Object.setPrototypeOf(this, new.target.prototype);
    }
};

// Middleware, will always be called if there's 4th argument passed (error)
export const errorHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    // Default responses
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err.message || 'Internal Server Error';
    const code = err instanceof AppError ? err.code : 'INTERNAL_ERROR';

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            code,
        }
    });
};
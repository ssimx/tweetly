import { ZodError, ZodIssue } from 'zod';

// Custom error class for error handling
export class AppError extends Error {

    // When new AppError(...) is called, use this constructor to initialize a new instance/object
    constructor(public message: string, public statusCode: number, public code?: string, public details?: ZodIssue[]) {
        // super calls the constructor of the Error class
        // passes the message argument to the Error constructor, which sets the
        //      message property of the Error object
        super(message);
        this.code = code;
        this.details = details;

        // Subclass (AppError) does not automatically inherit the correct prototype chain in some environments
        // Ensure the prototype of the instance is explicitly set to the AppError class to maintain prototype chain
        Object.setPrototypeOf(this, new.target.prototype);
    }
};

// Type for successful response
export type SuccessResponse<T> = {
    success: true;
    data: T;
};

// Type for failed response
export type ErrorResponse = {
    success: false;
    error: {
        message: string;
        code: string;
        details?: ZodIssue[];
    };
};

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// Type for successful new post response
export type SuccessfulNewPostResponseType = {
    post: {
        id: number;
        author: {
            id: number;
            username: string;
        };
    }
};

// Type for successful register response
export type SuccessfulRegisterResponseType = {
    token: string
};

// Type for successful login response
export type SuccessfulLoginResponseType = {
    token: string
};
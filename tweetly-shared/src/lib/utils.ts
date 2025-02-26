import { z } from 'zod';

export function getAge(date: string) {
    const birthDate = new Date(date);
    const now = new Date();

    let age = now.getFullYear() - birthDate.getFullYear();

    // Adjust age if birthday hasn't occurred this year yet
    if (now.getMonth() < birthDate.getMonth() ||
        (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

// Check if error is ZodError
//  - checking for z.ZodError currently returns false in turbo monorepo
export function isZodError(error: unknown): error is z.ZodError {
    if (!(error instanceof Error)) return false

    if (error instanceof z.ZodError) return true
    if (error.constructor.name === "ZodError") return true
    if ("issues" in error && error.issues instanceof Array) return true

    return false
};

// Helper function to handle errors
export function getErrorMessage(error: unknown): string {

    // error is new Error
    if (error instanceof Error) {
        return error.message;
    }

    // error is object with property message or error
    if (typeof error === 'object' && error !== null) {
        // assert error as an object with string keys and unknown values
        // first check for message key presence, if undefined check for error key, if undefined return "Internal Server Error"
        return String((error as Record<string, unknown>)?.message || (error as Record<string, unknown>)?.error || 'Internal Server Error');
    }

    // error is just a string
    if (typeof error === 'string') {
        return error;
    }

    // anything else is unknown
    return 'Internal Server Error';
};
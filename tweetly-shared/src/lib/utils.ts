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


export function isZodError(error: unknown): error is z.ZodError {
    if (!(error instanceof Error)) return false

    if (error instanceof z.ZodError) return true
    if (error.constructor.name === "ZodError") return true
    if ("issues" in error && error.issues instanceof Array) return true

    return false
};
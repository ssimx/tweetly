import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper function to handle errors
export function getErrorMessage (error: unknown): string {

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

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
};

export function formatPostDate(date: string | number) {
    const postDate = new Date(date);
    const now = new Date();
    const hoursDiff = Math.abs(now.getTime() - postDate.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 1) {
        const min = Math.floor(Math.abs(now.getTime() - postDate.getTime()) / (1000 * 60));
        if (min === 0) return 'now';
        return `${min}m`
    }
    if (hoursDiff < 24) {
        return `${Math.floor(hoursDiff)}h`;
    } else {
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return postDate.toLocaleDateString('en-US', options);
    }
};

export function formatDate(date: string) {
    const postDate = new Date(date);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: "numeric" };
    return postDate.toLocaleDateString('en-US', options);
}

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
}
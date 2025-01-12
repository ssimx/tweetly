import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper function to handle errors
export function getErrorMessage (error: unknown): string {
    let message: string;

    // error is new Error
    if (error instanceof Error) {
        message = error.message;
    } // error is object with message
    else if (error && typeof error === 'object' && 'message' in error) {
        message = String(error.message);
    } // error is object with error
    else if (error && typeof error === 'object' && 'error' in error) {
        message = String(error.error);
    } // error is just a string
    else if (typeof error === 'string') {
        message = error;
    } // anything else is unknown
    else {
        message = 'Something went wrong';
    }

    return message;
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
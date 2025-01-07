import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
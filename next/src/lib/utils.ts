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
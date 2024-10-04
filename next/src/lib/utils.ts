import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
};

export function formatPostDate(date: string) {
    const postDate = new Date(date);
    const now = new Date();
    const hoursDiff = Math.abs(now.getTime() - postDate.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 1) {
        return `${Math.floor(Math.abs(now.getTime() - postDate.getTime()) / (1000 * 60))} min`
    }
    if (hoursDiff < 24) {
        return `${Math.floor(hoursDiff)} hour${Math.floor(hoursDiff) !== 1 ? 's' : ''}`;
    } else {
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return postDate.toLocaleDateString('en-US', options);
    }
};
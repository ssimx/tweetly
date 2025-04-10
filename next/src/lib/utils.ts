import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
};

export function formatPostDate(date: string | number | Date) {
    const postDate = new Date(date);
    const now = new Date();
    const hoursDiff = Math.abs(now.getTime() - postDate.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 1) {
        const min = Math.floor(Math.abs(now.getTime() - postDate.getTime()) / (1000 * 60));
        if (min === 0) return 'now';
        return `${min}m ago`
    }
    if (hoursDiff < 24) {
        return `${Math.floor(hoursDiff)}h`;
    } else {
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return postDate.toLocaleDateString('en-US', options);
    }
};

export function formatDate(date: string | Date) {
    const postDate = new Date(date);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: "numeric" };
    return postDate.toLocaleDateString('en-US', options);
}

export function getAge(date: string | Date) {
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

export function formatMessageSent(date: string | number | Date) {
    const messageDate = new Date(date);
    const now = new Date();
    const hoursDiff = Math.abs(now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 1) {
        const min = Math.floor(Math.abs(now.getTime() - messageDate.getTime()) / (1000 * 60));
        if (min === 0) return 'Sent';
        return `Sent ${min}m ago`
    }
    if (hoursDiff < 24) {
        return `Sent ${Math.floor(hoursDiff)}h ago`;
    } else {
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `Sent ${messageDate.toLocaleDateString('en-US', options)}`;
    }
};

export function formatMessageReceived(date: string | number | Date) {
    const messageDate = new Date(date);
    const now = new Date();
    const hoursDiff = Math.abs(now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 1) {
        const min = Math.floor(Math.abs(now.getTime() - messageDate.getTime()) / (1000 * 60));
        if (min === 0) return '';
        return `${min}m ago`
    }
    if (hoursDiff < 24) {
        return `${Math.floor(hoursDiff)}h ago`;
    } else {
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `Received ${messageDate.toLocaleDateString('en-US', options)}`;
    }
};

export function formatMessageSeen(date: string | number | Date) {
    const seenDate = new Date(date);
    const now = new Date();
    const hoursDiff = Math.abs(now.getTime() - seenDate.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 1) {
        const min = Math.floor(Math.abs(now.getTime() - seenDate.getTime()) / (1000 * 60));
        if (min === 0) return 'Seen';
        return `Seen ${min}m ago`
    }
    if (hoursDiff < 24) {
        return `Seen ${Math.floor(hoursDiff)}h ago`;
    } else {
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `Seen ${seenDate.toLocaleDateString('en-US', options)}`;
    }
};
import 'server-only';
import { revalidateTag } from 'next/cache';

export function getTheme(theme: number) {
    switch (theme) {
        case 1:
            return 'dim';
        case 2:
            return 'dark';
        default:
            return 'default';
    }
}

export function getColor(color: number) {
    switch (color) {
        case 1:
            return 'yellow';
        case 2:
            return 'pink';
        case 3:
            return 'purple';
        case 4:
            return 'orange';
        default:
            return 'blue';
    }
}

export function revalidate(tag: string) {
    revalidateTag(tag);
}
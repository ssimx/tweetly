import 'server-only';
import { UserInfo } from './types';
import { decryptSession, getToken } from './session';
import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';

export async function fetchUserData() {
    try {
        const token = await getToken();
        if (!token) {
            throw new Error("Unauthorized: No token provided");
        }

        const response = await fetch('http://localhost:3000/api/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }

        const userData = await response.json() as UserInfo;
        const username = await decryptSession(token).then(res => res?.username);

        if (userData.username !== username) {
            (await cookies()).delete('access-token');
            return null;
        }

        return userData;
    } catch (error) {
        return;
    }
};


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
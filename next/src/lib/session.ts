import { TemporaryUserJwtPayload } from './../../../tweetly-shared/dist/types/lib/userTypes.d';
import { JwtPayload } from './types';
import 'server-only';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { LoggedInUserJwtPayload } from 'tweetly-shared';

const secretKey = process.env.JWT_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(token: string) {
    const jwtPayload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
    const expiresAt = new Date(jwtPayload.exp * 1000);
    const cookieStore = await cookies();
    cookieStore.set('access-token', token, {
        httpOnly: true,
        // secure: true,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    });
};

export async function decryptSession(token: string | undefined) {
    if (!token) {
        return;
    }

    try {
        const { payload } = await jwtVerify(token, encodedKey, {
            algorithms: ['HS256'],
        })
        return payload as LoggedInUserJwtPayload | TemporaryUserJwtPayload;
    } catch (error) {
        return;
    }
};

export async function verifySession(token: string | undefined) {
    const session = await decryptSession(token);
    if (!session?.id) {
        return { isAuth: false };
    }
    return { isAuth: true };
};

export async function hasSession() {
    const cookieStore = await cookies();
    return cookieStore.has('access-token');
};

export async function getUserSessionToken() {
    const cookieStore = await cookies();
    return cookieStore.get('access-token')?.value;
};

export async function removeSession() {
    const cookieStore = await cookies();
    cookieStore.delete('access-token');
};

export async function updateSessionToken(newToken: string) {
    const jwtPayload = JSON.parse(atob(newToken.split('.')[1])) as JwtPayload;
    const expiresAt = new Date(jwtPayload.exp * 1000);
    const cookieStore = await cookies();
    cookieStore.set('access-token', newToken, {
        httpOnly: true,
        // secure: true,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    })
};

export async function extractToken(authHeader: string | null) {
    if (authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            return parts[1];
        }
    }
    return;
};

// temporary user token
export async function createTemporarySession(token: string) {
    const jwtPayload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
    const expiresAt = new Date(jwtPayload.exp * 1000);
    const cookieStore = await cookies();
    cookieStore.set('temporary-access-token', token, {
        httpOnly: true,
        // secure: true,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    });
};

export async function hasTemporarySession() {
    const cookieStore = await cookies();
    return cookieStore.has('temporary-access-token');
};

export async function getTemporaryToken() {
    const cookieStore = await cookies();
    return cookieStore.get('temporary-access-token')?.value;
};

export async function removeTemporarySession() {
    const cookieStore = await cookies();
    cookieStore.delete('temporary-access-token');
};

export async function updateTemporarySessionToken(newToken: string) {
    const jwtPayload = JSON.parse(atob(newToken.split('.')[1])) as JwtPayload;
    const expiresAt = new Date(jwtPayload.exp * 1000);
    const cookieStore = await cookies();
    cookieStore.set('temporary-access-token', newToken, {
        httpOnly: true,
        // secure: true,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    })
};

// settings token
export async function createSettingsSession(token: string) {
    const jwtPayload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
    const expiresAt = new Date(jwtPayload.exp * 1000);
    const cookieStore = await cookies();
    cookieStore.set('settings-token', token, {
        httpOnly: true,
        // secure: true,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/settings/account',
    })
};

export async function getSettingsToken() {
    const cookieStore = await cookies();
    return cookieStore.get('settings-token')?.value;
};

export async function decryptSettingsToken(token: string | undefined) {
    if (!token) {
        return;
    }

    try {
        const { payload } = await jwtVerify(token, encodedKey, {
            algorithms: ['HS256'],
        })
        return payload;
    } catch (error) {
        return;
    }
};

export async function verifySettingsToken(token: string | undefined) {
    const session = await decryptSettingsToken(token);
    if (!session?.id) {
        return { isAuth: false };
    }
    return { isAuth: true };
};

export async function removeSettingsToken() {
    const cookieStore = await cookies();
    cookieStore.delete({
        name: 'settings-token',
        path: '/settings/account',
    });
};
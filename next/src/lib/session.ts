import 'server-only';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(token: string) {
    const jwtPayload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = new Date(jwtPayload.exp * 1000);

    cookies().set('access-token', token, {
        httpOnly: true,
        secure: true,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    })
};

export async function decryptSession(token: string | undefined) {
    if (!token) {
        console.error('No session found');
        return;
    }

    try {
        const { payload } = await jwtVerify(token, encodedKey, {
            algorithms: ['HS256'],
        })
        return payload;
    } catch (error) {
        console.log('Failed to verify session');
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
    const cookieStore = cookies();
    const hasToken = cookieStore.has('access-token');
    return hasToken;
};

export async function getToken() {
    const token = cookies().get('access-token')?.value;
    return token;
}

export async function removeSession() {
    cookies().delete('access-token');
};

export async function updateSessionToken(newToken: string) {
    const jwtPayload = JSON.parse(atob(newToken.split('.')[1]));
    const expiresAt = new Date(jwtPayload.exp * 1000);

    cookies().set('access-token', newToken, {
        httpOnly: true,
        secure: true,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    })
}

export async function extractToken(authHeader: string | null) {
    if (authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            return parts[1];
        }
    }
    return;
};

// settings token

export async function createSettingsSession(token: string) {
    const jwtPayload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = new Date(jwtPayload.exp * 1000);

    cookies().set('settings-token', token, {
        httpOnly: true,
        secure: true,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/settings/account',
    })
};

export async function getSettingsToken() {
    const token = cookies().get('settings-token')?.value;
    return token;
}


export async function verifySettingsToken(token: string | undefined) {
    const session = await decryptSession(token);

    if (!session?.id) {
        return { isAuth: false };
    }

    return { isAuth: true };
};

export async function removeSettingsToken() {
    cookies().delete({
        name: 'settings-token', 
        path: '/settings/account',
    });
};
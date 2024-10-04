import 'server-only';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function createSession(token: string) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    cookies().set('access-token', token, {
        httpOnly: true,
        secure: true,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    })
};

const secretKey = process.env.JWT_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

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

export const verifySession = async (token: string | undefined) => {
    const session = await decryptSession(token);

    if (!session?.id) {
        return { isAuth: false };
    }

    return { isAuth: true };
};

export async function hasSession(): Promise<boolean> {
    const cookieStore = cookies();
    const hasToken = cookieStore.has('access-token');
    return hasToken;
};

export function getToken() {
    const token = cookies().get('access-token')?.value;
    return token;    
}

export function removeSession() {
    cookies().delete('access-token');
};

export function extractToken(authHeader: string | null) {
    if (authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            return parts[1];
        }
    }
    return;
};
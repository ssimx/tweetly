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

export async function decryptSession(session: string | undefined = '') {
    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ['HS256'],
        })
        return payload;
    } catch (error) {
        console.log('Failed to verify session');
        return;
    }
};

export const verifySession = async () => {
    const cookie = cookies().get('access-token')?.value;
    const session = await decryptSession(cookie);

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

export async function getToken() {
    return cookies().get('access-token')?.value;
}

export async function removeSession(): Promise<void> {
    cookies().delete('access-token');
};
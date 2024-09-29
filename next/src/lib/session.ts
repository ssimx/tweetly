import 'server-only';
import { cookies } from 'next/headers';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';

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

export async function getSession(): Promise<RequestCookie | undefined> {
    const cookieStore = cookies();
    const token = cookieStore.get('access-token');
    return token;
};

export async function hasSession(): Promise<boolean> {
    const cookieStore = cookies();
    const hasToken = cookieStore.has('access-token');
    return hasToken;
};

export async function removeSession(): Promise<void> {
    cookies().delete('access-token');
};
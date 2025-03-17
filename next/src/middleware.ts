import { NextRequest, NextResponse } from 'next/server';
import { getUserSessionToken, verifySession } from '@/lib/session'; // Adjust imports as necessary

export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup/')) {
        const sessionToken = await getUserSessionToken();
        const sessionIsValid = await verifySession(sessionToken);
        if (sessionIsValid.isAuth) {
            return NextResponse.redirect(new URL('/', request.url)); // Redirect to root if logged in
        }
    }

    return NextResponse.next(); // Allow access if not logged in
}

export const config = {
    matcher: ['/login', '/signup'],
};
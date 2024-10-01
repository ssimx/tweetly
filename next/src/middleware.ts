import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session'; // Adjust imports as necessary

export async function middleware(request: NextRequest) {
    console.log('middleware');

    if (request.nextUrl.pathname.includes('/login') || request.nextUrl.pathname.includes('/signup')) {
        const isValid = await verifySession();
        if (isValid.isAuth) {
            return NextResponse.redirect(new URL('/', request.url)); // Redirect to root if logged in
        }

        return NextResponse.next(); // Allow access if not logged in
    }
}

export const config = {
    matcher: ['/login', '/signup'],
};
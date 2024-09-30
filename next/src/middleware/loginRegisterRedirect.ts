import { NextResponse } from 'next/server';
import { hasSession, verifySession } from '@/lib/session'; // Adjust imports as necessary

export async function middleware(req: Request) {
    console.log('middleware');
    
    const token = await hasSession();

    if (token) {
        const isValid = await verifySession();
        if (isValid) {
            return NextResponse.redirect(new URL('/', req.url)); // Redirect to root if logged in
        }
    }

    return NextResponse.next(); // Allow access if not logged in
}

export const config = {
    matcher: ['/login', '/signup'],
};
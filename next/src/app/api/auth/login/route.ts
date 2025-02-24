import { createSession, getUserSessionToken, removeSession, verifySession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { FormLogInUserDataType, logInUserSchema } from 'tweetly-shared';
import { z } from 'zod';

export async function POST(req: NextRequest) {
    if (req.method === 'POST') {
        // Check for an existing session
        const token = await getUserSessionToken();
        if (token) {
            const isValid = await verifySession(token);

            if (isValid.isAuth) {
                // User is already logged in, return an appropriate response
                return NextResponse.json({ message: 'Already logged in!' }, { status: 400 });
            } else {
                // Remove invalid session if the session is not valid
                await removeSession();
            }
        }

        try {
            // Validate incoming data
            const body = await req.json() as FormLogInUserDataType;
            const validatedData = logInUserSchema.parse(body);

            // Send a POST request to the backend
            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(validatedData),
            });

            if (response.ok) {
                const data = await response.json();
                await createSession(data.token);
                return NextResponse.json(data);
            } else {
                const errorData = await response.json();
                return NextResponse.json({ error: errorData.error }, { status: response.status });
            }
        } catch (error) {
            // Handle validation errors
            if (error instanceof z.ZodError) {
                return NextResponse.json({ error: error.errors }, { status: 400 });
            }
            // Handle other errors
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    } else {
        return NextResponse.json({ error: `Method ${req.method} Not Allowed` }, { status: 405 });
    }
}
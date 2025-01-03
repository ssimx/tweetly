import { settingsPasswordSchema } from '@/lib/schemas';
import { createSettingsSession, getSettingsToken, getToken, removeSession, removeSettingsToken, verifySession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(req: NextRequest) {
    if (req.method === 'POST') {
        // Check for an existing session
        const sessionToken = getToken();
        const settingsToken = getSettingsToken();

        if (sessionToken && settingsToken) {
            // Check for session validity
            const isSessionValid = await verifySession(sessionToken);
            const isSettingsTokenValid = await verifySession(settingsToken);

            if (!isSessionValid.isAuth) {
                removeSession();
                removeSettingsToken();
                return NextResponse.json({ message: 'Invalid session. Please re-log' }, { status: 401 });
            }
            
            if (!isSettingsTokenValid.isAuth) {
                removeSettingsToken();
                return NextResponse.json({ message: 'Invalid settings token' }, { status: 401 });
            } else {
                return NextResponse.json({ message: 'Settings token is already valid' }, { status: 401 });
            }
        } else {
            if (!sessionToken) return NextResponse.json({ message: 'Not logged in, please log in first' }, { status: 401 });
        }

        console.log(sessionToken);

        try {
            // Validate incoming data
            const body: z.infer<typeof settingsPasswordSchema> = await req.json();
            const validatedData = settingsPasswordSchema.parse(body);

            // Send a POST request to the backend
            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/auth/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`,
                },
                body: JSON.stringify(validatedData),
            });

            if (response.ok) {
                const data = await response.json();
                await createSettingsSession(data.token);
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
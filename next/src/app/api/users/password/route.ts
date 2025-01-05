import { settingsChangePassword } from "@/lib/schemas";
import { getSettingsToken, getToken, removeSession, removeSettingsToken, verifySession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function PATCH(req: NextRequest) {
    if (req.method === 'PATCH') {
        // Check for an existing session
        const sessionToken = await getToken();
        const settingsToken = await getSettingsToken();

        if (sessionToken && settingsToken) {
            // Check for session validity
            const isSessionValid = await verifySession(sessionToken);
            const isSettingsTokenValid = await verifySession(settingsToken);

            if (!isSessionValid.isAuth) {
                await removeSession();
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

        try {
            // Validate incoming data
            const body: z.infer<typeof settingsChangePassword> = await req.json();
            const validatedData = settingsChangePassword.parse(body);

            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/users/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`,
                },
                body: JSON.stringify(validatedData),
            });

            if (response.ok) {
                return NextResponse.json(true);
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
};
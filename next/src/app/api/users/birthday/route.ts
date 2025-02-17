import { settingsChangeBirthday } from "@/lib/schemas";
import { extractToken, getSettingsToken, getToken, removeSession, removeSettingsToken, verifySession, verifySettingsToken } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function PATCH(req: NextRequest) {
    if (req.method === 'PATCH') {
        const authHeader = req.headers.get('Authorization');
        const settingsHeader = req.headers.get('Settings-Token');
        const sessionToken = await extractToken(authHeader) || await getToken();
        const settingsToken = await extractToken(settingsHeader) || await getSettingsToken();

        if (sessionToken && settingsToken) {
            // Check for session validity
            const isSessionValid = await verifySession(sessionToken);
            const isSettingsTokenValid = await verifySettingsToken(settingsToken);

            if (!isSessionValid.isAuth) {
                await removeSession();
                await removeSettingsToken();
                return NextResponse.json({ message: 'Invalid session. Please re-log' }, { status: 401 });
            }

            if (!isSettingsTokenValid.isAuth) {
                await removeSettingsToken();
                return NextResponse.json({ message: 'Invalid settings token' }, { status: 401 });
            }
        } else {
            if (!sessionToken) return NextResponse.json({ message: 'Not logged in, please log in first' }, { status: 401 });
        }

        try {
            // Validate incoming data
            const body = await req.json() as z.infer<typeof settingsChangeBirthday>;
            const validatedData = settingsChangeBirthday.parse(body);

            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/users/birthday`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`,
                },
                body: JSON.stringify(validatedData),
            });

            if (response.ok) {
                const data = await response.json();
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
};
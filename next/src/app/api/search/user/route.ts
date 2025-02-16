import { extractToken, getSettingsToken, getToken, removeSession, removeSettingsToken, verifySession, verifySettingsToken } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchUsernameSchema } from "@/lib/schemas";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    if (req.method === 'GET') {
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

        const searchParams = req.nextUrl.searchParams;

        try {
            const apiUrl = process.env.EXPRESS_API_URL;
            const query = searchParams.get('q');
            if (!query) return NextResponse.json({ message: 'No query provided' }, { status: 400 });

            try {
                // Decode and validate query
                const decodedQuery = decodeURIComponent(query);
                searchUsernameSchema.parse({ q: decodedQuery });

                // Encode query for backend API call
                const encodedQuery = encodeURIComponent(decodedQuery);

                // Proceed with API request if valid
                const response = await fetch(`${apiUrl}/search/user?q=${encodedQuery}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    return NextResponse.json(data);
                } else {
                    const errorData = await response.json();
                    return NextResponse.json({ error: errorData.error }, { status: response.status });
                }
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
                }
                return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
            }
        } catch (error) {
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    } else {
        return NextResponse.json({ error: `Method ${req.method} Not Allowed` }, { status: 405 });
    }
}
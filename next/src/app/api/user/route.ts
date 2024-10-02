import { getToken, hasSession, removeSession, verifySession } from "@/lib/session";
import { UserInfo } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    if (req.method === 'GET') {
        // Check for an existing session
        const token = await hasSession();

        if (token) {
            const isValid = await verifySession();

            if (!isValid.isAuth) {
                // User is already logged in, return an appropriate response
                await removeSession();
                return NextResponse.json({ message: 'Invalid session. Please re-log' }, { status: 400 });
            }
        } else {
            return NextResponse.json({ message: 'Not logged in, please log in first' }, { status: 401 });
        }

        try {
            const token = await getToken();

            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/user`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                
                return NextResponse.json(data.userData as UserInfo);
            } else {
                const errorData = await response.json();
                return NextResponse.json({ error: errorData.error }, { status: response.status });
            }
        } catch (error) {
            // Handle other errors
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    } else {
        return NextResponse.json({ error: `Method ${req.method} Not Allowed` }, { status: 405 });
    }
};
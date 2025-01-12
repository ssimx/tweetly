import { verifySession, extractToken, removeSession } from "@/lib/session";
import { ProfileInfo } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, props: { params: Promise<{ username: string }> }) {
    const params = await props.params;
    if (req.method === 'GET') {
        const authHeader = req.headers.get('Authorization');
        const token = await extractToken(authHeader);

        if (token) {
            const isValid = await verifySession(token);

            if (!isValid.isAuth) {
                await removeSession();
                return NextResponse.json({ message: 'Invalid session. Please re-log' }, { status: 400 });
            }
        } else {
            return NextResponse.json({ message: 'Not logged in, please log in first' }, { status: 401 });
        }

        try {
            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/users/${params.username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                return NextResponse.json(data.profileData as ProfileInfo);
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
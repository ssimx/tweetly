import { getToken, removeSession, verifySession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, props: { params: Promise<{ username: string }> }) {
    const params = await props.params;
    if (req.method === 'DELETE') {
        const token = await getToken();

        if (token) {
            const session = await verifySession(token);

            if (!session.isAuth) {
                await removeSession();
                return NextResponse.json({ message: 'Invalid session. Please re-log' }, { status: 400 });
            }
        } else {
            return NextResponse.json({ message: 'Not logged in, please log in first' }, { status: 401 });
        }

        try {
            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/users/removeBlock/${params.username}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                return NextResponse.json(true);
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
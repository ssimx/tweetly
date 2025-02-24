import { getUserSessionToken, removeSession, verifySession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, props: { params: Promise<{ username: string }> }) {
    const params = await props.params;
    if (req.method === 'POST') {
        const token = await getUserSessionToken();
        if (token) {
            const isValid = await verifySession(token);

            if (!isValid.isAuth) {
                await removeSession();
                return NextResponse.json({ message: 'Invalid session. Please re-log' }, { status: 401 });
            }
        } else {
            return NextResponse.json({ error: 'Not logged in. Please log in first' }, { status: 401 })
        }

        try {
            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/conversations/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ receiver: params.username })
            });

            if (response.ok) {
                const conversation = await response.json();
                return NextResponse.json(conversation.emptyConversationId);
            } else {
                const errorData = await response.json();
                return NextResponse.json({ error: errorData.error }, { status: response.status });
            }
        } catch (error) {
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    } else {
        return NextResponse.json({ error: `Method ${req.method} Not Allowed` }, { status: 405 });
    }
}
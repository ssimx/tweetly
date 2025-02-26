import { verifySession, extractToken, removeSession, getUserSessionToken } from "@/lib/session";
import { ConversationsListType } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { getErrorMessage } from 'tweetly-shared';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, props: { params: Promise<{ conversationId: string }> }) {
    const params = await props.params;
    if (req.method === 'GET') {
        const authHeader = req.headers.get('Authorization');
        // need getUserSessionToken() to extract the token from client component for infinite scroll
        const token = await extractToken(authHeader) || await getUserSessionToken();
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
            const searchParams = req.nextUrl.searchParams;
            const query = searchParams.get('cursor');

            if (query !== null) {
                const response = await fetch(`${apiUrl}/conversations/${params.conversationId}?cursor=${query}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    return NextResponse.json({ error: getErrorMessage(errorData) }, { status: response.status });
                }

                const conversations = await response.json() as ConversationsListType;
                return NextResponse.json(conversations);
            } else {
                const response = await fetch(`${apiUrl}/conversations/${params.conversationId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    return NextResponse.json(data);
                } else {
                    const errorData = await response.json();
                    return NextResponse.json({ error: getErrorMessage(errorData) }, { status: response.status });
                }
            }
        } catch (error) {
            // Handle other errors
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    } else {
        return NextResponse.json({ error: `Method ${req.method} Not Allowed` }, { status: 405 });
    }
};
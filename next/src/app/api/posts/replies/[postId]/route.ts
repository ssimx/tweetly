import { extractToken, getUserSessionToken, removeSession, verifySession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, props: { params: Promise<{ postId: number }> }) {
    if (req.method === 'GET') {
        const authHeader = req.headers.get('Authorization');
        const token = await extractToken(authHeader) || await getUserSessionToken();
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
            const searchParams = req.nextUrl.searchParams;
            const cursor = searchParams.get('cursor');
            const params = await props.params;
            const postId = params.postId;

            if (cursor !== null) {
                const response = await fetch(`${apiUrl}/posts/postReplies/${postId}?cursor=${cursor}`, {
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
                    return NextResponse.json({ error: errorData.error }, { status: response.status });
                }
            } else {
                const response = await fetch(`${apiUrl}/posts/postReplies/${postId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                })

                if (response.ok) {
                    const replies = await response.json();
                    return NextResponse.json(replies);
                } else {
                    const errorData = await response.json();
                    return NextResponse.json({ error: errorData.error }, { status: response.status });
                }
            }
        } catch (error) {
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    } else {
        NextResponse.json({ error: `Method ${req.method} Not Allowed` }, { status: 405 });
    }
};
import { getToken, removeSession, verifySession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, props: { params: Promise<{ username: string }> }) {
    const params = await props.params;
    if (req.method === 'GET') {
        const searchParams = req.nextUrl.searchParams;
        const token = await getToken();
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
            const query = searchParams.get('cursor');

            if (query !== null) {
                const response = await fetch(`${apiUrl}/posts/${params.username}?cursor=${query}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                });

                if (response.ok) {
                    const posts = await response.json();
                    return NextResponse.json(posts);
                } else {
                    const errorData = await response.json();
                    return NextResponse.json({ error: errorData.error }, { status: response.status });
                }
            } else {
                const response = await fetch(`${apiUrl}/posts/${params.username}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                });

                if (response.ok) {
                    const posts = await response.json();
                    return NextResponse.json(posts);
                } else {
                    const errorData = await response.json();
                    return NextResponse.json({ error: errorData.error }, { status: response.status });
                }
            }
        } catch (error) {
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    } else {
        return NextResponse.json({ error: `Method ${req.method} Not Allowed` }, { status: 405 });
    }
}
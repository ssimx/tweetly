import { extractToken, getUserSessionToken, removeSession, verifySession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ slug: [action: string, postId: string] }> }
) {
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

        const params = await props.params;
        const postId = params.slug[1];

        try {
            const apiUrl = process.env.EXPRESS_API_URL;

            const response = await fetch(`${apiUrl}/posts/status/${postId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const post = await response.json();
                return NextResponse.json(post);
            } else {
                const errorData = await response.json();
                return NextResponse.json({ error: errorData.error }, { status: response.status });
            }
        } catch (error) {
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    } else {
        NextResponse.json({ error: `Method ${req.method} Not Allowed` }, { status: 405 });
    }
};

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ slug: [action: string, postId: string] }> }
) {
    if (req.method === 'POST') {
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

        const params = await props.params;
        const action = params.slug[0];
        const postId = params.slug[1];

        try {
            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/posts/${action}/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                return NextResponse.json({ message: 'Success' }, { status: 200 });
            } else {
                const errorData = await response.json();
                return NextResponse.json({ error: errorData.error }, { status: response.status });
            }
        } catch (error) {
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    } else {
        NextResponse.json({ error: `Method ${req.method} Not Allowed` }, { status: 405 });
    }
}

export async function DELETE(
    req: NextRequest,
    props: { params: Promise<{ slug: [action: string, postId: string] }> }
) {
    const params = await props.params;
    if (req.method === 'DELETE') {
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

        const action = params.slug[0];
        const postId = params.slug[1];

        try {
            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/posts/${action}/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                return NextResponse.json({ message: 'Success' }, { status: 200 });
            } else {
                const errorData = await response.json();
                return NextResponse.json({ error: errorData.error }, { status: response.status });
            }
        } catch (error) {
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    } else {
        NextResponse.json({ error: `Method ${req.method} Not Allowed` }, { status: 405 });
    }
}
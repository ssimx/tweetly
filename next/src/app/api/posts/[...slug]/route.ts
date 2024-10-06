import { getToken, removeSession, verifySession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    if (req.method === 'GET') {
        const postId = params.id;
        try {
            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/posts/${postId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
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

export async function POST(req: NextRequest, { params }: { params: { slug: { action: string, postId: string } }}) {
    if (req.method === 'POST') {
        const token = getToken();

        if (token) {
            const isValid = await verifySession(token);

            if (!isValid.isAuth) {
                removeSession();
                return NextResponse.json({ message: 'Invalid session. Please re-log ' }, { status: 401 })
            } 
        } else {
            return NextResponse.json({ error: 'Not logged in. Please log in first' }, { status: 401 })
        };

        const { action, postId } = params.slug;
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

export async function DELETE(req: NextRequest, { params }: { params: { slug: { action: string, postId: string } } }) {
    if (req.method === 'DELETE') {
        const token = getToken();

        if (token) {
            const isValid = await verifySession(token);

            if (!isValid.isAuth) {
                removeSession();
                return NextResponse.json({ message: 'Invalid session. Please re-log ' }, { status: 401 })
            } 
        } else {
            return NextResponse.json({ error: 'Not logged in. Please log in first' }, { status: 401 })
        }

        const { action, postId } = params.slug;
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
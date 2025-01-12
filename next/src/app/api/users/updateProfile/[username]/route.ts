import { removeSession, getToken, decryptSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, props: { params: Promise<{ username: string }> }) {
    const params = await props.params;
    if (req.method === 'POST') {
        const token = await getToken();

        if (token) {
            const payload = await decryptSession(token);

            if (!payload) {
                await removeSession();
                return NextResponse.json({ message: 'Invalid session. Please re-log' }, { status: 400 });
            }

            if (payload.username !== params.username) return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
        } else {
            return NextResponse.json({ message: 'Not logged in, please log in first' }, { status: 401 });
        }

        try {
            const body = await req.json();
            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/users/updateProfile/${params.username}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                revalidatePath(`/${params.username}`);
                return NextResponse.json('success');
            } else {
                return NextResponse.json({ error: 'failure' }, { status: response.status });
            }
        } catch (error) {
            // Handle other errors
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    } else {
        return NextResponse.json({ error: `Method ${req.method} Not Allowed` }, { status: 405 });
    }
};
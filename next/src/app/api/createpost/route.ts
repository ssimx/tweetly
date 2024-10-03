import { newPostSchema } from "@/lib/schemas";
import { getToken, removeSession, verifySession } from "@/lib/session";
import { Post } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: NextRequest) {
    if (req.method === 'POST') {
        // Check for an existing session
        const token = getToken();
        if (token) {
            // Check for session validity
            const isValid = await verifySession(token);

            if (!isValid.isAuth) {
                removeSession();
                return NextResponse.json({ message: 'Invalid session. Please re-log' }, { status: 401 });
            }
        } else {
            return NextResponse.json({ message: 'Not logged in, please log in first' }, { status: 401 });
        }

        try {
            // validate the data
            const body: z.infer<typeof newPostSchema> = await req.json();
            const validatedData = newPostSchema.parse(body);

            // send POST request to the backend
            const apiUrl = process.env.EXPRESS_API_URL;
            const token = await getToken();
            
            const response = await fetch(`${apiUrl}/post/createpost`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(validatedData),
            });

            if (response.ok) {
                const data = await response.json();

                return NextResponse.json(data.response.post as Post);
            } else {
                const errorData = await response.json();
                return NextResponse.json({ error: errorData.error }, { status: response.status });
            }
        } catch (error) {
            // Handle validation errors
            if (error instanceof z.ZodError) {
                return NextResponse.json({ error: error.errors }, { status: 400 });
            }
            // Handle other errors
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    } else {
        return NextResponse.json({ error: `Method ${req.method} Not Allowed` }, { status: 405 });
    }
}
import { extractToken, getToken, removeSession, verifySession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchSchema } from "@/lib/schemas";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    if (req.method === 'GET') {
        const searchParams = req.nextUrl.searchParams;
        const authHeader = req.headers.get('Authorization');
        const token = extractToken(authHeader) || getToken();

        if (token) {
            const isValid = await verifySession(token);

            if (!isValid.isAuth) {
                removeSession();
                return NextResponse.json({ message: 'Invalid session. Please re-log' }, { status: 400 });
            }
        } else {
            return NextResponse.json({ message: 'Not logged in, please log in first' }, { status: 401 });
        }

        try {
            const apiUrl = process.env.EXPRESS_API_URL;
            const query = searchParams.get('q');
            if (!query) return NextResponse.json({ message: 'No query provided' }, { status: 400 });

            console.log("Received query:", query); // Log the received query

            // Validate query with Zod
            try {
                const validatedQuery: z.infer<typeof searchSchema> = searchSchema.parse({ q: query});
                console.log('Validated Query:', validatedQuery.q); // Log validated query

                // Proceed with API request if valid
                const response = await fetch(`${apiUrl}/search/users?q=${validatedQuery.q}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    
                    return NextResponse.json(data);
                } else {
                    const errorData = await response.json();
                    return NextResponse.json({ error: errorData.error }, { status: response.status });
                }
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
                }
                return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
            }
        } catch (error) {
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    } else {
        return NextResponse.json({ error: `Method ${req.method} Not Allowed` }, { status: 405 });
    }
}
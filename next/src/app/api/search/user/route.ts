import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { usernameOrEmailAvailibilitySchema } from 'tweetly-shared';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    if (req.method === 'GET') {
        try {
            const apiUrl = process.env.EXPRESS_API_URL;
            const searchParams = req.nextUrl.searchParams;
            const type = searchParams.get('type');
            const data = searchParams.get('data');
            console.log(type, data)
            if (!type || !data) return NextResponse.json({ message: 'No query provided' }, { status: 400 });

            try {
                // Decode and validate type and data
                const decodedType = decodeURIComponent(type);
                const decodedData = decodeURIComponent(data);
                usernameOrEmailAvailibilitySchema.parse({ type: decodedType, data: decodedData });

                // Encode query for backend API call
                const encodedType = encodeURIComponent(decodedType);
                const encodedData = encodeURIComponent(decodedData);

                // Proceed with API request if valid
                const response = await fetch(`${apiUrl}/search/user?type=${encodedType}&data=${encodedData}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
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
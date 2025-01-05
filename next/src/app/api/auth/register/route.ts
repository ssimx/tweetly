import { signUpSchema } from '@/lib/schemas';
import { createSession, getToken, removeSession, verifySession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(req: NextRequest) {
    if (req.method === 'POST') {
        const token = await getToken();
        if (token) {
            const isValid = await verifySession(token);

            if (isValid.isAuth) {
                return NextResponse.json({ message: 'Already logged in!' }, { status: 400 });
            } else {
                // Remove invalid session if the session is not valid
                await removeSession();
            }
        }

        try {
            const body: z.infer<typeof signUpSchema> = await req.json();
            const validatedData = signUpSchema.parse(body);

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, year, day, month, ...data } = validatedData;

            const dateOfBirth = `${year}-${('0' + month).slice(-2)}-${('0' + day).slice(-2)}`;

            const userData = {
                ...data,
                dateOfBirth
            };

            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                const data = await response.json();
                await createSession(data.token);
                return NextResponse.json(data);
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
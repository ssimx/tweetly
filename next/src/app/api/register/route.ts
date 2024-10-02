import { signUpSchema } from '@/lib/schemas';
import { createSession, hasSession, removeSession, verifySession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(req: NextRequest) {
    if (req.method === 'POST') {
        // Check for an existing session
        const token = await hasSession();

        if (token) {
            const isValid = await verifySession();

            if (isValid.isAuth) {
                // User is already logged in, return an appropriate response
                return NextResponse.json({ message: 'Already logged in!' }, { status: 400 });
            } else {
                // Remove invalid session if the session is not valid
                await removeSession();
            }
        }

        try {
            // Validate incoming data
            const body: z.infer<typeof signUpSchema> = await req.json();
            const validatedData = signUpSchema.parse(body);

            // Remove confirmPassword from the object
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, year, day, month, ...data } = validatedData;

            const dateOfBirth = `${year}-${('0' + month).slice(-2)}-${('0' + day).slice(-2)}`;

            console.log(dateOfBirth);

            const userData = {
                ...data,
                dateOfBirth
            };

            // Send a POST request to your Express backend
            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            // Handle the response from your Express backend
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
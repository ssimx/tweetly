import { NextRequest, NextResponse } from 'next/server';
import { AppError, ErrorResponse, FormLogInUserDataType, getErrorMessage, logInUserSchema, SuccessResponse } from 'tweetly-shared';

export async function POST(req: NextRequest) {
    if (req.method === 'POST') {
        try {
            // Validate incoming data
            const body = await req.json() as FormLogInUserDataType;
            if (!body) {
                throw new AppError('Log in data is missing', 404, 'MISSING_DATA');
            }

            const validatedData = logInUserSchema.parse(body);

            // Send a POST request to the backend
            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(validatedData),
            });

            if (!response.ok) {
                const errorData = await response.json() as ErrorResponse;
                throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
            }

            const { data } = await response.json() as SuccessResponse<{ token: string }>;
            if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
            else if (!data.token) throw new AppError('JWT is missing in data response', 404, 'MISSING_JWT');

            return NextResponse.json({
                success: true,
                data: {
                    token: data.token
                }
            }) as NextResponse<SuccessResponse<{ token: string }>>
        } catch (error: unknown) {
            if (error instanceof AppError) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            message: error.message || 'Internal Server Error',
                            code: error.code || 'INTERNAL_ERROR',
                        },
                    },
                    { status: error.statusCode || 500 }
                ) as NextResponse<ErrorResponse>;
            }

            // Handle other errors
            const errorMessage = getErrorMessage(error);
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: errorMessage,
                        code: error instanceof Error ? error.name.toUpperCase().replaceAll(' ', '_') : 'INTERNAL_ERROR',
                    }
                }
            ) as NextResponse<ErrorResponse>;
        };
    } else {
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: `HTTP Method ${req.method} Not Allowed`,
                    code: 'INVALID_HTTP_METHOD',
                },
            },
            { status: 405 }
        ) as NextResponse<ErrorResponse>;
    };
}
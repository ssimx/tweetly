import { extractToken, getToken, removeSession, verifySession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ApiResponse, AppError, ErrorResponse, RegisterUserDataType, SuccessResponse, SuccessfulRegisterResponseType, registerUserDataSchema } from 'tweetly-shared';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<SuccessfulRegisterResponseType>>> {
    if (req.method === 'POST') {
        try {
            const authHeader = req.headers.get('Authorization');
            const token = await extractToken(authHeader) || await getToken();

            if (token) {
                const isValid = await verifySession(token);
    
                if (isValid.isAuth) {
                    throw new AppError('Already logged in', 401, 'USER_LOGGED_IN');
                } else {
                    // Remove invalid session if the session is not valid
                    await removeSession();
                }
            }

            const body = await req.json() as RegisterUserDataType;
            const validatedData = registerUserDataSchema.parse(body);

            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/auth/register`, {
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

            const { data } = await response.json() as SuccessResponse<SuccessfulRegisterResponseType>;

            const successResponse: SuccessResponse<SuccessfulRegisterResponseType> = {
                success: true,
                data: {
                    token: data.token
                },
            };

            return NextResponse.json(
                successResponse,
                { status: response.status }
            );
        } catch (error: unknown) {

            // Handle validation errors
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            message: error.message || 'Internal Server Error',
                            code: 'VALIDATION_ERROR',
                            details: error.issues,
                        },
                    },
                    { status: 400 }
                ) as NextResponse<ErrorResponse>;
            } else if (error instanceof AppError) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            message: error.message || 'Internal Server Error',
                            code: error.code || 'INTERNAL_ERROR',
                            details: error.details,
                        },
                    },
                    { status: error.statusCode || 500 }
                ) as NextResponse<ErrorResponse>;
            }

            // Handle other errors
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: 'Internal Server Error',
                        code: 'INTERNAL_ERROR',
                    },
                },
                { status: 500 }
            ) as NextResponse<ErrorResponse>;
        }
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
    }
}
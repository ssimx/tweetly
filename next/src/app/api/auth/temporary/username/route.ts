import { verifySession, extractToken, removeSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { getErrorMessage, AppError, ErrorResponse, SuccessResponse, temporaryUserUsernameSchema, isZodError } from 'tweetly-shared';

export async function PATCH(req: NextRequest) {
    if (req.method === 'PATCH') {
        try {
            const authHeader = req.headers.get('Authorization');
            const token = await extractToken(authHeader);
            if (token) {
                const isValid = await verifySession(token);

                if (!isValid.isAuth) {
                    await removeSession();
                    throw new AppError('Invalid temporary token session', 400, 'INVALID_TOKEN');
                }
            } else {
                throw new AppError('User not logged in', 400, 'NOT_LOGGED_IN');
            }

            const body = await req.json();
            if (!body) {
                throw new AppError('User data is missing', 404, 'MISSING_DATA');
            }

            const validatedUsername = temporaryUserUsernameSchema.parse(body);

            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/auth/temporary/username`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(validatedUsername),
            });

            if (!response.ok) {
                const errorData = await response.json() as ErrorResponse;
                throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
            }

            const successResponse: SuccessResponse<undefined> = {
                success: true,
            };

            return NextResponse.json(
                successResponse,
                { status: response.status }
            );
        } catch (error: unknown) {
            // Handle validation errors
            if (isZodError(error)) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            message: 'Validation failed',
                            code: 'VALIDATION_FAILED',
                            details: error.issues,
                        },
                    },
                    { status: 403 }
                ) as NextResponse<ErrorResponse>;
            } else if (error instanceof AppError) {
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
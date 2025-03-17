import { extractToken, removeSession, removeSettingsToken, verifySession, verifySettingsToken } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { AppError, ErrorResponse, getErrorMessage, isZodError, SuccessResponse, userUpdatePasswordSchema } from 'tweetly-shared';
import { z } from "zod";

export async function PATCH(req: NextRequest) {
    if (req.method === 'PATCH') {
        const authHeader = req.headers.get('Authorization');
        const settingsHeader = req.headers.get('Settings-Token');
        const sessionToken = await extractToken(authHeader);
        const settingsToken = await extractToken(settingsHeader);
        if (sessionToken && settingsToken) {
            // Check for session validity
            const isSessionValid = await verifySession(sessionToken);
            const isSettingsTokenValid = await verifySettingsToken(settingsToken);

            if (!isSessionValid.isAuth) {
                await removeSession();
                await removeSettingsToken();
                return NextResponse.json({ message: 'Invalid session. Please re-log' }, { status: 401 });
            }

            if (!isSettingsTokenValid.isAuth) {
                await removeSettingsToken();
                return NextResponse.json({ message: 'Invalid settings token' }, { status: 401 });
            }
        } else {
            if (!sessionToken) return NextResponse.json({ message: 'Not logged in, please log in first' }, { status: 401 });
        }

        try {
            // Validate incoming data
            const body = await req.json() as z.infer<typeof userUpdatePasswordSchema>;
            const validatedData = userUpdatePasswordSchema.parse(body);

            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/users/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`,
                    'Settings-Token': `Bearer ${settingsToken}`,
                },
                body: JSON.stringify(validatedData),
            });

            if (!response.ok) {
                const errorData = await response.json() as ErrorResponse;
                throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
            }

            const successResponse: SuccessResponse<undefined> = {
                success: true,
                data: undefined
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
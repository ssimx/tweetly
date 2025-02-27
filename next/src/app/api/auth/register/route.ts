import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getErrorMessage, ApiResponse, AppError, ErrorResponse, SuccessResponse, SuccessfulRegisterResponseType, isZodError, temporaryUserBasicDataSchema, FormTemporaryUserBasicDataType, FormTemporaryUserPasswordType, temporaryUserPasswordSchema } from 'tweetly-shared';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<SuccessfulRegisterResponseType>>> {
    if (req.method === 'POST') {
        try {
            const body = await req.json() as { basicData: FormTemporaryUserBasicDataType, passwordData: FormTemporaryUserPasswordType };
            if (!body) {
                throw new AppError('Request information is missing', 404, 'MISSING_DATA');
            } else if (!body.basicData) {
                throw new AppError('Basic user information is missing', 404, 'MISSING_DATA');
            } else if (!body.passwordData) {
                throw new AppError('Password information is missing', 404, 'MISSING_DATA');
            }

            const validatedBasicData = temporaryUserBasicDataSchema.parse(body.basicData);
            const validatedPassword = temporaryUserPasswordSchema.parse(body.passwordData);

            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    basicData: validatedBasicData,
                    passwordData: validatedPassword
                }),
            });

            if (!response.ok) {
                const errorData = await response.json() as ErrorResponse;
                throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
            }

            const { data } = await response.json() as SuccessResponse<SuccessfulRegisterResponseType>;
            if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
            else if (!data.token) throw new AppError('JWT is missing in data response', 404, 'MISSING_JWT');

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
            if (isZodError(error)) {
                const err = error as z.ZodError;
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            message: 'Validation failed',
                            code: 'VALIDATION_FAILED',
                            details: err.issues
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
            const errorMessage = getErrorMessage(error);
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: errorMessage,
                        code: error instanceof Error ? error.name.toUpperCase().replaceAll(' ', '_') : 'INTERNAL_ERROR',
                    }
                },
                { status: error instanceof Error ? 400 : 500 }
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
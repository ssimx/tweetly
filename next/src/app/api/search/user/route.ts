import { NextRequest, NextResponse } from "next/server";
import { AppError, ErrorResponse, getErrorMessage, SuccessResponse, usernameOrEmailAvailibilitySchema } from 'tweetly-shared';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    if (req.method === 'GET') {
        try {
            const apiUrl = process.env.EXPRESS_API_URL;
            const searchParams = req.nextUrl.searchParams;
            const paramType = searchParams.get('type');
            const paramData = searchParams.get('data');
            if (!paramType || !paramData) return NextResponse.json({ message: 'No query provided' }, { status: 400 });

            // Decode and validate type and data
            const decodedType = decodeURIComponent(paramType);
            const decodedData = decodeURIComponent(paramData);
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

            if (!response.ok) {
                const errorData = await response.json() as ErrorResponse;
                throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
            }

            const { data } = await response.json() as SuccessResponse<{ available: boolean }>;
            if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
            else if (data.available === undefined) throw new AppError('Available property is missing in data response', 404, 'MISSING_PROPERTY');

            return NextResponse.json(
                {
                    success: true,
                    data: {
                        available: data.available
                    }
                }) as NextResponse<SuccessResponse<{ available: boolean }>>
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
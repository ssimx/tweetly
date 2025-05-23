import { extractToken, removeSession, verifySession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { searchSchema } from "@/lib/schemas";
import { AppError, ErrorResponse, getErrorMessage, SearchQuerySegmentsType, SuccessResponse, UserDataType } from 'tweetly-shared';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    if (req.method === 'GET') {
        const authHeader = req.headers.get('Authorization');
        const token = await extractToken(authHeader);
        if (token) {
            const isValid = await verifySession(token);
            if (!isValid.isAuth) {
                await removeSession();
                return NextResponse.json({ message: 'Invalid session. Please re-log' }, { status: 400 });
            }
        } else {
            return NextResponse.json({ message: 'Not logged in, please log in first' }, { status: 401 });
        }

        try {
            const apiUrl = process.env.EXPRESS_API_URL;
            const searchParams = req.nextUrl.searchParams;
            const query = searchParams.get('q');
            if (!query) throw new AppError('Search query is missing', 404, 'MISSING_QUERY');

            // Decode query before validation
            const decodedSearch = decodeURIComponent(query);
            searchSchema.parse({ q: decodedSearch });

            // Encode query for API requests
            const encodedSearch = encodeURIComponent(decodedSearch);

            // Proceed with API request if valid
            const response = await fetch(`${apiUrl}/search/users?q=${encodedSearch}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json() as ErrorResponse;
                throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
            }

            const { data } = await response.json() as SuccessResponse<{ users: UserDataType[], queryParams: SearchQuerySegmentsType }>;
            if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
            else if (data.users === undefined) throw new AppError('Users property is missing in data response', 404, 'MISSING_PROPERTY');
            else if (data.queryParams === undefined) throw new AppError('Query params property is missing in data response', 404, 'MISSING_PROPERTY');

            const successResponse: SuccessResponse<{ users: UserDataType[], queryParams: SearchQuerySegmentsType }> = {
                success: true,
                data: {
                    users: data.users,
                    queryParams: data.queryParams
                }
            };

            return NextResponse.json(
                successResponse,
                { status: response.status }
            );
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
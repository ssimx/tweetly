import { extractToken, removeSession, verifySession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { AppError, BasePostDataType, ErrorResponse, getErrorMessage, SuccessResponse } from 'tweetly-shared';

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
            const cursor = searchParams.get('cursor');
            const type = searchParams.get('type');

            if (cursor !== null && type !== null) {
                const response = await fetch(`${apiUrl}/posts/feed/global?cursor=${cursor}&type=${type}`, {
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

                const { data } = await response.json() as SuccessResponse<{ posts: BasePostDataType[], end: boolean }>;
                if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
                else if (data.posts === undefined) throw new AppError('Posts property is missing in data response', 404, 'MISSING_PROPERTY');

                if (type === 'new' && !isNaN(Number(cursor))) {
                    // for new posts with cursor, end is determined by posts that are already saved in the array from before
                    const successResponse: SuccessResponse<{ posts: BasePostDataType[] }> = {
                        success: true,
                        data: {
                            posts: data.posts,
                        }
                    };

                    return NextResponse.json(
                        successResponse,
                        { status: response.status }
                    );
                } else if (type === 'new' && cursor === 'null') {
                    // for new posts that didn't have prior saved posts so there was no cursor to fetch from
                    //      -> if there's more new posts than fetched, end should be set to false
                    const successResponse: SuccessResponse<{ posts: BasePostDataType[], end: boolean }> = {
                        success: true,
                        data: {
                            posts: data.posts,
                            end: data.end ?? true
                        }
                    };

                    return NextResponse.json(
                        successResponse,
                        { status: response.status }
                    );
                }

                const successResponse: SuccessResponse<{ posts: BasePostDataType[], end: boolean }> = {
                    success: true,
                    data: {
                        posts: data.posts,
                        end: data.end ?? true
                    }
                };

                return NextResponse.json(
                    successResponse,
                    { status: response.status }
                );
            } else {
                const response = await fetch(`${apiUrl}/posts/feed/global`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                })

                if (!response.ok) {
                    const errorData = await response.json() as ErrorResponse;
                    throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
                }

                const { data } = await response.json() as SuccessResponse<{ posts: BasePostDataType[], end: boolean }>;
                if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
                else if (data.posts === undefined) throw new AppError('Likes property is missing in data response', 404, 'MISSING_PROPERTY');

                const successResponse: SuccessResponse<{ posts: BasePostDataType[], end: boolean }> = {
                    success: true,
                    data: {
                        posts: data.posts,
                        end: data.end ?? true
                    }
                };

                return NextResponse.json(
                    successResponse,
                    { status: response.status }
                );
            }
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
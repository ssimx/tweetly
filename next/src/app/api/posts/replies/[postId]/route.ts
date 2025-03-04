import { extractToken, removeSession, verifySession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { AppError, ErrorResponse, getErrorMessage, SuccessResponse, VisitedPostDataType } from 'tweetly-shared';

export async function GET(req: NextRequest, props: { params: Promise<{ postId: number }> }) {
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
            const params = await props.params;
            const postId = params.postId;

            if (cursor !== null) {
                const response = await fetch(`${apiUrl}/posts/postReplies/${postId}?cursor=${cursor}`, {
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

                const { data } = await response.json() as SuccessResponse<{ replies: Pick<VisitedPostDataType, 'replies'>['replies'] }>;
                if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
                else if (!data.replies) throw new AppError('Posts property is missing in data response', 404, 'MISSING_PROPERTY');

                const successResponse: SuccessResponse<{ replies: Pick<VisitedPostDataType, 'replies'>['replies'] }> = {
                    success: true,
                    data: {
                        replies: {
                            posts: data.replies.posts,
                            cursor: data.replies.cursor,
                            end: data.replies.end
                        }
                    }
                };

                return NextResponse.json(
                    successResponse,
                    { status: response.status }
                );
            } else {
                const response = await fetch(`${apiUrl}/posts/postReplies/${postId}`, {
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

                const { data } = await response.json() as SuccessResponse<{ replies: Pick<VisitedPostDataType, 'replies'>['replies'] }>;
                if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
                else if (!data.replies) throw new AppError('Posts property is missing in data response', 404, 'MISSING_PROPERTY');

                const successResponse: SuccessResponse<{ replies: Pick<VisitedPostDataType, 'replies'>['replies'] }> = {
                    success: true,
                    data: {
                        replies: {
                            posts: data.replies.posts,
                            cursor: data.replies.cursor,
                            end: data.replies.end
                        }
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
};
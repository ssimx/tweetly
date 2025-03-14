import { verifySession, extractToken, removeSession, decryptSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { AppError, ConversationMessageType, ConversationType, ErrorResponse, getErrorMessage, LoggedInUserJwtPayload, SuccessResponse } from 'tweetly-shared';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, props: { params: Promise<{ conversationId: string }> }) {
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
            const params = await props.params;
            const searchParams = req.nextUrl.searchParams;
            const cursor = searchParams.get('cursor');
            const type = searchParams.get('type');

            if (cursor !== null) {
                if (type === 'old') {
                    const response = await fetch(`${apiUrl}/conversations/${params.conversationId}?cursor=${cursor}&type=old`, {
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

                    const { data } = await response.json() as SuccessResponse<{ messages: ConversationMessageType[], cursor: string | null, topReached: boolean }>;
                    if (data === undefined) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
                    else if (data.messages === undefined) throw new AppError('Messages property is missing in data response', 404, 'MISSING_PROPERTY');
                    else if (data.cursor === undefined) throw new AppError('Cursor property is missing in data response', 404, 'MISSING_PROPERTY');

                    const successResponse: SuccessResponse<{ messages: ConversationMessageType[], cursor: string | null, topReached: boolean }> = {
                        success: true,
                        data: {
                            messages: data.messages,
                            cursor: data.cursor ?? null,
                            topReached: data.topReached ?? true,
                        }
                    };

                    return NextResponse.json(
                        successResponse,
                        { status: response.status }
                    );
                } else if (type === 'new') {
                    const response = await fetch(`${apiUrl}/conversations/${params.conversationId}?cursor=${cursor}&type=new`, {
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

                    const { data } = await response.json() as SuccessResponse<{ messages: ConversationMessageType[], cursor: string | null, bottomReached: boolean }>;
                    if (data === undefined) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
                    else if (data.messages === undefined) throw new AppError('Messages property is missing in data response', 404, 'MISSING_PROPERTY');
                    else if (data.cursor === undefined) throw new AppError('Cursor property is missing in data response', 404, 'MISSING_PROPERTY');

                    const successResponse: SuccessResponse<{ messages: ConversationMessageType[], cursor: string | null, bottomReached: boolean }> = {
                        success: true,
                        data: {
                            messages: data.messages,
                            cursor: data.cursor ?? null,
                            bottomReached: data.bottomReached ?? true,
                        }
                    };

                    return NextResponse.json(
                        successResponse,
                        { status: response.status }
                    );
                } else {
                    throw new AppError('Incorrect cursor type', 401, 'INCORRECT_TYPE');
                }
            } else {
                const response = await fetch(`${apiUrl}/conversations/${params.conversationId}`, {
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

                const { data } = await response.json() as SuccessResponse<{ conversation: ConversationType }>;
                if (data === undefined) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
                else if (data.conversation === undefined) throw new AppError('Conversation property is missing in data response', 404, 'MISSING_PROPERTY');

                const payload = await decryptSession(token) as LoggedInUserJwtPayload;
                if (!data.conversation.participants.some(participant => participant.username === payload.username)) {
                    throw new AppError('User unauthorized to view the conversation', 403, 'UNAUTHORIZED')
                };

                const successResponse: SuccessResponse<{ conversation: ConversationType }> = {
                    success: true,
                    data: {
                        conversation: data.conversation,
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
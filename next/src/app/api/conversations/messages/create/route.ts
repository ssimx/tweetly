import { extractToken, removeSession, verifySession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { AppError, ConversationMessageType, ErrorResponse, getErrorMessage, isZodError, newMessageDataSchema, SuccessResponse } from 'tweetly-shared';

export async function POST(req: NextRequest) {
    if (req.method === 'POST') {
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
            let text: string | undefined = undefined;
            let images: File[] | undefined = [];
            let conversationId: string | undefined = undefined;
            const contentType = req.headers.get("content-type");
            let formData: FormData;

            // Only parse formData if request contains multipart/form-data
            if (contentType && contentType.includes("multipart/form-data")) {
                formData = await req.formData();
                text = formData.get('text') as string | undefined ?? undefined;
                images = formData.getAll('images') as File[] | undefined;
                conversationId = formData.get('conversationId') as string | undefined ?? undefined;
            } else {
                throw new AppError('Incorrect content type', 400, 'INCORRECT_CONTENT_TYPE');
            }

            newMessageDataSchema.parse({ text, images, conversationId });

            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/conversations/messages/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json() as ErrorResponse;
                throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
            }

            const { data } = await response.json() as SuccessResponse<{ message: ConversationMessageType }>;
            if (data === undefined) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
            else if (data.message === undefined) throw new AppError('Message property is missing in data response', 404, 'MISSING_PROPERTY');

            const successResponse: SuccessResponse<{ message: ConversationMessageType }> = {
                success: true,
                data: {
                    message: data.message,
                }
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
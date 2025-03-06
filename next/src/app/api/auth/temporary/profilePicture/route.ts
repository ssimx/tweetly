import { verifySession, extractToken, removeSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { getErrorMessage, AppError, ErrorResponse, SuccessResponse, temporaryUserProfilePictureSchema } from 'tweetly-shared';

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

            let image = null;
            const contentType = req.headers.get("content-type");
            // Only parse formData if request contains multipart/form-data
            if (contentType && contentType.includes("multipart/form-data")) {
                const body = await req.formData();
                image = body.get("image") ?? null;

                if (image) {
                    temporaryUserProfilePictureSchema.parse({ image });
                }
            }

            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/auth/temporary/profilePicture`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                ...(image && {
                    body: (() => {
                        const newFormData = new FormData();
                        newFormData.append('image', image);
                        return newFormData;
                    })(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json() as ErrorResponse;
                throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
            }

            const { data } = await response.json() as SuccessResponse<{ token: string }>;
            if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
            else if (!data.token) throw new AppError('JWT is missing in data response', 404, 'MISSING_JWT');

            const successResponse: SuccessResponse<{ token: string }> = {
                success: true,
                data: {
                    token: data.token
                }
            };

            return NextResponse.json(
                successResponse,
                { status: response.status }
            );
        } catch (error: unknown) {
            console.log(error)
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
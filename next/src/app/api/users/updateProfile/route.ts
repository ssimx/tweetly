import { extractToken, removeSession, verifySession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { AppError, ErrorResponse, getErrorMessage, isZodError, LoggedInUserDataType, SuccessResponse, userUpdateProfileSchema } from 'tweetly-shared';

export async function PATCH(req: NextRequest) {
    if (req.method === 'PATCH') {
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
            let name: string | undefined = undefined;
            let bio: string | undefined = undefined;
            let location: string | undefined = undefined;
            let website: string | undefined = undefined;
            let profilePicture: File | undefined = undefined;
            let bannerPicture: File | undefined = undefined;
            let removeProfilePicture = 'false';
            let removeBannerPicture = 'false';

            const contentType = req.headers.get("content-type");
            let formData: FormData;
            // Only parse formData if request contains multipart/form-data
            if (contentType && contentType.includes("multipart/form-data")) {
                formData = await req.formData();
                name = formData.get('name') as string ?? undefined;
                bio = formData.get('bio') as string ?? undefined;
                location = formData.get('text') as string ?? undefined;
                website = formData.get('text') as string ?? undefined;
                profilePicture = formData.get('profilePicture') as File ?? undefined;
                bannerPicture = formData.get('bannerPicture') as File ?? undefined;
                removeProfilePicture = formData.get('removeProfilePicture') as string;
                removeBannerPicture = formData.get('removeBannerPicture') as string;
            } else {
                throw new AppError('Incorrect content type', 400, 'INCORRECT_CONTENT_TYPE');
            }

            userUpdateProfileSchema.parse({
                name,
                bio,
                location,
                website,
                profilePicture,
                removeProfilePicture: Boolean(removeProfilePicture),
                bannerPicture,
                removeBannerPicture: Boolean(removeBannerPicture)
            });

            // send PATCH request to the backend
            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/users/updateProfile`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json() as ErrorResponse;
                throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
            }

            const { data } = await response.json() as SuccessResponse<{ profile: Pick<LoggedInUserDataType, 'profile'>['profile'] }>;
            if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
            else if (data.profile === undefined) throw new AppError('Profile property is missing in data response', 404, 'MISSING_PROPERTY');

            const successResponse: SuccessResponse<{ profile: Pick<LoggedInUserDataType, 'profile'>['profile'] }> = {
                success: true,
                data: {
                    profile: data.profile,
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
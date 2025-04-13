import 'server-only';
import { getCurrentTemporaryUserToken, getCurrentUserToken } from './auth';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getErrorMessage, ApiResponse, AppError, ErrorResponse, LoggedInTemporaryUserDataType, LoggedInUserDataType, SuccessResponse, UserDataType, BasePostDataType, NotificationType, ConversationCardType, ConversationType, LoggedInUserJwtPayload, } from 'tweetly-shared';
import { decryptSession, getUserSessionToken, verifySession } from '@/lib/session';

const apiRouteUrl = process.env.API_ROUTE_URL;

// ---------------------------------------------------------------------------------------------------------

export const getTemporaryUser = async (): Promise<ApiResponse<{ user: LoggedInTemporaryUserDataType | null }>> => {
    const sessionToken = await getUserSessionToken();
    if ((await verifySession(sessionToken)).isAuth) redirect('/');

    const temporaryToken = await getCurrentTemporaryUserToken();
    if (!temporaryToken) {
        return {
            success: true,
            data: {
                user: null,
            }
        }
    };

    try {
        const response = await fetch(`${apiRouteUrl}/users/temporary`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${temporaryToken}`,
            },
            next: { tags: ['temporaryUser'] }
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        const { data } = await response.json() as SuccessResponse<{ user: LoggedInTemporaryUserDataType }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (!data.user) throw new AppError('User information is missing in data response', 404, 'MISSING_USER_INFO');

        const successResponse: SuccessResponse<{ user: LoggedInTemporaryUserDataType }> = {
            success: true,
            data: data
        };

        return successResponse;
    } catch (error: unknown) {
        if (error instanceof AppError) {
            return {
                success: false,
                error: {
                    message: error.message || 'Internal Server Error',
                    code: error.code || 'INTERNAL_ERROR',
                }
            } as ErrorResponse;
        }

        // Handle other errors
        const errorMessage = getErrorMessage(error);
        return {
            success: false,
            error: {
                message: errorMessage,
                code: error instanceof Error ? error.name.toUpperCase().replaceAll(' ', '_') : 'INTERNAL_ERROR',
            }
        } as ErrorResponse;
    }
};

export const getLoggedInUser = cache(async (): Promise<ApiResponse<{ user: LoggedInUserDataType }>> => {
    const token = await getCurrentUserToken();
    const payload = await decryptSession(token) as LoggedInUserJwtPayload;

    try {
        const response = await fetch(`${apiRouteUrl}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            next: { tags: ['loggedInUser'] },
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        const { data } = await response.json() as SuccessResponse<{ user: LoggedInUserDataType }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (!data.user) throw new AppError('User data is missing in data response', 404, 'MISSING_USER_DATA');

        if (data.user.username !== payload?.username) redirect('/logout');

        return {
            success: true,
            data: {
                user: data.user
            }
        }
    } catch (error: unknown) {
        if (error instanceof AppError) {
            return {
                success: false,
                error: {
                    message: error.message || 'Internal Server Error',
                    code: error.code || 'INTERNAL_ERROR',
                }
            } as ErrorResponse;
        }

        // Handle other errors
        const errorMessage = getErrorMessage(error);
        return {
            success: false,
            error: {
                message: errorMessage,
                code: error instanceof Error ? error.name.toUpperCase().replaceAll(' ', '_') : 'INTERNAL_ERROR',
            }
        } as ErrorResponse;
    }
});

// ---------------------------------------------------------------------------------------------------------

export async function getNotifications(): Promise<ApiResponse<{ notifications: NotificationType[], cursor: number | null, end: boolean }>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`${apiRouteUrl}/users/notifications`, {
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

        const { data } = await response.json() as SuccessResponse<{ notifications: NotificationType[], cursor: number | null, end: boolean }>;
        if (data === undefined) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.notifications === undefined) throw new AppError('Replies property is missing in data response', 404, 'MISSING_PROPERTY');
        else if (data.cursor === undefined) throw new AppError('Cursor property is missing in data response', 404, 'MISSING_PROPERTY');

        return {
            success: true,
            data: {
                notifications: data.notifications,
                cursor: data.cursor ?? null,
                end: data.end ?? true,
            },
        }
    } catch (error: unknown) {
        if (error instanceof AppError) {
            return {
                success: false,
                error: {
                    message: error.message || 'Internal Server Error',
                    code: error.code || 'INTERNAL_ERROR',
                    details: error.details,
                }
            } as ErrorResponse;
        }

        // Handle other errors
        return {
            success: false,
            error: {
                message: 'Internal Server Error',
                code: 'INTERNAL_ERROR',
            },
        };
    }
};

export async function getBookmarks(): Promise<ApiResponse<{ bookmarks: BasePostDataType[], cursor: number | null, end: boolean }>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`${apiRouteUrl}/posts/bookmarks`, {
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

        const { data } = await response.json() as SuccessResponse<{ bookmarks: BasePostDataType[], cursor: number | null, end: boolean }>;
        if (data === undefined) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.bookmarks === undefined) throw new AppError('Bookmarks property is missing in data response', 404, 'MISSING_PROPERTY');
        else if (data.cursor === undefined) throw new AppError('Cursor property is missing in data response', 404, 'MISSING_PROPERTY');

        return {
            success: true,
            data: {
                bookmarks: data.bookmarks,
                cursor: data.cursor ?? null,
                end: data.end ?? true,
            },
        }
    } catch (error: unknown) {
        if (error instanceof AppError) {
            return {
                success: false,
                error: {
                    message: error.message || 'Internal Server Error',
                    code: error.code || 'INTERNAL_ERROR',
                    details: error.details,
                }
            } as ErrorResponse;
        }

        // Handle other errors
        return {
            success: false,
            error: {
                message: 'Internal Server Error',
                code: 'INTERNAL_ERROR',
            },
        };
    }
};

export async function getConversations(): Promise<ApiResponse<{ conversations: ConversationCardType[], cursor: string | null, end: boolean }>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`${apiRouteUrl}/conversations`, {
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

        const { data } = await response.json() as SuccessResponse<{ conversations: ConversationCardType[], cursor: string | null, end: boolean }>;
        if (data === undefined) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.conversations === undefined) throw new AppError('Conversations property is missing in data response', 404, 'MISSING_PROPERTY');
        else if (data.cursor === undefined) throw new AppError('Cursor property is missing in data response', 404, 'MISSING_PROPERTY');

        return {
            success: true,
            data: {
                conversations: data.conversations,
                cursor: data.cursor ?? null,
                end: data.end ?? true,
            },
        }
    } catch (error: unknown) {
        if (error instanceof AppError) {
            return {
                success: false,
                error: {
                    message: error.message || 'Internal Server Error',
                    code: error.code || 'INTERNAL_ERROR',
                    details: error.details,
                }
            } as ErrorResponse;
        }

        // Handle other errors
        return {
            success: false,
            error: {
                message: 'Internal Server Error',
                code: 'INTERNAL_ERROR',
            },
        };
    }
};

export async function getConversationById(id: string) {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`${apiRouteUrl}/conversations/${id}`, {
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

        return {
            success: true,
            data: {
                conversation: data.conversation,
            },
        }
    } catch (error: unknown) {
        if (error instanceof AppError) {
            return {
                success: false,
                error: {
                    message: error.message || 'Internal Server Error',
                    code: error.code || 'INTERNAL_ERROR',
                    details: error.details,
                }
            } as ErrorResponse;
        }

        // Handle other errors
        return {
            success: false,
            error: {
                message: 'Internal Server Error',
                code: 'INTERNAL_ERROR',
            },
        };
    }
};

// ---------------------------------------------------------------------------------------------------------
//                                             PROFILE ACCESS
// ---------------------------------------------------------------------------------------------------------

async function authorizedToEditProfile(username: string): Promise<ApiResponse<{ authorized: boolean }>> {
    try {
        const response = await getLoggedInUser();

        if (!response.success) {
            const errorData = response as ErrorResponse;
            throw new Error(errorData.error.message);
        }

        const { data } = response as SuccessResponse<{ user: LoggedInUserDataType }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (!data.user) throw new AppError('User data is missing in data response', 404, 'MISSING_USER_DATA');

        return {
            success: true,
            data: {
                authorized: data.user.username === username
            }
        }
    } catch (error: unknown) {
        if (error instanceof AppError) {
            return {
                success: false,
                error: {
                    message: error.message || 'Internal Server Error',
                    code: error.code || 'INTERNAL_ERROR',
                }
            } as ErrorResponse;
        }

        // Handle other errors
        const errorMessage = getErrorMessage(error);
        return {
            success: false,
            error: {
                message: errorMessage,
                code: error instanceof Error ? error.name.toUpperCase().replaceAll(' ', '_') : 'INTERNAL_ERROR',
            }
        } as ErrorResponse;
    }
};

export async function getUserProfile(username: string) {
    try {
        const token = await getCurrentUserToken();
        const userProfileResponse = await fetch(`${apiRouteUrl}/users/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!userProfileResponse.ok) {
            const errorData = await userProfileResponse.json() as ErrorResponse;
            throw new AppError(errorData.error.message, userProfileResponse.status, errorData.error.code, errorData.error.details);
        }

        const { data: userProfileData } = await userProfileResponse.json() as SuccessResponse<{ user: UserDataType }>;
        if (!userProfileData) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (!userProfileData.user) throw new AppError('Profile user data is missing in data response', 404, 'MISSING_PROFILE_DATA');

        const authorizedToEditResponse = await authorizedToEditProfile(username);

        if (!authorizedToEditResponse.success) {
            const errorData = authorizedToEditResponse as ErrorResponse;
            throw new AppError(errorData.error.message, 400, errorData.error.code);
        }

        const { data: authorizedToEditData } = authorizedToEditResponse as SuccessResponse<{ authorized: boolean }>;
        if (!authorizedToEditData) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (authorizedToEditData.authorized === undefined) throw new AppError('Authorized property is missing in response data', 404, 'MISSING_PROPERTY');

        return (
            {
                success: true,
                data: {
                    user: userProfileData.user,
                    authorized: authorizedToEditData.authorized
                }
            })
    } catch (error: unknown) {
        if (error instanceof AppError) {
            return {
                success: false,
                error: {
                    message: error.message || 'Internal Server Error',
                    code: error.code || 'INTERNAL_ERROR',
                }
            } as ErrorResponse;
        }

        // Handle other errors
        const errorMessage = getErrorMessage(error);
        return {
            success: false,
            error: {
                message: errorMessage,
                code: error instanceof Error ? error.name.toUpperCase().replaceAll(' ', '_') : 'INTERNAL_ERROR',
            }
        } as ErrorResponse;
    }
};


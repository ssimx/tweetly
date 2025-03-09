import 'server-only';
import { getCurrentTemporaryUserToken, getCurrentUserToken } from './auth';
import { redirect } from 'next/navigation';
import { BookmarkPostType, ConversationsListType, ConversationType } from '@/lib/types';
import { cache } from 'react';
import { getErrorMessage, ApiResponse, AppError, ErrorResponse, LoggedInTemporaryUserDataType, LoggedInUserDataType, SuccessResponse, UserDataType, BasePostDataType, NotificationType, } from 'tweetly-shared';
import { getUserSessionToken, verifySession } from '@/lib/session';

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
        const response = await fetch('http://localhost:3000/api/users/temporary', {
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

// ---------------------------------------------------------------------------------------------------------

export const getLoggedInUser = cache(async (): Promise<ApiResponse<{ user: LoggedInUserDataType }>> => {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch('http://localhost:3000/api/users', {
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

        const response = await fetch('http://localhost:3000/api/users/notifications', {
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

        const response = await fetch('http://localhost:3000/api/posts/bookmarks', {
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

export async function getConversations() {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch('http://localhost:3000/api/conversations', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(getErrorMessage(errorData));
        }

        const conversations = await response.json() as ConversationsListType;
        return conversations;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return {
            conversations: [],
            end: true,
        };
    }
};

async function authorizedToViewConversation(username: string) {
    const loggedInUser = await getLoggedInUser();
    return loggedInUser.username === username;
};

export async function getConversationById(id: string) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/conversations/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(getErrorMessage(errorData));
        }

        const convo = await response.json() as ConversationType;
        if (!convo.conversation.participants.some(async (participant) => await authorizedToViewConversation(participant.user.username))) return redirect('/');
        return convo;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return redirect('/');
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
        const userProfileResponse = await fetch(`http://localhost:3000/api/users/${username}`, {
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


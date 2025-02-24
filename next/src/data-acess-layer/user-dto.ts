import 'server-only';
import { getCurrentTemporaryUserToken, getCurrentUserToken } from './auth';
import { getErrorMessage } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { BookmarkPostType, ConversationsListType, ConversationType, NotificationType, ProfileInfo, UserInfo } from '@/lib/types';
import { cache } from 'react';
import { ApiResponse, AppError, ErrorResponse, LoggedInTemporaryUserDataType, SuccessResponse, } from 'tweetly-shared';
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
            console.log(errorData)
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

export const getLoggedInUser = cache(async () => {
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
            const errorData = await response.json();
            throw new Error(getErrorMessage(errorData));
        }

        const user = await response.json().then((res) => {
            if (typeof res === 'object' && res !== null && 'user' in res) {
                return res.user as UserInfo;
            }
            return redirect('/logout');
        });

        return user;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return redirect('/logout');
    }
});

export async function getNotifications() {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/users/notifications/`, {
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

        const notifications = await response.json().then((res) => {
            if (typeof res === 'object' && res !== null && 'notifications' in res && 'end' in res) {
                return { notifications: res.notifications as NotificationType[], end: res.end as boolean }
            }
            return { notifications: [], end: true };
        });

        return notifications;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return undefined;
    }
};

export async function getBookmarks() {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/bookmarks/`, {
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

        const posts = await response.json().then((res) => {
            if (typeof res === 'object' && res !== null && 'posts' in res && 'end' in res) {
                return { posts: res.posts as BookmarkPostType[], end: res.end as boolean }
            }
            return { posts: [], end: true };
        });

        return posts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return undefined;
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

async function authorizedToEditProfile(username: string) {
    const loggedInUser = await getLoggedInUser();
    return loggedInUser.username === username;
};

export async function getUserProfile(username: string) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/users/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(getErrorMessage(errorData));
        }

        const profile = await response.json().then((res) => {
            if (typeof res === 'object' && res !== null && 'profile' in res) {
                return res.profile as ProfileInfo;
            }
            throw new Error(getErrorMessage('User not found'));
        });

        return { ...profile, authorized: await authorizedToEditProfile(profile.username) };
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return redirect('/');
    }
};


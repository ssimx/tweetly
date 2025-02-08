import 'server-only';
import { getCurrentUserToken } from './auth';
import { getErrorMessage } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { BasicPostType, BookmarkedPostType, BookmarkPostType, ConversationsListType, ConversationType, NotificationType, ProfileInfo, UserInfo, VisitedPostType } from '@/lib/types';
import { cache } from 'react';

export const getLoggedInUser = cache(async () => {
    const token = await getCurrentUserToken();
    
    try {
        const response = await fetch('http://localhost:3000/api/users', {
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

export async function getHomeGlobalFeed() {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/feed/global`, {
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

        const globalFeedPosts = await response.json().then((res) => {
            if (typeof res === 'object' && res !== null && 'posts' in res && 'end' in res) {
                return { posts: res.posts as BasicPostType[], end: res.end as boolean}
            }
            return { posts: [], end: true };
        });

        return globalFeedPosts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return undefined;
    }
};

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
                return { notifications: res.notifications as NotificationType[], end: res.end as boolean}
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
                return { posts: res.posts as BookmarkPostType[], end: res.end as boolean}
            }
            return { posts: [], end: true };
        });

        return posts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return [];
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

        return {...profile, authorized: await authorizedToEditProfile(profile.username)};
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return redirect('/');
    }
};

export async function getPostInfo(postId: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/get/${postId}`, {
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

        const post = await response.json() as VisitedPostType;
        return post;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return undefined;
    }
};
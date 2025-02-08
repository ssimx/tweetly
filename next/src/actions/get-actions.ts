'use server';
import { getCurrentUserToken } from "@/data-acess-layer/auth";
import { getPostInfo } from "@/data-acess-layer/user-dto";
import { BasicPostType, BookmarkPostType, NotificationType } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";

// GET actions for client/dynamic components

export async function getMorePostsForHomeGlobalFeed(postCursor: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/feed/global?cursor=${postCursor}&type=old`, {
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
            return { posts: [] as BasicPostType[], end: true };
        });

        return globalFeedPosts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: undefined, end: true };
    }
};

export async function getNewPostsForHomeGlobalFeed(postCursor?: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/feed/global?cursor=${postCursor}&type=new`, {
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
            if (typeof res === 'object' && res !== null && 'posts' in res) {
                return { posts: res.posts as BasicPostType[]}
            }
            return { posts: [] as BasicPostType[]};
        });

        console.log(globalFeedPosts)

        return globalFeedPosts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: undefined };
    }
};

export async function getHomeFollowingFeed() {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/feed/following`, {
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

        const followingFeedPosts = await response.json().then((res) => {
            if (typeof res === 'object' && res !== null && 'posts' in res && 'end' in res) {
                return { posts: res.posts as BasicPostType[], end: res.end as boolean}
            }
            return { posts: [] as BasicPostType[], end: true };
        });

        return followingFeedPosts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: undefined, end: true };
    }
};

export async function getMorePostsForHomeFollowingFeed(postCursor: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/feed/following?cursor=${postCursor}&type=old`, {
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

        const followingFeedPosts = await response.json().then((res) => {
            if (typeof res === 'object' && res !== null && 'posts' in res && 'end' in res) {
                return { posts: res.posts as BasicPostType[], end: res.end as boolean}
            }
            return { posts: [] as BasicPostType[], end: true };
        });

        return followingFeedPosts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: undefined, end: true };
    }
};

export async function getNewPostsForHomeFollowingFeed(postCursor?: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/feed/following?cursor=${postCursor}&type=new`, {
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

        const followingFeedPosts = await response.json().then((res) => {
            if (typeof res === 'object' && res !== null && 'posts' in res) {
                return { posts: res.posts as BasicPostType[]}
            }
            return { posts: [] as BasicPostType[]};
        });

        console.log(followingFeedPosts)

        return followingFeedPosts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: undefined };
    }
};

export async function getPostInformation(postId: number) {
    return await getPostInfo(postId);
};

export async function getMoreRepliesForPost(postId: number, replyCursor: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/replies/${postId}?cursor=${replyCursor}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-cache',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(getErrorMessage(errorData));
        }        
        
        const moreReplies = await response.json().then((res) => {
            if (typeof res === 'object' && res !== null && 'replies' in res && 'end' in res) {
                return { posts: res.replies as BasicPostType[], end: res.end as boolean}
            }
            return { posts: [] as BasicPostType[], end: true };
        });
        return moreReplies;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: undefined, end: true };
    }
};

export async function getMoreNotifications(notificationCursor: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/users/notifications?cursor=${notificationCursor}`, {
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
            return { notifications: [] as NotificationType[], end: true };
        });

        return notifications;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { notifications: undefined, end: true };
    }
};

export async function getMoreBookmarks(cursor: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/bookmarks?cursor=${cursor}`, {
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
            return { posts: [] as BookmarkPostType[], end: true };
        });

        return posts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: undefined, end: true };
    }
};

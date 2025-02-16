'use server';
import { getCurrentUserToken } from "@/data-acess-layer/auth";
import { getLoggedInUser } from "@/data-acess-layer/user-dto";
import { BasicPostType, BookmarkPostType, NotificationType, ProfilePostOrRepostType, ProfileReplyPostType, UserInfoType, VisitedPostType } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";
import { cache } from 'react';

// GET actions for client/dynamic components

// GLOBAL/FOLLOWING FEED

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
            throw new Error('Invalid response format');
        });

        return globalFeedPosts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: null, end: true };
    }
};

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
            throw new Error('Invalid response format');
        });

        return globalFeedPosts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: null, end: true };
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
            throw new Error('Invalid response format');
        });

        console.log(globalFeedPosts)

        return globalFeedPosts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: null };
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
            throw new Error('Invalid response format');
        });

        return followingFeedPosts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: null, end: true };
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
            throw new Error('Invalid response format');
        });

        return followingFeedPosts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: null, end: true };
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
            throw new Error('Invalid response format');
        });

        console.log(followingFeedPosts)

        return followingFeedPosts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: null };
    }
};

// POSTS

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
            if (typeof res === 'object' && res !== null && 'posts' in res && 'end' in res) {
                return { posts: res.posts as BasicPostType[], end: res.end as boolean}
            }
            throw new Error('Invalid response format');
        });
        return moreReplies;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: null, end: true };
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
            throw new Error('Invalid response format');
        });

        return notifications;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: null, end: true };
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
            throw new Error('Invalid response format');
        });

        return posts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: undefined, end: true };
    }
};

export async function getExplorePosts() {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/explore/`, {
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
            if (typeof res === 'object' && res !== null && 'posts' in res) {
                return { posts: res.posts as BasicPostType[] };
            }
            throw new Error('Invalid response format');
        });

        return posts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: null };
    }
};

export async function getSearchUsersAndPosts(encodedSearch: string) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/search?q=${encodedSearch}`, {
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
            if (typeof res === 'object' && res !== null && 'users' in res && 'posts' in res && 'searchSegments' in res && 'end' in res) {
                return { users: res.users as UserInfoType[], posts: res.posts as BasicPostType[], searchSegments: res.searchSegments as string[], end: res.end as boolean };
            }
            throw new Error('Invalid response format');
        });

        return posts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { users: null, posts: null, searchSegments: null, end: true };
    }
};

export async function getMoreSearchPosts(encodedSearch: string, cursor: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/search/posts?q=${encodedSearch}&cursor=${cursor}`, {
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
                return { posts: res.posts as BasicPostType[], end: res.end as boolean};
            }
            throw new Error('Invalid response format');
        });

        return posts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: null, end: true };
    }
};

// MISC

export const getTrendingHashtags = cache(async () => {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch('http://localhost:3000/api/posts/trending', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            next: { revalidate: 300 } // revalidate every 5 min, no need to revalidate on every new post to avoid spam
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(getErrorMessage(errorData));
        }

        const hashtags = await response.json().then((res) => {
            if (typeof res === 'object' && res !== null && 'hashtags' in res) {
                return res.hashtags as TrendingHashtagType[];
            }
            return [];
        });
        return hashtags;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return [];
    }
});

export const getFollowSuggestions = cache(async () => {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch('http://localhost:3000/api/users/followSuggestions', {
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

        const followSuggestions = await response.json() as FollowSuggestionType[];
        const mappedUsers: FollowSuggestionType[] = followSuggestions.map((user: Omit<FollowSuggestionType, 'isFollowing'>) => {
            return { ...user, isFollowed: false };
        });

        return mappedUsers;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error('Error fetching trending hashtags:', errorMessage);
        return [];
    }
});

// LOGGED IN USER

export async function fetchLoggedInUser() {
    return await getLoggedInUser();
};

// ---------------------------------------------------------------------------------------------------------
//                                             PROFILE ACTIONS
// ---------------------------------------------------------------------------------------------------------

export async function getPostsForProfile(profileUsername: string) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/userPosts/${profileUsername}`, {
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
                return { posts: res.posts as ProfilePostOrRepostType[], end: res.end as boolean}
            }
            return { posts: [] as ProfilePostOrRepostType[], end: true };
        });

        return posts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: null, end: true };
    }
};

export async function getRepostsForProfile(profileUsername: string) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/userReposts/${profileUsername}`, {
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
                return { posts: res.posts as ProfilePostOrRepostType[], end: res.end as boolean}
            }
            return { posts: [] as ProfilePostOrRepostType[], end: true };
        });

        return posts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: null, end: true };
    }
};

export async function getRepliesForProfile(profileUsername: string) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/userReplies/${profileUsername}`, {
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
                return { posts: res.posts as ProfileReplyPostType[], end: res.end as boolean}
            }
            return { posts: [] as ProfileReplyPostType[], end: true };
        });

        return posts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: null, end: true };
    }
};

export async function getMediaForProfile(profileUsername: string) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/userMedia/${profileUsername}`, {
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
                return { posts: res.posts as BasicPostType[], end: res.end as boolean}
            }
            throw new Error('Invalid response format');
        });

        return posts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: null, end: true };
    }
};

export async function getLikesForProfile(profileUsername: string) {
    const user = await getLoggedInUser();
    const token = await getCurrentUserToken();

    try {
        if (user.username !== profileUsername) throw new Error(getErrorMessage("Profile user doesn't match logged in user"));

        const response = await fetch(`http://localhost:3000/api/posts/userLikes`, {
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
                return { posts: res.posts as ProfileLikePostType[], end: res.end as boolean}
            }
            return { posts: [] as ProfileLikePostType[], end: true };
        });

        return posts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: null, end: true };
    }
};

export async function getMorePostsForProfile(profileUsername: string, postCursor: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/userPosts/${profileUsername}?cursor=${postCursor}`, {
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
                return { posts: res.posts as ProfilePostOrRepostType[], end: res.end as boolean}
            }
            return { posts: [] as ProfilePostOrRepostType[], end: true };
        });

        return globalFeedPosts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: undefined, end: true };
    }
};

export async function getMoreRepostsForProfile(profileUsername: string, postCursor: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/userReposts/${profileUsername}?cursor=${postCursor}`, {
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
                return { posts: res.posts as ProfilePostOrRepostType[], end: res.end as boolean}
            }
            return { posts: [] as ProfilePostOrRepostType[], end: true };
        });

        return globalFeedPosts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: undefined, end: true };
    }
};

export async function getMoreRepliesForProfile(profileUsername: string, postCursor: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/userReplies/${profileUsername}?cursor=${postCursor}`, {
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
                return { posts: res.posts as ProfileReplyPostType[], end: res.end as boolean}
            }
            return { posts: [] as ProfileReplyPostType[], end: true };
        });

        return globalFeedPosts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: undefined, end: true };
    }
};

export async function getMoreMediaForProfile(profileUsername: string, postCursor: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/userMedia/${profileUsername}?cursor=${postCursor}`, {
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
            throw new Error('Invalid response format');
        });

        return globalFeedPosts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: undefined, end: true };
    }
};

export async function getMoreLikesForProfile(profileUsername: string, postCursor: number) {
    const user = await getLoggedInUser();
    const token = await getCurrentUserToken();

    try {
        if (user.username !== profileUsername) throw new Error(getErrorMessage("Profile user doesn't match with logged in user"));

        const response = await fetch(`http://localhost:3000/api/posts/userLikes?cursor=${postCursor}`, {
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
                return { posts: res.posts as ProfileLikePostType[], end: res.end as boolean}
            }
            return { posts: [] as ProfileLikePostType[], end: true };
        });

        return globalFeedPosts;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return { posts: undefined, end: true };
    }
};
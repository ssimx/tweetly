import 'server-only';
import { getCurrentUserToken } from './auth';
import { getErrorMessage } from '@/lib/utils';
import { FollowSuggestionType, TrendingHashtagType } from '@/lib/types';

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
                return res.posts as PostType[];
            }
            return [];
        });

        return posts;
    } catch (error) {
        
    }
};

export async function getTrendingHashtags() {
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
};

export async function getFollowSuggestions() {
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
            return { ...user, isFollowing: false };
        });

        return mappedUsers;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error('Error fetching trending hashtags:', errorMessage);
        return [];
    }
};

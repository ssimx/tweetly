'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { ApiResponse, AppError, BasePostDataType, ErrorResponse } from 'tweetly-shared';
import { useUserContext } from './UserContextProvider';
import { bookmarkPost, likePost, pinPost, removeBookmarkPost, removeLikePost, removePost, removeRepostPost, repostPost, unpinPost } from '@/actions/actions';
import { socket } from '@/lib/socket';

type PostInteractionType = {
    reposted: boolean,
    liked: boolean,
    bookmarked: boolean,
    pinned: boolean,
    deleted: boolean,
    repostsCount: number,
    likesCount: number,
};

type PostInteractionContextType = {
    getPostInteraction: (postId: number) => PostInteractionType | null,
    updatePostInteraction: (postId: number, interaction: Partial<PostInteractionType>) => void,
};

const PostInteractionContext = createContext<PostInteractionContextType>({
    getPostInteraction: () => null,
    updatePostInteraction: () => { },
});

export const usePostInteractionContext = () => {
    const context = useContext(PostInteractionContext);
    if (!context) {
        throw new Error('usePostInteractionContext must be used within PostInteractionContextProvider');
    }
    return context;
};

export default function PostInteractionContextProvider({ children }: { children: React.ReactNode }) {
    const [interactedPosts, setInteractedPosts] = useState<Map<number, PostInteractionType>>(new Map());

    const getPostInteraction = useCallback((postId: number) => {
        return interactedPosts.get(postId) || null;
    }, [interactedPosts]);

    const updatePostInteraction = useCallback((postId: number, update: Partial<PostInteractionType>) => {
        setInteractedPosts(prev => {
            const newMap = new Map(prev);
            const current = newMap.get(postId) || {
                reposted: false,
                liked: false,
                bookmarked: false,
                pinned: false,
                deleted: false,
                repostsCount: 0,
                likesCount: 0
            };

            newMap.set(postId, { ...current, ...update });

            // Limit map size to 1000 entries
            if (newMap.size > 1000) {
                const oldestKey = Array.from(newMap.keys())[0];
                newMap.delete(oldestKey);
            }

            return newMap;
        });
    }, []);

    return (
        <PostInteractionContext.Provider value={{ getPostInteraction, updatePostInteraction }}>
            {children}
        </PostInteractionContext.Provider>
    )
}


// Type for the hook return value
type PostInteractionHookResultType = {
    interaction: PostInteractionType,
    toggleRepost: () => Promise<ApiResponse<undefined>>,
    toggleLike: () => Promise<ApiResponse<undefined>>,
    toggleBookmark: () => Promise<ApiResponse<undefined>>,
    togglePin: () => Promise<ApiResponse<undefined>>,
    deletePost: () => Promise<ApiResponse<undefined>>,
};

// Custom hook to handle post interactions
export function usePostInteraction(post: BasePostDataType): PostInteractionHookResultType {
    const { getPostInteraction, updatePostInteraction } = useContext(PostInteractionContext);
    const { loggedInUser } = useUserContext();

    // Initialize from post data or get from context if available
    const storedInteraction = getPostInteraction(post.id);

    const initialState = {
        reposted: storedInteraction?.reposted ?? post.relationship.viewerHasReposted,
        liked: storedInteraction?.liked ?? post.relationship.viewerHasLiked,
        bookmarked: storedInteraction?.bookmarked ?? post.relationship.viewerHasBookmarked,
        repostsCount: storedInteraction?.repostsCount ?? post.stats.repostsCount,
        likesCount: storedInteraction?.likesCount ?? post.stats.likesCount,
        pinned: storedInteraction?.pinned ?? post.pinnedOnProfile,
        deleted: storedInteraction?.deleted ?? post.isDeleted,
    };

    /*
        * Generic function to handle all types of post interactions
        * Implements the optimistic UI update pattern:
        * 1. Update UI immediately (optimistically)
        * 2. Send request to server
        * 3. If successful, keep the optimistic update
        * 4. If failed, revert to previous state
    */
    const handleInteraction = async (type: 'repost' | 'like' | 'bookmark' | 'pin' | 'delete', isAdding: boolean): Promise<ApiResponse<undefined>> => {
        const currentState = getPostInteraction(post.id) || initialState;

        // Prepare update based on action type
        const update: Partial<PostInteractionType> = { ...currentState };

        if (type === 'repost') {
            update.reposted = isAdding;
            update.repostsCount = isAdding ? currentState.repostsCount + 1 : currentState.repostsCount - 1;
        } else if (type === 'like') {
            update.liked = isAdding;
            update.likesCount = isAdding ? currentState.likesCount + 1 : currentState.likesCount - 1;
        } else if (type === 'bookmark') {
            update.bookmarked = isAdding;
        } else if (type === 'pin') {
            if (post.author.username === loggedInUser.username) {
                update.pinned = isAdding;
            } else {
                return {
                    success: false,
                    error: {
                        message: 'Unauthorized',
                        code: 'ANAUTHORIZED',
                    },
                };
            }
        } else if (type === 'delete') {
            if (post.author.username === loggedInUser.username) {
                update.deleted = true;
            } else {
                return {
                    success: false,
                    error: {
                        message: 'Unauthorized',
                        code: 'ANAUTHORIZED',
                    },
                };
            }
        }

        // Optimistic update
        updatePostInteraction(post.id, update);

        try {
            // API call based on action
            let response: ApiResponse<undefined> = { success: false, error: { message: 'Internal Server Error', code: 'INTERNAL_ERROR' } };

            if (isAdding) {
                switch (type) {
                    case 'repost': response = await repostPost(post.id); break;
                    case 'like': response = await likePost(post.id); break;
                    case 'bookmark': response = await bookmarkPost(post.id); break;
                    case 'pin': response = await pinPost(post.id); break;
                    case 'delete': response = await removePost(post.id); break;
                    default: break;
                }
            } else {
                switch (type) {
                    case 'repost': response = await removeRepostPost(post.id); break;
                    case 'like': response = await removeLikePost(post.id); break;
                    case 'bookmark': response = await removeBookmarkPost(post.id); break;
                    case 'pin': response = await unpinPost(post.id); break;
                    default: break;
                }
            }

            if (!response.success) {
                throw new AppError(response.error.message, 400, response.error.code);
            }

            // Update notifications if needed
            if (type !== 'bookmark') {
                socket.emit('new_user_notification', loggedInUser.id);
            }

            return {
                success: true,
                data: undefined
            }
        } catch (error) {
            // Revert optimistic update on error
            const revertUpdate = { ...currentState };
            updatePostInteraction(post.id, revertUpdate);

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

    return {
        interaction: getPostInteraction(post.id) || initialState,
        toggleRepost: () => handleInteraction('repost', !initialState.reposted),
        toggleLike: () => handleInteraction('like', !initialState.liked),
        toggleBookmark: () => handleInteraction('bookmark', !initialState.bookmarked),
        togglePin: () => handleInteraction('pin', !initialState.pinned),
        deletePost: () => handleInteraction('delete', !initialState.deleted),
    };
}
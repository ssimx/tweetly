'use server';

import { getCurrentUserToken } from '@/data-acess-layer/auth';
import { decryptSession } from '@/lib/session';
import { ApiResponse, BasePostDataType, ErrorResponse, AppError, SuccessResponse, LoggedInUserJwtPayload, ProfilePostOrRepostDataType, getErrorMessage, FormNewPostDataType, isZodError, newPostDataSchema } from 'tweetly-shared';

// ---------------------------------------------------------------------------------------------------------
// ---------------------------------------------- FEED POSTS -----------------------------------------------
// ---------------------------------------------------------------------------------------------------------

export async function getHomeGlobalFeed(): Promise<ApiResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://localhost:3000/api/posts/feed/global`, {
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

        const { data } = await response.json() as SuccessResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.posts === undefined) throw new AppError('Posts property is missing in data response', 404, 'MISSING_PROPERTY');

        return {
            success: true,
            data: {
                posts: data.posts,
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

export async function getMorePostsForHomeGlobalFeed(postCursor: number): Promise<ApiResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }>> {
    try {
        const token = await getCurrentUserToken();
        if (!postCursor) throw new AppError('Post cursor is missing', 400, 'MISSING_CURSOR');

        const response = await fetch(`http://localhost:3000/api/posts/feed/global?cursor=${postCursor}&type=old`, {
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

        const { data } = await response.json() as SuccessResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.posts === undefined) throw new AppError('Posts property is missing in data response', 404, 'MISSING_PROPERTY');

        return {
            success: true,
            data: {
                posts: data.posts,
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

export async function getNewPostsForHomeGlobalFeed(postCursor: number | null): Promise<ApiResponse<{ posts: BasePostDataType[], cursor: number | null, end?: boolean }>> {
    try {
        const token = await getCurrentUserToken();
        if (postCursor === undefined) throw new AppError('Post cursor is missing', 400, 'MISSING_CURSOR');

        const response = await fetch(`http://localhost:3000/api/posts/feed/global?cursor=${postCursor}&type=new`, {
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

        const { data } = await response.json() as SuccessResponse<{ posts: BasePostDataType[], cursor: number | null, end?: boolean }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.posts === undefined) throw new AppError('Posts property is missing in data response', 404, 'MISSING_PROPERTY');

        return {
            success: true,
            data: {
                posts: data.posts,
                cursor: data.cursor ?? null,
                end: data.end ?? undefined,
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

export async function getHomeFollowingFeed(): Promise<ApiResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }>> {
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
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        const { data } = await response.json() as SuccessResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.posts === undefined) throw new AppError('Posts property is missing in data response', 404, 'MISSING_PROPERTY');

        return {
            success: true,
            data: {
                posts: data.posts,
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

export async function getMorePostsForHomeFollowingFeed(postCursor: number): Promise<ApiResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }>> {
    try {
        const token = await getCurrentUserToken();
        if (!postCursor) throw new AppError('Post cursor is missing', 400, 'MISSING_CURSOR');

        const response = await fetch(`http://localhost:3000/api/posts/feed/following?cursor=${postCursor}&type=old`, {
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

        const { data } = await response.json() as SuccessResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.posts === undefined) throw new AppError('Posts property is missing in data response', 404, 'MISSING_PROPERTY');

        return {
            success: true,
            data: {
                posts: data.posts,
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

export async function getNewPostsForHomeFollowingFeed(postCursor: number | null): Promise<ApiResponse<{ posts: BasePostDataType[], cursor: number | null, end?: boolean }>> {
    try {
        const token = await getCurrentUserToken();
        if (!postCursor) throw new AppError('Post cursor is missing', 400, 'MISSING_CURSOR');

        const response = await fetch(`http://localhost:3000/api/posts/feed/following?cursor=${postCursor}&type=new`, {
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

        const { data } = await response.json() as SuccessResponse<{ posts: BasePostDataType[], cursor: number | null, end?: boolean }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.posts === undefined) throw new AppError('Posts property is missing in data response', 404, 'MISSING_PROPERTY');

        return {
            success: true,
            data: {
                posts: data.posts,
                cursor: data.cursor ?? null,
                end: data.end ?? undefined,
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
// ---------------------------------------------- PROFILE POSTS --------------------------------------------
// ---------------------------------------------------------------------------------------------------------

export async function getPostsForProfile(profileUsername: string, postsCursor?: number): Promise<ApiResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://localhost:3000/api/posts/userPosts/${profileUsername}${postsCursor ? `?cursor=${postsCursor}` : ''}`, {
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

        const { data } = await response.json() as SuccessResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.posts === undefined) throw new AppError('Posts property is missing in data response', 404, 'MISSING_PROPERTY');

        return {
            success: true,
            data: {
                posts: data.posts,
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

export async function getRepostsForProfile(profileUsername: string, repostsCursor?: number): Promise<ApiResponse<{ reposts: BasePostDataType[], cursor: number | null, end: boolean }>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://localhost:3000/api/posts/userReposts/${profileUsername}${repostsCursor ? `?cursor=${repostsCursor}` : ''}`, {
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

        const { data } = await response.json() as SuccessResponse<{ reposts: BasePostDataType[], cursor: number | null, end: boolean }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.reposts === undefined) throw new AppError('Reposts property is missing in data response', 404, 'MISSING_PROPERTY');

        return {
            success: true,
            data: {
                reposts: data.reposts,
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

export async function getPostsAndRepostsForProfile(
    profileUsername: string
): Promise<ApiResponse<{
    postsCursor: number | null,
    postsEnd: boolean,
    repostsCursor: number | null,
    repostsEnd: boolean,
    postsReposts: ProfilePostOrRepostDataType[],
}>> {
    try {
        const postsPromise = getPostsForProfile(profileUsername);
        const repostsPromise = getRepostsForProfile(profileUsername);

        const [postsResponse, repostsResponse] = await Promise.all([postsPromise, repostsPromise]);

        if (!postsResponse.success) {
            const errorData = postsResponse as ErrorResponse;
            throw new AppError(errorData.error.message, 400, errorData.error.code, errorData.error.details);
        } else if (!repostsResponse.success) {
            const errorData = repostsResponse as ErrorResponse;
            throw new AppError(errorData.error.message, 400, errorData.error.code, errorData.error.details);
        }

        const { data: postsData } = postsResponse as SuccessResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }>;
        if (postsData === undefined) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (postsData.posts === undefined) throw new AppError('Posts property is missing in data response', 404, 'MISSING_PROPERTY');

        const { data: repostsData } = repostsResponse as SuccessResponse<{ reposts: BasePostDataType[], cursor: number | null, end: boolean }>;
        if (repostsData === undefined) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (repostsData.reposts === undefined) throw new AppError('Reposts property is missing in data response', 404, 'MISSING_PROPERTY');

        const mappedPosts: ProfilePostOrRepostDataType[] = postsData.posts.map((post) => {
            return { ...post, timeForSorting: new Date(post.createdAt).getTime(), type: 'POST' };
        });

        const mappedReposts: ProfilePostOrRepostDataType[] = repostsData.reposts.map((repost) => {
            return { ...repost, timeForSorting: new Date(repost.createdAt).getTime(), type: 'REPOST' };
        });

        const mappedPostsReposts: ProfilePostOrRepostDataType[] = mappedPosts.concat(mappedReposts).sort((a, b) => {
            return b.timeForSorting - a.timeForSorting
        }) ?? [];

        return {
            success: true,
            data: {
                postsCursor: postsData.cursor,
                postsEnd: postsData.end,
                repostsCursor: repostsData.cursor,
                repostsEnd: repostsData.end,
                postsReposts: mappedPostsReposts,
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

export async function getMorePostsAndRepostsForProfile(
    profileUsername: string,
    postsCursor: number | null,
    repostsCursor: number | null,
    postsEnd: boolean,
    repostsEnd: boolean,
): Promise<ApiResponse<{
    postsCursor: number | null,
    postsEnd: boolean,
    repostsCursor: number | null,
    repostsEnd: boolean,
    postsReposts: ProfilePostOrRepostDataType[],
}>> {
    try {
        let postsPromise: Promise<ApiResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean; }>> | undefined = undefined;
        let repostsPromise: Promise<ApiResponse<{ reposts: BasePostDataType[], cursor: number | null, end: boolean; }>> | undefined = undefined;

        if (!postsEnd && postsCursor) {
            postsPromise = getPostsForProfile(profileUsername, postsCursor);
        }

        if (!repostsEnd && repostsCursor) {
            repostsPromise = getRepostsForProfile(profileUsername, repostsCursor);
        }

        const [postsResponse, repostsResponse] = await Promise.all([postsPromise, repostsPromise]);

        if (postsResponse && !postsResponse.success) {
            const errorData = postsResponse as ErrorResponse;
            throw new AppError(errorData.error.message, 400, errorData.error.code, errorData.error.details);
        } else if (repostsResponse && !repostsResponse.success) {
            const errorData = repostsResponse as ErrorResponse;
            throw new AppError(errorData.error.message, 400, errorData.error.code, errorData.error.details);
        }

        let fetchedOlderPosts = { posts: [], cursor: null, end: true } as { posts: BasePostDataType[], cursor: number | null, end: boolean };
        if (postsResponse !== undefined) {
            const { data } = postsResponse as SuccessResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }>;
            if (data === undefined) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
            else if (data.posts === undefined) throw new AppError('Posts property is missing in data response', 404, 'MISSING_PROPERTY');
            fetchedOlderPosts = { posts: data.posts, cursor: data.cursor, end: data.end };
        }

        let fetchedOlderReposts = { reposts: [], cursor: null, end: true } as { reposts: BasePostDataType[], cursor: number | null, end: boolean };
        if (repostsResponse !== undefined) {
            const { data } = repostsResponse as SuccessResponse<{ reposts: BasePostDataType[], cursor: number | null, end: boolean }>;
            if (data === undefined) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
            else if (data.reposts === undefined) throw new AppError('Reposts property is missing in data response', 404, 'MISSING_PROPERTY');
            fetchedOlderReposts = { reposts: data.reposts, cursor: data.cursor, end: data.end };
        }

        const mappedPosts: ProfilePostOrRepostDataType[] = fetchedOlderPosts.posts.map((post) => {
            return { ...post, timeForSorting: new Date(post.createdAt).getTime(), type: 'POST' };
        });

        const mappedReposts: ProfilePostOrRepostDataType[] = fetchedOlderReposts.reposts.map((repost) => {
            return { ...repost, timeForSorting: new Date(repost.createdAt).getTime(), type: 'REPOST' };
        });

        const mappedPostsReposts: ProfilePostOrRepostDataType[] = mappedPosts.concat(mappedReposts).sort((a, b) => {
            return b.timeForSorting - a.timeForSorting
        }) ?? [];

        return {
            success: true,
            data: {
                postsCursor: fetchedOlderPosts.cursor,
                postsEnd: fetchedOlderPosts.end,
                repostsCursor: fetchedOlderReposts.cursor,
                repostsEnd: fetchedOlderReposts.end,
                postsReposts: mappedPostsReposts,
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

export async function getRepliesForProfile(profileUsername: string, repliesCursor?: number): Promise<ApiResponse<{ replies: BasePostDataType[], cursor: number | null, end: boolean }>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://localhost:3000/api/posts/userReplies/${profileUsername}${repliesCursor ? `?cursor=${repliesCursor}` : ''}`, {
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

        const { data } = await response.json() as SuccessResponse<{ replies: BasePostDataType[], cursor: number | null, end: boolean }>;
        if (data === undefined) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.replies === undefined) throw new AppError('Replies property is missing in data response', 404, 'MISSING_PROPERTY');

        return {
            success: true,
            data: {
                replies: data.replies,
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

export async function getMediaForProfile(profileUsername: string, mediaCursor?: number): Promise<ApiResponse<{ media: BasePostDataType[], cursor: number | null, end: boolean }>> {
    try {
        const token = await getCurrentUserToken();

        const response = await fetch(`http://localhost:3000/api/posts/userMedia/${profileUsername}${mediaCursor ? `?cursor=${mediaCursor}` : ''}`, {
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

        const { data } = await response.json() as SuccessResponse<{ media: BasePostDataType[], cursor: number | null, end: boolean }>;
        if (data === undefined) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.media === undefined) throw new AppError('Media property is missing in data response', 404, 'MISSING_PROPERTY');

        return {
            success: true,
            data: {
                media: data.media,
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

export async function getLikesForProfile(profileUsername: string, likesCursor?: number): Promise<ApiResponse<{ likes: BasePostDataType[], cursor: number | null, end: boolean }>> {
    try {
        const token = await getCurrentUserToken();
        const payload = await decryptSession(token) as LoggedInUserJwtPayload;

        if (payload.username !== profileUsername) throw new AppError('Unauthorized', 401, 'ANAUTHORIZED');

        const response = await fetch(`http://localhost:3000/api/posts/userLikes${likesCursor ? `?cursor=${likesCursor}` : ''}`, {
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

        const { data } = await response.json() as SuccessResponse<{ likes: BasePostDataType[], cursor: number | null, end: boolean }>;
        if (data === undefined) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (data.likes === undefined) throw new AppError('Likes property is missing in data response', 404, 'MISSING_PROPERTY');

        return {
            success: true,
            data: {
                likes: data.likes,
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

// ---------------------------------------------------------------------------------------------------------
// ---------------------------------------------- POST INTERACTION -----------------------------------------
// ---------------------------------------------------------------------------------------------------------

export async function createPost(formData: FormNewPostDataType): Promise<ApiResponse<{ post: BasePostDataType }>> {
    try {
        const token = await getCurrentUserToken();
        newPostDataSchema.parse(formData);

        const newFormData = new FormData();

        if (formData.text) {
            newFormData.append('text', String(formData.text));
        }

        if (Array.isArray(formData.images)) {
            formData.images.forEach((file) => {
                newFormData.append(`images`, file);
            });
        } else if (formData.images) {
            newFormData.append('image', formData.images); // Single file case
        }

        if (formData.replyToId) {
            newFormData.append('replyToId', String(formData.replyToId));
        }

        const response = await fetch(`http://localhost:3000/api/posts/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: newFormData
        });

        if (!response.ok) {
            const errorData = await response.json() as ErrorResponse;
            throw new AppError(errorData.error.message, response.status, errorData.error.code, errorData.error.details);
        }

        const { data } = await response.json() as SuccessResponse<{ post: BasePostDataType }>;
        if (!data) throw new AppError('Data is missing in response', 404, 'MISSING_DATA');
        else if (!data.post) throw new AppError('Post is missing in data response', 404, 'MISSING_POST');

        return {
            success: true,
            data: {
                post: data.post,
            }
        }
    } catch (error: unknown) {
        // Handle validation errors
        if (isZodError(error)) {
            return {
                success: false,
                error: {
                    message: 'Validation failed',
                    code: 'VALIDATION_FAILED',
                    details: error.issues,
                }
            } as ErrorResponse;
        } else if (error instanceof AppError) {
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

export async function repostPost(postId: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/repost/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return true;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return false;
    }
};

export async function removeRepostPost(postId: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/removeRepost/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return true;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return false;
    }
};

export async function likePost(postId: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/like/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return true;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return false;
    }
};

export async function removeLikePost(postId: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/removeLike/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return true;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return false;
    }
};

export async function bookmarkPost(postId: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/bookmark/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return true;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return false;
    }
};

export async function removeBookmarkPost(postId: number) {
    const token = await getCurrentUserToken();

    try {
        const response = await fetch(`http://localhost:3000/api/posts/removeBookmark/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return true;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(errorMessage);
        return false;
    }
};
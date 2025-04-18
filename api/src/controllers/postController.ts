import { NextFunction, Request, Response } from 'express';
import { AppError, BasePostDataType, LoggedInUserDataType, SuccessResponse, TrendingHashtagType, VisitedPostDataType } from 'tweetly-shared';
import {
    addPostBookmark,
    addPostLike,
    addPostRepost,
    createPost,
    getBookmarks,
    getFollowing30DayPosts,
    getGlobal30DayPosts,
    getLikes,
    getOldestBookmark,
    getOldestFollowing30DayPost,
    getOldestGlobal30DayPost,
    getOldestLike,
    getOldestPost,
    getOldestReply,
    getOldestReplyLeastEnegagement,
    getOldestRepost,
    getPostInfo,
    getPostReplies,
    getPosts,
    getReplies,
    getReposts,
    getTopPosts,
    getTrendingHastags,
    handlePostHashtags,
    postExists,
    removePostBookmark,
    removePostLike,
    removePostRepost,
    getOldestMedia,
    getMedia,
    getGlobal30DayNewPosts,
    getFollowing30DayNewPosts,
    getPinnedPost,
    addPostPin,
    removePostPin,
    deletePost,
} from '../services/postService.js';
import { createNotificationsForNewLike, createNotificationsForNewPost, createNotificationsForNewReply, createNotificationsForNewRepost, removeNotificationsForLike, removeNotificationsForRepost } from '../services/notificationService.js';
import { remapPostInformation, remapVisitedPostInformation } from '../lib/helpers.js';
import { getProfile } from '../services/userService.js';

// ---------------------------------------------------------------------------------------------------------

export interface NewPostType {
    text?: string,
    images?: string[],
    imagesPublicIds?: string[],
    replyToId?: number,
}

export const newPost = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as LoggedInUserDataType;
    const text = req.body.text;
    const replyToId = req.body.replyToId;
    const images = req.body.cloudinaryUrls;

    const hashtagRegex = /#(\w+)/g;
    const hashtags = text && Array.from(new Set(text.match(hashtagRegex)?.map((tag: string[]) => tag.slice(1)) || []));

    try {
        if (replyToId) {
            if (isNaN(Number(replyToId))) {
                throw new AppError('Incorrect reply value type', 404, 'INCORRECT_VALUE_TYPE');
            }

            // Check if post exists
            const replyPost = await postExists(Number(replyToId));
            if (!replyPost) throw new AppError('Reply post not found', 404, 'REPLY_NOT_FOUND');
        }

        if ((text === undefined || text.length === 0) && (images === undefined || images.length === 0)) {
            throw new AppError('Post content is missing', 404, 'MISSING_CONTENT');
        }

        const newPostData = await createPost(user.id, { text, replyToId: Number(replyToId), images });
        const postId = newPostData.id;

        // Delegate hashtag handling to service
        if (hashtags) {
            await handlePostHashtags(postId, hashtags);
        }

        // Create notifications
        if (!replyToId) {
            createNotificationsForNewPost(postId, user.id);
        } else {
            createNotificationsForNewReply(postId, user.id);
        }

        const post = remapPostInformation(newPostData);

        const successResponse: SuccessResponse<{ post: BasePostDataType }> = {
            success: true,
            data: {
                post: post,
            },
        };

        return res.status(200).json(successResponse);
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const removePost = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as LoggedInUserDataType;
    const postId = Number(req.params.id);

    try {
        const postData = await getPostInfo(user.id, postId);
        if (!postData) throw new AppError('Post not found', 404, 'NOT_FOUND');
        if (postData.author.username !== user.username) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

        // Soft delete the post
        const response = await deletePost(postId);
        if (!response) throw new AppError('Something went wrong', 400, 'INTERNAL_SERVER_ERROR');

        const successResponse: SuccessResponse<undefined> = {
            success: true,
            data: undefined
        };

        return res.status(200).json(successResponse);
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const global30DayPosts = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as LoggedInUserDataType;
    const params = req.query;
    const cursor = params.cursor;
    const type = params.type?.toString().toUpperCase() as 'NEW' | 'OLD';

    try {
        if (cursor) {
            if (type === 'OLD') {
                const oldestGlobalPostId = await getOldestGlobal30DayPost(user.id).then(res => res?.id);
                if (oldestGlobalPostId) {
                    // check if current cursor equals last post id
                    // if truthy, return empty array and set the end to true
                    if (Number(cursor) === oldestGlobalPostId) {
                        const successResponse: SuccessResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }> = {
                            success: true,
                            data: {
                                posts: [],
                                cursor: null,
                                end: true,
                            },
                        };

                        return res.status(200).json(successResponse);
                    }
                }

                const postsData = await getGlobal30DayPosts(user.id, Number(cursor));

                const posts = postsData.map((post) => {
                    // skip if there's no information
                    if (!post) return;
                    if (!post.author) return;
                    if (!post.author.profile) return;

                    return remapPostInformation(post);
                }).filter((post): post is NonNullable<typeof post> => post !== undefined);


                const postsEnd = posts.length === 0
                    ? true
                    : oldestGlobalPostId === posts.slice(-1)[0]?.id
                        ? true
                        : false

                const successResponse: SuccessResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }> = {
                    success: true,
                    data: {
                        posts: posts ?? [],
                        cursor: posts.slice(-1)[0]?.id ?? null,
                        end: postsEnd ?? true,
                    },
                };

                return res.status(200).json(successResponse);
            } else if (type === 'NEW') {
                if (cursor === 'null') {
                    const oldestGlobalPostId = await getOldestGlobal30DayPost(user.id).then(res => res?.id);
                    if (oldestGlobalPostId) {
                        // check if current cursor equals last post id
                        // if truthy, return empty array and set the end to true
                        if (Number(cursor) === oldestGlobalPostId) {
                            const successResponse: SuccessResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }> = {
                                success: true,
                                data: {
                                    posts: [],
                                    cursor: null,
                                    end: true,
                                },
                            };

                            return res.status(200).json(successResponse);
                        }
                    }

                    const postsData = await getGlobal30DayPosts(user.id, Number(cursor));

                    const posts = postsData.map((post) => {
                        // skip if there's no information
                        if (!post) return;
                        if (!post.author) return;
                        if (!post.author.profile) return;

                        return remapPostInformation({ ...post, content: post.content ?? undefined });
                    }).filter((post): post is NonNullable<typeof post> => post !== undefined);

                    const postsEnd = posts.length === 0
                        ? true
                        : oldestGlobalPostId === posts.slice(-1)[0]?.id
                            ? true
                            : false

                    const successResponse: SuccessResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }> = {
                        success: true,
                        data: {
                            posts: posts ?? [],
                            cursor: posts.slice(-1)[0]?.id ?? null,
                            end: postsEnd ?? true,
                        },
                    };

                    return res.status(200).json(successResponse);
                }

                const postsData = await getGlobal30DayNewPosts(user.id, Number(cursor));
                const posts = postsData.map((post) => {
                    // skip if there's no information
                    if (!post) return;
                    if (!post.author) return;
                    if (!post.author.profile) return;

                    return remapPostInformation({ ...post, content: post.content ?? undefined });
                }).filter((post): post is NonNullable<typeof post> => post !== undefined);

                const successResponse: SuccessResponse<{ posts: BasePostDataType[] }> = {
                    success: true,
                    data: {
                        posts: posts ?? [],
                    },
                };

                return res.status(200).json(successResponse);
            } else {
                throw new AppError(`Uknown type (${type}) in search params`, 400, 'UKNOWN_TYPE');
            }
        } else {
            const oldestGlobalPostId = await getOldestGlobal30DayPost(user.id).then(res => res?.id);
            const postsData = await getGlobal30DayPosts(user.id);

            const posts = postsData.map((post) => {
                // skip if there's no information
                if (!post) return;
                if (!post.author) return;
                if (!post.author.profile) return;

                return remapPostInformation(post);
            }).filter((post): post is NonNullable<typeof post> => post !== undefined);

            const postsEnd = posts.length === 0
                ? true
                : oldestGlobalPostId === posts.slice(-1)[0]?.id
                    ? true
                    : false

            const successResponse: SuccessResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }> = {
                success: true,
                data: {
                    posts: posts ?? [],
                    cursor: posts.slice(-1)[0]?.id ?? null,
                    end: postsEnd ?? true,
                },
            };

            return res.status(200).json(successResponse);
        }
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const following30DayPosts = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as LoggedInUserDataType;
    const params = req.query;
    const cursor = params.cursor;
    const type = params.type?.toString().toUpperCase() as 'NEW' | 'OLD';

    try {
        if (cursor) {
            if (type === 'OLD') {
                const oldestFollowingPostId = await getOldestFollowing30DayPost(user.id).then(res => res?.id);
                if (oldestFollowingPostId) {
                    // check if current cursor equals last post id
                    // if truthy, return empty array and set the end to true
                    if (Number(cursor) === oldestFollowingPostId) {
                        const successResponse: SuccessResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }> = {
                            success: true,
                            data: {
                                posts: [],
                                cursor: null,
                                end: true,
                            },
                        };

                        return res.status(200).json(successResponse);
                    }
                }

                const postsData = await getFollowing30DayPosts(user.id, Number(cursor));

                const posts = postsData.map((post) => {
                    // skip if there's no information
                    if (!post) return;
                    if (!post.author) return;
                    if (!post.author.profile) return;

                    return remapPostInformation(post);
                }).filter((post): post is NonNullable<typeof post> => post !== undefined);

                const postsEnd = posts.length === 0
                    ? true
                    : oldestFollowingPostId === posts.slice(-1)[0]?.id
                        ? true
                        : false

                const successResponse: SuccessResponse<{ posts: BasePostDataType[], end: boolean }> = {
                    success: true,
                    data: {
                        posts: posts ?? [],
                        end: postsEnd
                    },
                };

                return res.status(200).json(successResponse);
            } else if (type === 'NEW') {
                if (cursor === 'null') {
                    const oldestFollowingPostId = await getOldestFollowing30DayPost(user.id).then(res => res?.id);
                    if (oldestFollowingPostId) {
                        // check if current cursor equals last post id
                        // if truthy, return empty array and set the end to true
                        if (Number(cursor) === oldestFollowingPostId) {
                            const successResponse: SuccessResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }> = {
                                success: true,
                                data: {
                                    posts: [],
                                    cursor: null,
                                    end: true,
                                },
                            };

                            return res.status(200).json(successResponse);
                        }
                    }

                    const postsData = await getFollowing30DayPosts(user.id, Number(cursor));

                    const posts = postsData.map((post) => {
                        // skip if there's no information
                        if (!post) return;
                        if (!post.author) return;
                        if (!post.author.profile) return;

                        return remapPostInformation({ ...post, content: post.content ?? undefined });
                    }).filter((post): post is NonNullable<typeof post> => post !== undefined);

                    const postsEnd = posts.length === 0
                        ? true
                        : oldestFollowingPostId === posts.slice(-1)[0]?.id
                            ? true
                            : false

                    const successResponse: SuccessResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }> = {
                        success: true,
                        data: {
                            posts: posts ?? [],
                            cursor: posts.slice(-1)[0]?.id ?? null,
                            end: postsEnd ?? true,
                        },
                    };

                    return res.status(200).json(successResponse);
                }

                const postsData = await getFollowing30DayNewPosts(user.id, Number(cursor));

                const posts = postsData.map((post) => {
                    // skip if there's no information
                    if (!post) return;
                    if (!post.author) return;
                    if (!post.author.profile) return;

                    return remapPostInformation(post);
                }).filter((post): post is NonNullable<typeof post> => post !== undefined);

                const successResponse: SuccessResponse<{ posts: BasePostDataType[] }> = {
                    success: true,
                    data: {
                        posts: posts ?? [],
                    },
                };

                return res.status(200).json(successResponse);
            } else {
                throw new AppError(`Uknown type (${type}) in search params`, 400, 'UKNOWN_TYPE');
            }
        } else {
            const oldestFollowingPostId = await getOldestFollowing30DayPost(user.id).then(res => res?.id);
            const postsData = await getFollowing30DayPosts(user.id);

            const posts = postsData.map((post) => {
                // skip if there's no information
                if (!post) return;
                if (!post.author) return;
                if (!post.author.profile) return;

                return remapPostInformation(post);
            }).filter((post): post is NonNullable<typeof post> => post !== undefined);

            const postsEnd = posts.length === 0
                ? true
                : oldestFollowingPostId === posts.slice(-1)[0]?.id
                    ? true
                    : false

            const successResponse: SuccessResponse<{ posts: BasePostDataType[], end: boolean }> = {
                success: true,
                data: {
                    posts: posts ?? [],
                    end: postsEnd
                },
            };

            return res.status(200).json(successResponse);
        }
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const exploreRandomPosts = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as LoggedInUserDataType;

    try {
        const postsData = await getTopPosts(user.id);

        const posts = postsData.map((post) => {
            // skip if there's no information
            if (!post) return;
            if (!post.author) return;
            if (!post.author.profile) return;

            return remapPostInformation(post);
        }).filter((post): post is NonNullable<typeof post> => post !== undefined);

        const orderedPosts = posts?.sort((a, b) => (b.stats.likesCount + b.stats.repliesCount + b.stats.repostsCount) - (a.stats.likesCount + a.stats.repliesCount + a.stats.repostsCount)) ?? [];


        const successResponse: SuccessResponse<{ posts: BasePostDataType[] }> = {
            success: true,
            data: {
                posts: orderedPosts,
            },
        };

        return res.status(200).json(successResponse);
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const trendingHashtags = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const hashtagsData = await getTrendingHastags();

        const hashtags = hashtagsData.map((hashtag) => {
            // skip if there's no information
            if (!hashtag) return;
            if (!hashtag._count) return;

            const remappedHashtag = {
                name: hashtag.name,
                postsCount: hashtag._count.posts,
            };

            return remappedHashtag;
        }).filter((hashtag): hashtag is NonNullable<typeof hashtag> => hashtag !== undefined);

        const successResponse: SuccessResponse<{ hashtags: TrendingHashtagType[] }> = {
            success: true,
            data: {
                hashtags: hashtags ?? [],
            },
        };

        return res.status(200).json(successResponse);
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getPost = async (req: Request, res: Response, next: NextFunction) => {
    const postId = Number(req.params.id);
    const user = req.user as LoggedInUserDataType;

    try {
        if (!postId) throw new AppError('Missing postId search param', 404, 'MISSING_PARAM');

        // get original post, parent post if its a reply, and replies
        const postData = await getPostInfo(user.id, postId);
        if (!postData) throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
        const post = remapVisitedPostInformation(postData);

        // check whether last reply is the end of replies
        const oldestReplyLeastEnegagementId = await getOldestReplyLeastEnegagement(user.id, postId).then(res => res?.id);
        const repliesEnd = post.replies.posts.length === 0
            ? true
            : oldestReplyLeastEnegagementId === post.replies.posts.slice(-1)[0]?.id
                ? true
                : false

        const successResponse: SuccessResponse<{ post: VisitedPostDataType, cursor: number, end: boolean }> = {
            success: true,
            data: {
                post: post ?? [],
                cursor: post.replies.posts.slice(-1)[0]?.id,
                end: repliesEnd
            },
        };

        return res.status(200).json(successResponse);
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const postReplies = async (req: Request, res: Response, next: NextFunction) => {
    const postId = Number(req.params.id);
    const user = req.user as LoggedInUserDataType;

    const cursor = Number(req.query.cursor);

    try {
        if (!postId) throw new AppError('Missing postId search param', 404, 'MISSING_PARAM');

        if (cursor) {
            // order replies by likes and find the oldest one with no engagemenet
            const oldestReplyLeastEnegagementId = await getOldestReplyLeastEnegagement(user.id, postId).then(res => res?.id);
            if (oldestReplyLeastEnegagementId) {
                // check if current cursor equals last reply id
                // if truthy, return empty array and set the end to true
                if (cursor === oldestReplyLeastEnegagementId) {
                    const successResponse: SuccessResponse<{ replies: [], cursor: number | null, end: boolean }> = {
                        success: true,
                        data: {
                            replies: [],
                            cursor: null,
                            end: true,
                        },
                    };

                    return res.status(200).json(successResponse);
                }
            }

            const repliesData = await getPostReplies(user.id, postId, Number(cursor));
            const replies = repliesData.map((reply) => {
                // skip if there's no information
                if (!reply) return;
                if (!reply.author) return;
                if (!reply.author.profile) return;

                return remapPostInformation(reply);
            }).filter((reply): reply is NonNullable<typeof reply> => reply !== undefined);

            const repliesEnd = replies.length === 0
                ? true
                : oldestReplyLeastEnegagementId === replies.slice(-1)[0]?.id
                    ? true
                    : false

            const successResponse: SuccessResponse<{ replies: BasePostDataType[], cursor: number | null, end: boolean }> = {
                success: true,
                data: {
                    replies: replies ?? [],
                    cursor: replies.slice(-1)[0]?.id ?? null,
                    end: repliesEnd ?? true,
                },
            };

            return res.status(200).json(successResponse);
        } else {
            const oldestReplyLeastEnegagementId = await getOldestReplyLeastEnegagement(user.id, postId).then(res => res?.id);
            const repliesData = await getPostReplies(user.id, postId);
            const replies = repliesData.map((reply) => {
                // skip if there's no information
                if (!reply) return;
                if (!reply.author) return;
                if (!reply.author.profile) return;

                return remapPostInformation(reply);
            }).filter((reply): reply is NonNullable<typeof reply> => reply !== undefined);

            const repliesEnd = replies.length === 0
                ? true
                : oldestReplyLeastEnegagementId === replies.slice(-1)[0]?.id
                    ? true
                    : false

            const successResponse: SuccessResponse<{ replies: BasePostDataType[], cursor: number | null, end: boolean }> = {
                success: true,
                data: {
                    replies: replies ?? [],
                    cursor: replies.slice(-1)[0]?.id ?? null,
                    end: repliesEnd ?? true,
                },
            };

            return res.status(200).json(successResponse);
        }
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getUserPosts = async (req: Request, res: Response, next: NextFunction) => {
    const username = req.params.username;
    const user = req.user as LoggedInUserDataType;
    const cursor = Number(req.query.cursor);

    try {
        const userExists = await getProfile(user.id, username);
        if (!userExists) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        if (!userExists.profile) throw new AppError('User profile not found', 404, 'PROFILE_NOT_FOUND');

        if (cursor) {
            const userOldestPostId = await getOldestPost(username, user.id).then(res => res?.id);
            if (userOldestPostId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (cursor === userOldestPostId) {
                    const successResponse: SuccessResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }> = {
                        success: true,
                        data: {
                            posts: [],
                            cursor: null,
                            end: true,
                        },
                    };

                    return res.status(200).json(successResponse);
                }
            }

            let postsData = await getPosts(user.id, username, Number(cursor));

            const posts = postsData.map((post) => {
                // skip if there's no information
                if (!post) return;
                if (!post.author) return;
                if (!post.author.profile) return;
                if (post.isDeleted) return;

                return remapPostInformation(post);
            }).filter((post): post is NonNullable<typeof post> => post !== undefined && post.pinnedOnProfile === false);

            const postsEnd = posts.length === 0
                ? true
                : userOldestPostId === posts.slice(-1)[0]?.id
                    ? true
                    : false

            const successResponse: SuccessResponse<{ posts: BasePostDataType[], cursor: number | null, end: boolean }> = {
                success: true,
                data: {
                    posts: posts ?? [],
                    cursor: posts.slice(-1)[0]?.id ?? null,
                    end: postsEnd
                },
            };

            return res.status(200).json(successResponse);
        } else {
            const userOldestPostId = await getOldestPost(username, user.id).then(res => res?.id);
            const pinnedPostData = await getPinnedPost(user.id, username);
            const postsData = await getPosts(user.id, username);

            const pinnedPost = pinnedPostData.length ? remapPostInformation(pinnedPostData[0]) : null;

            const posts = postsData.map((post) => {
                // skip if there's no information
                if (!post) return;
                if (!post.author) return;
                if (!post.author.profile) return;
                if (post.isDeleted) return;

                return remapPostInformation(post);
            }).filter((post): post is NonNullable<typeof post> => post !== undefined && post.pinnedOnProfile === false);

            const postsEnd = posts.length === 0
                ? true
                : userOldestPostId === posts.slice(-1)[0]?.id
                    ? true
                    : false

            const successResponse: SuccessResponse<{ posts: BasePostDataType[], pinnedPost: BasePostDataType | null, cursor: number | null, end: boolean }> = {
                success: true,
                data: {
                    posts: posts ?? [],
                    pinnedPost: pinnedPost,
                    cursor: posts.slice(-1)[0]?.id ?? null,
                    end: postsEnd
                },
            };

            return res.status(200).json(successResponse);
        }
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getUserReposts = async (req: Request, res: Response, next: NextFunction) => {
    const username = req.params.username;
    const user = req.user as LoggedInUserDataType;
    const cursor = Number(req.query.cursor);

    try {
        const userExists = await getProfile(user.id, username);
        if (!userExists) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        if (!userExists.profile) throw new AppError('User profile not found', 404, 'PROFILE_NOT_FOUND');

        if (cursor) {
            const userOldestRepostId = await getOldestRepost(username, user.id).then(res => res?.id);
            if (userOldestRepostId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (cursor === userOldestRepostId) {
                    const successResponse: SuccessResponse<{ reposts: BasePostDataType[], cursor: number | null, end: boolean }> = {
                        success: true,
                        data: {
                            reposts: [],
                            cursor: null,
                            end: true,
                        },
                    };

                    return res.status(200).json(successResponse);
                }
            }

            const repostsData = await getReposts(user.id, username, Number(cursor));

            const reposts = repostsData.map((repost) => {
                // skip if there's no information
                if (!repost) return;
                if (!repost.author) return;
                if (!repost.author.profile) return;

                return remapPostInformation(repost);
            }).filter((repost): repost is NonNullable<typeof repost> => repost !== undefined);

            const repostsEnd = reposts.length === 0
                ? true
                : userOldestRepostId === reposts.slice(-1)[0]?.id
                    ? true
                    : false

            const successResponse: SuccessResponse<{ reposts: BasePostDataType[], cursor: number | null, end: boolean }> = {
                success: true,
                data: {
                    reposts: reposts ?? [],
                    cursor: reposts.slice(-1)[0]?.id ?? null,
                    end: repostsEnd
                },
            };

            return res.status(200).json(successResponse);
        } else {
            const userOldestRepostId = await getOldestRepost(username, user.id).then(res => res?.id);
            const repostsData = await getReposts(user.id, username);

            const reposts = repostsData.map((repost) => {
                // skip if there's no information
                if (!repost) return;
                if (!repost.author) return;
                if (!repost.author.profile) return;

                return remapPostInformation(repost);
            }).filter((repost): repost is NonNullable<typeof repost> => repost !== undefined && repost.pinnedOnProfile === false);

            const repostsEnd = reposts.length === 0
                ? true
                : userOldestRepostId === reposts.slice(-1)[0]?.id
                    ? true
                    : false

            const successResponse: SuccessResponse<{ reposts: BasePostDataType[], cursor: number | null, end: boolean }> = {
                success: true,
                data: {
                    reposts: reposts ?? [],
                    cursor: reposts.slice(-1)[0]?.id ?? null,
                    end: repostsEnd
                },
            };

            return res.status(200).json(successResponse);
        }
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getUserReplies = async (req: Request, res: Response, next: NextFunction) => {
    const username = req.params.username;
    const user = req.user as LoggedInUserDataType;
    const cursor = Number(req.query.cursor);

    try {
        const userExists = await getProfile(user.id, username);
        if (!userExists) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        if (!userExists.profile) throw new AppError('User profile not found', 404, 'PROFILE_NOT_FOUND');

        if (cursor) {
            const userOldestReplyId = await getOldestReply(username, user.id).then(res => res?.id);
            if (userOldestReplyId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (cursor === userOldestReplyId) {
                    const successResponse: SuccessResponse<{ replies: BasePostDataType[], cursor: number | null, end: boolean }> = {
                        success: true,
                        data: {
                            replies: [],
                            cursor: null,
                            end: true,
                        },
                    };

                    return res.status(200).json(successResponse);
                }
            }

            const repliesData = await getReplies(user.id, username, Number(cursor));

            const replies = repliesData.map((reply) => {
                // skip if there's no information
                if (!reply) return;
                if (!reply.author) return;
                if (!reply.author.profile) return;

                return remapPostInformation(reply);
            }).filter((reply): reply is NonNullable<typeof reply> => reply !== undefined);

            const repliesEnd = replies.length === 0
                ? true
                : userOldestReplyId === replies.slice(-1)[0]?.id
                    ? true
                    : false

            const successResponse: SuccessResponse<{ replies: BasePostDataType[], cursor: number | null, end: boolean }> = {
                success: true,
                data: {
                    replies: replies ?? [],
                    cursor: replies.slice(-1)[0]?.id ?? null,
                    end: repliesEnd
                },
            };

            return res.status(200).json(successResponse);
        } else {
            const userOldestReplyId = await getOldestReply(username, user.id).then(res => res?.id);
            let repliesData = await getReplies(user.id, username);

            const replies = repliesData.map((reply) => {
                // skip if there's no information
                if (!reply) return;
                if (!reply.author) return;
                if (!reply.author.profile) return;

                return remapPostInformation(reply);
            }).filter((reply): reply is NonNullable<typeof reply> => reply !== undefined);

            const repliesEnd = replies.length === 0
                ? true
                : userOldestReplyId === replies.slice(-1)[0]?.id
                    ? true
                    : false

            const successResponse: SuccessResponse<{ replies: BasePostDataType[], cursor: number | null, end: boolean }> = {
                success: true,
                data: {
                    replies: replies ?? [],
                    cursor: replies.slice(-1)[0]?.id ?? null,
                    end: repliesEnd
                },
            };

            return res.status(200).json(successResponse);
        }
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getUserMedia = async (req: Request, res: Response, next: NextFunction) => {
    const username = req.params.username;
    const user = req.user as LoggedInUserDataType;
    const cursor = Number(req.query.cursor);

    try {
        const userExists = await getProfile(user.id, username);
        if (!userExists) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        if (!userExists.profile) throw new AppError('User profile not found', 404, 'PROFILE_NOT_FOUND');

        if (cursor) {
            const userOldestMediaId = await getOldestMedia(username, user.id).then(res => res?.id);
            if (userOldestMediaId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (cursor === userOldestMediaId) {
                    const successResponse: SuccessResponse<{ media: BasePostDataType[], cursor: number | null, end: boolean }> = {
                        success: true,
                        data: {
                            media: [],
                            cursor: null,
                            end: true,
                        },
                    };

                    return res.status(200).json(successResponse);
                }
            }

            const mediaData = await getMedia(user.id, username, Number(cursor));

            const media = mediaData.map((media) => {
                // skip if there's no information
                if (!media) return;
                if (!media.author) return;
                if (!media.author.profile) return;

                return remapPostInformation(media);
            }).filter((media): media is NonNullable<typeof media> => media !== undefined);

            const mediaEnd = media.length === 0
                ? true
                : userOldestMediaId === media.slice(-1)[0]?.id
                    ? true
                    : false

            const successResponse: SuccessResponse<{ media: BasePostDataType[], cursor: number | null, end: boolean }> = {
                success: true,
                data: {
                    media: media ?? [],
                    cursor: media.slice(-1)[0]?.id ?? null,
                    end: mediaEnd
                },
            };

            return res.status(200).json(successResponse);
        } else {
            const userOldestMediaId = await getOldestMedia(username, user.id).then(res => res?.id);
            const mediaData = await getMedia(user.id, username);

            const media = mediaData.map((media) => {
                // skip if there's no information
                if (!media) return;
                if (!media.author) return;
                if (!media.author.profile) return;

                return remapPostInformation(media);
            }).filter((media): media is NonNullable<typeof media> => media !== undefined);

            const mediaEnd = media.length === 0
                ? true
                : userOldestMediaId === media.slice(-1)[0]?.id
                    ? true
                    : false

            const successResponse: SuccessResponse<{ media: BasePostDataType[], cursor: number | null, end: boolean }> = {
                success: true,
                data: {
                    media: media ?? [],
                    cursor: media.slice(-1)[0]?.id ?? null,
                    end: mediaEnd
                },
            };

            return res.status(200).json(successResponse);
        }
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getUserLikes = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as LoggedInUserDataType;
    const cursor = Number(req.query.cursor);

    try {
        if (cursor) {
            const userOldestLikeId = await getOldestLike(user.id).then(res => res?.post.id);
            if (userOldestLikeId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (cursor === userOldestLikeId) {
                    const successResponse: SuccessResponse<{ likes: BasePostDataType[], cursor: number | null, end: boolean }> = {
                        success: true,
                        data: {
                            likes: [],
                            cursor: null,
                            end: true,
                        },
                    };

                    return res.status(200).json(successResponse);
                }
            }

            const likesData = await getLikes(user.id, Number(cursor)).then(res => res.map(like => like.post));

            const likes = likesData.map((like) => {
                // skip if there's no information
                if (!like) return;
                if (!like.author) return;
                if (!like.author.profile) return;

                return remapPostInformation(like);
            }).filter((like): like is NonNullable<typeof like> => like !== undefined);

            const likesEnd = likes.length === 0
                ? true
                : userOldestLikeId === likes.slice(-1)[0]?.id
                    ? true
                    : false

            const successResponse: SuccessResponse<{ likes: BasePostDataType[], cursor: number | null, end: boolean }> = {
                success: true,
                data: {
                    likes: likes ?? [],
                    cursor: likes.slice(-1)[0]?.id ?? null,
                    end: likesEnd
                },
            };

            return res.status(200).json(successResponse);
        } else {
            const userOldestLikeId = await getOldestLike(user.id).then(res => res?.post.id);
            const likesData = await getLikes(user.id).then(res => res.map(like => like.post));

            const likes = likesData.map((like) => {
                // skip if there's no information
                if (!like) return;
                if (!like.author) return;
                if (!like.author.profile) return;

                return remapPostInformation(like);
            }).filter((like): like is NonNullable<typeof like> => like !== undefined);

            const likesEnd = likes.length === 0
                ? true
                : userOldestLikeId === likes.slice(-1)[0]?.id
                    ? true
                    : false

            const successResponse: SuccessResponse<{ likes: BasePostDataType[], cursor: number | null, end: boolean }> = {
                success: true,
                data: {
                    likes: likes ?? [],
                    cursor: likes.slice(-1)[0]?.id ?? null,
                    end: likesEnd
                },
            };

            return res.status(200).json(successResponse);
        }
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getUserBookmarks = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as LoggedInUserDataType;
    const cursor = Number(req.query.cursor);

    try {
        if (cursor) {
            const userOldestBookmarkId = await getOldestBookmark(user.id).then(res => res?.post.id);
            if (userOldestBookmarkId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (cursor === userOldestBookmarkId) {
                    const successResponse: SuccessResponse<{ bookmarks: BasePostDataType[], cursor: number | null, end: boolean }> = {
                        success: true,
                        data: {
                            bookmarks: [],
                            cursor: null,
                            end: true,
                        },
                    };

                    return res.status(200).json(successResponse);
                }
            }

            const bookmarksData = await getBookmarks(user.id, Number(cursor)).then(res => res.map(bookmark => bookmark.post));

            const bookmarks = bookmarksData.map((bookmark) => {
                // skip if there's no information
                if (!bookmark) return;
                if (!bookmark.author) return;
                if (!bookmark.author.profile) return;

                return remapPostInformation(bookmark);
            }).filter((bookmark): bookmark is NonNullable<typeof bookmark> => bookmark !== undefined);

            const bookmarksEnd = bookmarks.length === 0
                ? true
                : userOldestBookmarkId === bookmarks.slice(-1)[0]?.id
                    ? true
                    : false

            const successResponse: SuccessResponse<{ bookmarks: BasePostDataType[], cursor: number | null, end: boolean }> = {
                success: true,
                data: {
                    bookmarks: bookmarks ?? [],
                    cursor: bookmarks.slice(-1)[0]?.id ?? null,
                    end: bookmarksEnd
                },
            };

            return res.status(200).json(successResponse);
        } else {
            const userOldestBookmarkId = await getOldestBookmark(user.id).then(res => res?.post.id);
            const bookmarksData = await getBookmarks(user.id).then(res => res.map(bookmark => bookmark.post));

            const bookmarks = bookmarksData.map((bookmark) => {
                // skip if there's no information
                if (!bookmark) return;
                if (!bookmark.author) return;
                if (!bookmark.author.profile) return;

                return remapPostInformation(bookmark);
            }).filter((bookmmark): bookmmark is NonNullable<typeof bookmmark> => bookmmark !== undefined);

            const bookmarksEnd = bookmarks.length === 0
                ? true
                : userOldestBookmarkId === bookmarks.slice(-1)[0]?.id
                    ? true
                    : false

            const successResponse: SuccessResponse<{ bookmarks: BasePostDataType[], cursor: number | null, end: boolean }> = {
                success: true,
                data: {
                    bookmarks: bookmarks ?? [],
                    cursor: bookmarks.slice(-1)[0]?.id ?? null,
                    end: bookmarksEnd
                },
            };

            return res.status(200).json(successResponse);
        }
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const addRepost = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as LoggedInUserDataType;
    const postId = Number(req.params.id);

    try {
        const response = await addPostRepost(user.id, postId);

        if ('error' in response) {
            throw new AppError('User has already reposted the post', 400, 'ALREADY_REPOSTED');
        } else {
            // handle notifications
            createNotificationsForNewRepost(response.postId, user.id);

            const successResponse: SuccessResponse<undefined> = {
                success: true,
                data: undefined
            };

            return res.status(200).json(successResponse);
        }
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const removeRepost = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as LoggedInUserDataType;
    const postId = Number(req.params.id);

    try {
        const response = await removePostRepost(user.id, postId);

        if (!response) {
            throw new AppError("User hasn't reposted the post", 400, 'NOT_REPOSTED');
        } else {
            // handle notifications
            removeNotificationsForRepost(response.postId, user.id);

            const successResponse: SuccessResponse<undefined> = {
                success: true,
                data: undefined
            };

            return res.status(200).json(successResponse);
        }
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const addLike = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as LoggedInUserDataType;
    const postId = Number(req.params.id);

    try {
        const response = await addPostLike(user.id, postId);

        if ('error' in response) {
            throw new AppError("User has already liked the post", 400, 'ALREADY_LIKED');
        } else {
            // handle notifications
            createNotificationsForNewLike(response.postId, user.id);

            const successResponse: SuccessResponse<undefined> = {
                success: true,
                data: undefined
            };

            return res.status(200).json(successResponse);
        }
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const removeLike = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as LoggedInUserDataType;
    const postId = Number(req.params.id);

    try {
        const response = await removePostLike(user.id, postId);

        if (!response) {
            throw new AppError("User hasn't liked the post", 400, 'NOT_LIKED');
        } else {
            // handle notifications
            removeNotificationsForLike(response.postId, user.id);

            const successResponse: SuccessResponse<undefined> = {
                success: true,
                data: undefined
            };

            return res.status(200).json(successResponse);
        }
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const addBookmark = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user as LoggedInUserDataType;
    const postId = Number(req.params.id);

    try {
        const response = await addPostBookmark(id, postId);

        if ('error' in response) {
            throw new AppError("User has already bookmarked the post", 400, 'ALREADY_BOOKMARKED');
        }

        const successResponse: SuccessResponse<undefined> = {
            success: true,
            data: undefined
        };

        return res.status(200).json(successResponse);
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const removeBookmark = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user as LoggedInUserDataType;
    const postId = Number(req.params.id);

    try {
        const response = await removePostBookmark(id, postId);

        if (!response) {
            throw new AppError("User hasn't bookmarked the post", 400, 'NOT_BOOKMARKED');
        }

        const successResponse: SuccessResponse<undefined> = {
            success: true,
            data: undefined
        };

        return res.status(200).json(successResponse);
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const addPin = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as LoggedInUserDataType;
    const postId = Number(req.params.id);

    try {
        const post = await getPostInfo(user.id, postId);
        if (!post) throw new AppError("Post not found", 404, 'POST_NOT_FOUND');
        if (post.author.username !== user.username) throw new AppError("Not authorized", 401, 'NOT_AUTHORIZED');

        await addPostPin(user.id, postId);

        const successResponse: SuccessResponse<undefined> = {
            success: true,
            data: undefined
        };

        return res.status(200).json(successResponse);
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const removePin = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as LoggedInUserDataType;
    const postId = Number(req.params.id);

    try {
        const post = await getPostInfo(user.id, postId);
        if (!post) throw new AppError("Post not found", 404, 'POST_NOT_FOUND');
        if (post.author.username !== user.username) throw new AppError("Not authorized", 401, 'NOT_AUTHORIZED');

        await removePostPin(user.id);

        const successResponse: SuccessResponse<undefined> = {
            success: true,
            data: undefined
        };

        return res.status(200).json(successResponse);
    } catch (error) {
        next(error);
    }
};


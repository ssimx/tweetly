import { Request, Response } from 'express';
import { UserProps } from '../lib/types';
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
} from '../services/postService';
import { createNotificationsForNewLike, createNotificationsForNewPost, createNotificationsForNewReply, createNotificationsForNewRepost, removeNotificationsForLike, removeNotificationsForRepost } from '../services/notificationService';
import { deleteImageFromCloudinary } from './uploadController';

// ---------------------------------------------------------------------------------------------------------

export interface NewPostType {
    text?: string,
    images?: string[],
    imagesPublicIds?: string[],
    replyToId?: number,
}

export const newPost = async (req: Request, res: Response) => {
    const user = req.user as UserProps;
    const { text, images, imagesPublicIds, replyToId } = req.body as NewPostType;
    const postData = { text, images, replyToId, imagesPublicIds };
    const hashtagRegex = /#(\w+)/g;
    const hashtags = postData.text && Array.from(new Set(postData.text.match(hashtagRegex)?.map((tag) => tag.slice(1)) || []));

    try {
        if (replyToId) {
            // Check if post exists
            const replyPost = await postExists(replyToId);
            if (!replyPost) return res.status(404).json({ error: 'Reply post does not exist' });
        }

        if ((postData.text === undefined || postData.text.length === 0) && (postData.images === undefined || postData.images.length === 0)) {
            return res.status(404).json({ error: 'Post does not have any content' });
        }

        const post = await createPost(user.id, postData);
        if (!post) {
            imagesPublicIds?.forEach((img) => {
                deleteImageFromCloudinary(img);
            });
            return res.status(404).json({ error: 'Post has to contain either text or/and images' });
        }
        
        const postId = post.id;

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

        return res.status(201).json({ ...post });
    } catch (error) {
        imagesPublicIds?.forEach((img) => {
            deleteImageFromCloudinary(img);
        });
        console.error('Error saving post data: ', error);
        return res.status(500).json({ error: 'Failed to process the data' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const global30DayPosts = async (req: Request, res: Response) => {
    const user = req.user as UserProps;
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
                        return res.status(200).json({
                            posts: [],
                            end: true
                        });
                    }
                }

                const posts = await getGlobal30DayPosts(user.id, Number(cursor));

                return res.status(200).json({
                    posts: posts,
                    // check if older posts array is empty and if truthy set the end to true
                    // check if new cursor equals last post id
                    //  if truthy, return older posts and set the end to true
                    end: posts.length === 0
                        ? true
                        : oldestGlobalPostId === posts.slice(-1)[0].id
                            ? true
                            : false,
                });
            } else if (type === 'NEW') {
                const posts = await getGlobal30DayNewPosts(user.id, Number(cursor));

                return res.status(200).json({
                    posts: posts,
                });
            } else {
                return res.status(404).json({ error: 'Unknown type' });
            }
        } else {
            const oldestGlobalPostId = await getOldestGlobal30DayPost(user.id).then(res => res?.id);
            const posts = await getGlobal30DayPosts(user.id);
            
            return res.status(200).json({
                posts,
                end: !oldestGlobalPostId
                    ? true
                    : posts.slice(-1)[0].id === oldestGlobalPostId
                        ? true
                        : false
            });
        }
    } catch (error) {
        console.error('Error fetching data: ', error);
        return res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const following30DayPosts = async (req: Request, res: Response) => {
    const user = req.user as UserProps;
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
                        return res.status(200).json({
                            posts: [],
                            end: true
                        });
                    }
                }

                const posts = await getFollowing30DayPosts(user.id, Number(cursor));

                return res.status(200).json({
                    posts: posts,
                    // check if older posts array is empty and if truthy set the end to true
                    // check if new cursor equals last post id
                    //  if truthy, return older posts and set the end to true
                    end: posts.length === 0
                        ? true
                        : oldestFollowingPostId === posts.slice(-1)[0].id
                            ? true
                            : false,
                });
            } else if (type === 'NEW') {
                const posts = await getFollowing30DayNewPosts(user.id, Number(cursor));

                return res.status(200).json({
                    posts: posts,
                });
            } else {
                return res.status(404).json({ error: 'Unknown type' });
            }
        } else {
            const oldestFollowingPostId = await getOldestFollowing30DayPost(user.id).then(res => res?.id);
            const posts = await getFollowing30DayPosts(user.id);

            return res.status(200).json({
                posts,
                end: !oldestFollowingPostId
                        ? true
                        : posts.slice(-1)[0].id === oldestFollowingPostId
                            ? true
                            : false
            });
        }
    } catch (error) {
        console.error('Error fetching data: ', error);
        return res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const exploreRandomPosts = async (req: Request, res: Response) => {
    const user = req.user as UserProps;

    try {
        const posts = await getTopPosts(user.id);
        return res.status(200).json({ posts })
    } catch (error) {
        console.error('Error fetching data: ', error);
        return res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const trendingHashtags = async (req: Request, res: Response) => {
    try {
        const hashtags = await getTrendingHastags();
        if (!hashtags) return res.status(404).json({ error: "Couldn't find trending hashtags" });
        return res.status(200).json({ hashtags });
    } catch (error) {
        console.error('Error fetching data: ', error);
        return res.status(500).json({ error: 'Failed to fetch hashtags' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getPost = async (req: Request, res: Response) => {
    const postId = Number(req.params.id);
    if (!postId) return res.status(404).json({ error: 'Missing post ID param' });
    const user = req.user as UserProps;

    try {
        // get original post, parent post if its a reply, and replies
        const post = await getPostInfo(user.id, postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        // check whether last reply is the end of replies
        const oldestReplyLeastEnegagementId = await getOldestReplyLeastEnegagement(user.id, postId).then(res => res?.id);
        
        return res.status(200).json({
            ...post,
            replies: [
                ...post.replies,
            ],
            repliesEnd: !oldestReplyLeastEnegagementId
                            ? true
                            : post.replies.slice(-1)[0].id === oldestReplyLeastEnegagementId
                                ? true
                                : false
        })
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to fetch the post' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const postReplies = async (req: Request, res: Response) => {
    const postId = Number(req.params.id);
    const user = req.user as UserProps;

    const cursor = Number(req.query.cursor);

    try {
        if (cursor) { 
            // order posts by likes and find the oldest one with no engagemenet
            const oldestReplyLeastEnegagementId = await getOldestReplyLeastEnegagement(user.id, postId).then(res => res?.id);
            if (oldestReplyLeastEnegagementId) {
                // check if current cursor equals last reply id
                // if truthy, return empty array and set the end to true
                if (cursor === oldestReplyLeastEnegagementId) {
                    return res.status(200).json({
                        posts: [],
                        end: true
                    });
                }
            }            

            const posts = await getPostReplies(user.id, postId, Number(cursor));

            return res.status(200).json({
                posts,
                // check if replies array is empty and if truthy set the end to true
                // check if new cursor equals last post id
                //      if truthy, return replies and set the end to true
                end: posts.length === 0
                    ? true
                    : oldestReplyLeastEnegagementId === posts.slice(-1)[0].id
                        ? true
                        : false,
            });
        } else {
            const oldestReplyLeastEnegagementId = await getOldestReplyLeastEnegagement(user.id, postId).then(res => res?.id);
            const posts = await getPostReplies(user.id, postId);

            return res.status(200).json({
                posts,
                end: !oldestReplyLeastEnegagementId
                        ? true
                        : oldestReplyLeastEnegagementId === posts.slice(-1)[0].id
                            ? true
                            : false
            });
        }
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to fetch post replies' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getUserPosts = async (req: Request, res: Response) => {
    const username = req.params.username;
    const user = req.user as UserProps;
    const cursor = Number(req.query.cursor);

    try {
        if (cursor) {
            const userOldestPostId = await getOldestPost(username, user.id).then(res => res?.id);
            if (userOldestPostId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (cursor === userOldestPostId) {
                    return res.status(200).json({
                        posts: [],
                        end: true
                    });
                }
            }

            const posts = await getPosts(user.id, username, Number(cursor));

            return res.status(200).json({
                posts,
                // check if older posts array is empty and if truthy set the end to true
                // check if new cursor equals last post id
                //  if truthy, return older posts and set the end to true
                end: posts.length === 0
                        ? true
                        : userOldestPostId === posts.slice(1)[0].id
                            ? true
                            : false,
            });
        } else {
            const userOldestPostId = await getOldestPost(username, user.id).then(res => res?.id);
            const posts = await getPosts(user.id, username);
            
            return res.status(200).json({
                posts,
                end: !userOldestPostId
                        ? true 
                        : userOldestPostId === posts.slice(-1)[0].id
                            ? true 
                            : false
            });
        }
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to fetch the posts' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getUserReposts = async (req: Request, res: Response) => {
    const username = req.params.username;
    const user = req.user as UserProps;
    const cursor = Number(req.query.cursor);

    try {
        if (cursor) {
            const userOldestRepostId = await getOldestRepost(username, user.id).then(res => res?.id);
            if (userOldestRepostId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (cursor === userOldestRepostId) {
                    return res.status(200).json({
                        posts: [],
                        end: true
                    });
                }
            }

            const posts = await getReposts(user.id, username, Number(cursor));

            return res.status(200).json({
                posts,
                // check if older posts array is empty and if truthy set the end to true
                // check if new cursor equals last post id
                //  if truthy, return older posts and set the end to true
                end: posts.length === 0
                        ? true
                        : userOldestRepostId === posts.slice(-1)[0].id
                            ? true
                            : false,
            });
        } else {
            const userOldestRepostId = await getOldestRepost(username, user.id).then(res => res?.id);
            const posts = await getReposts(user.id, username);
            
            return res.status(200).json({
                posts,
                end: !userOldestRepostId
                        ? true 
                        : userOldestRepostId === posts.slice(-1)[0].id
                            ? true 
                            : false
            });
        }
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to fetch reposts' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getUserReplies = async (req: Request, res: Response) => {
    const username = req.params.username;
    const user = req.user as UserProps;
    const cursor = Number(req.query.cursor);

    try {
        if (cursor) {
            const userOldestReplyId = await getOldestReply(username, user.id).then(res => res?.id);
            if (userOldestReplyId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (cursor === userOldestReplyId) {
                    return res.status(200).json({
                        posts: [],
                        end: true
                    });
                }
            }

            const posts = await getReplies(user.id, username, Number(cursor));

            return res.status(200).json({
                posts,
                // check if older posts array is empty and if truthy set the end to true
                // check if new cursor equals last post id
                //  if truthy, return older posts and set the end to true
                end: posts.length === 0
                    ? true
                    : userOldestReplyId === posts.slice(-1)[0].id
                        ? true
                        : false,
            });
        } else {
            const userOldestReplyId = await getOldestReply(username, user.id).then(res => res?.id);
            const posts = await getReplies(user.id, username);
            
            return res.status(200).json({
                posts,
                end: !userOldestReplyId
                        ? true 
                        : userOldestReplyId === posts.slice(-1)[0].id
                            ? true 
                            : false
            });
        }
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to fetch replies' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getUserMedia = async (req: Request, res: Response) => {
    const username = req.params.username;
    const user = req.user as UserProps;
    const cursor = Number(req.query.cursor);

    try {
        if (cursor) {
            const userOldestMediaId = await getOldestMedia(username, user.id).then(res => res?.id);
            if (userOldestMediaId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (cursor === userOldestMediaId) {
                    return res.status(200).json({
                        posts: [],
                        end: true
                    });
                }
            }

            const posts = await getMedia(user.id, username, Number(cursor));

            return res.status(200).json({
                posts,
                // check if older posts array is empty and if truthy set the end to true
                // check if new cursor equals last post id
                //  if truthy, return older posts and set the end to true
                end: posts.length === 0
                        ? true
                        : userOldestMediaId === posts.slice(-1)[0].id
                            ? true
                            : false,
            });
        } else {
            const userOldestMediaId = await getOldestMedia(username, user.id).then(res => res?.id);
            const posts = await getMedia(user.id, username);
            
            return res.status(200).json({
                posts,
                end: !userOldestMediaId 
                        ? true 
                        : userOldestMediaId === posts.slice(-1)[0].id
                            ? true 
                            : false
            });
        }
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to fetch the posts' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getUserLikes = async (req: Request, res: Response) => {
    const user = req.user as UserProps;
    const cursor = Number(req.query.cursor);

    try {
        if (cursor) {
            const userOldestLikeId = await getOldestLike(user.id).then(res => res?.post.id);
            if (userOldestLikeId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (cursor === userOldestLikeId) {
                    return res.status(200).json({
                        posts: [],
                        end: true
                    });
                }
            }

            const posts = await getLikes(user.id, Number(cursor)).then(res => res.map(like => like.post));

            return res.status(200).json({
                posts,
                // check if older posts array is empty and if truthy set the end to true
                // check if new cursor equals last post id
                //  if truthy, return older posts and set the end to true
                end: posts.length === 0
                    ? true
                    : userOldestLikeId === posts.slice(-1)[0].id
                        ? true
                        : false,
            });
        } else {
            const userOldestLikeId = await getOldestLike(user.id).then(res => res?.post.id);
            const posts = await getLikes(user.id).then(res => res.map(like => like.post));
            
            return res.status(200).json({
                posts,
                end: !userOldestLikeId
                        ? true 
                        : userOldestLikeId === posts.slice(-1)[0].id
                            ? true 
                            : false
            });
        }
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to fetch likes' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getUserBookmarks = async (req: Request, res: Response) => {
    const user = req.user as UserProps;
    const cursor = Number(req.query.cursor);

    try {
        if (cursor) {
            const userOldestBookmarkId = await getOldestBookmark(user.id).then(res => res?.post.id);
            if (userOldestBookmarkId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (cursor === userOldestBookmarkId) {
                    return res.status(200).json({
                        posts: [],
                        end: true
                    });
                }
            }

            const posts = await getBookmarks(user.id, Number(cursor)).then(res => res.map(bookmark => bookmark.post));

            return res.status(200).json({
                posts,
                // check if older posts array is empty and if truthy set the end to true
                // check if new cursor equals last post id
                //  if truthy, return older posts and set the end to true
                end: posts.length === 0
                    ? true
                    : userOldestBookmarkId === posts.slice(-1)[0].id
                        ? true
                        : false,
            });
        } else {
            const userOldestBookmarkId = await getOldestLike(user.id).then(res => res?.post.id);
            const posts = await getBookmarks(user.id).then(res => res.map(bookmark => bookmark.post));
            
            return res.status(200).json({
                posts,
                end: !userOldestBookmarkId
                        ? true 
                        : posts.slice(-1)[0].id === userOldestBookmarkId 
                            ? true 
                            : false
            });
        }
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const addRepost = async (req: Request, res: Response) => {
    const user = req.user as UserProps;
    const postId = Number(req.params.id);

    try {
        const response = await addPostRepost(user.id, postId);

        if ('error' in response) {
            return res.status(400).json({ error: 'User has already reposted the post' });
        } else {
            // handle notifications
            createNotificationsForNewRepost(response.postId, user.id);

            return res.status(201).json({ response });
        }
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to repost the post' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const removeRepost = async (req: Request, res: Response) => {
    const user = req.user as UserProps;
    const postId = Number(req.params.id);

    try {
        const response = await removePostRepost(user.id, postId);

        if (!response) {
            return res.status(404).json({ message: "User has not reposted the post." });
        } else {
            // handle notifications
            removeNotificationsForRepost(response.postId, user.id);

            return res.status(201).json({ response });
        }
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to remove repost from the post' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const addLike = async (req: Request, res: Response) => {
    const user = req.user as UserProps;
    const postId = Number(req.params.id);

    try {
        const response = await addPostLike(user.id, postId);

        if ('error' in response) {
            return res.status(400).json({ error: 'User has already liked the post' });
        } else {
            // handle notifications
            createNotificationsForNewLike(response.postId, user.id);

            return res.status(201).json({ response });
        }
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to like the post' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const removeLike = async (req: Request, res: Response) => {
    const user = req.user as UserProps;
    const postId = Number(req.params.id);

    try {
        const response = await removePostLike(user.id, postId);

        if (!response) {
            return res.status(404).json({ message: "User has not liked the post." });
        } else {
            // handle notifications
            removeNotificationsForLike(response.postId, user.id);

            return res.status(201).json({ response });
        }
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to remove like from the post' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const addBookmark = async (req: Request, res: Response) => {
    const { id } = req.user as UserProps;
    const postId = Number(req.params.id);

    try {
        const response = await addPostBookmark(id, postId);

        if ('error' in response) {
            return res.status(400).json({ error: 'User has already bookmarked the post' });
        }

        return res.status(201).json({ response });
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to bookmark the post' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const removeBookmark = async (req: Request, res: Response) => {
    const { id } = req.user as UserProps;
    const postId = Number(req.params.id);

    try {
        const response = await removePostBookmark(id, postId);

        if (!response) {
            return res.status(404).json({ message: "User has not bookmarked the post." });
        }

        return res.status(201).json({ response });
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to remove bookmark from the post' });
    }
};


import { Request, Response } from 'express';
import { UserProps } from '../lib/types';
import {
    addPostBookmark,
    addPostLike,
    addPostRepost,
    addPost,
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
} from '../services/postService';
import { createNotificationsForNewLike, createNotificationsForNewPost, createNotificationsForNewReply, createNotificationsForNewRepost, removeNotificationsForLike, removeNotificationsForRepost } from '../services/notificationService';
import { deleteImageFromCloudinary } from './uploadController';

// ---------------------------------------------------------------------------------------------------------

export interface NewPostProps {
    text?: string,
    images?: string[],
    imagesPublicIds?: string[],
    replyToId?: number,
}

export const newPost = async (req: Request, res: Response) => {
    const user = req.user as UserProps;
    const { text, images, imagesPublicIds, replyToId } = req.body as NewPostProps;
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

        const response = await addPost(user.id, postData);
        if (!response) {
            imagesPublicIds?.forEach((img) => {
                deleteImageFromCloudinary(img);
            });
            return res.status(404).json({ error: 'Post has to contain either text or/and images' });
        }
        
        const postId = response.post.id;

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

        return res.status(201).json({ response });
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
    const cursor = Number(req.query.cursor);

    try {
        if (cursor) {
            const oldestGlobalPostId = await getOldestGlobal30DayPost(user.id).then(res => res.length > 0 ? res[0].id : null);
            if (oldestGlobalPostId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (cursor === oldestGlobalPostId) {
                    return res.status(200).json({
                        olderGlobalPosts: [],
                        end: true
                    });
                }
            }

            const olderGlobalPosts = await getGlobal30DayPosts(user.id, Number(cursor));
            const lastOlderGlobalPost = olderGlobalPosts.slice(-1);

            return res.status(200).json({
                olderGlobalPosts: olderGlobalPosts,
                // check if older posts array is empty and if truthy set the end to true
                // check if new cursor equals last post id
                //  if truthy, return older posts and set the end to true
                end: olderGlobalPosts.length === 0
                    ? true
                    : oldestGlobalPostId === lastOlderGlobalPost[0].id
                        ? true
                        : false,
            });
        } else {
            const oldestGlobalPostId = await getOldestGlobal30DayPost(user.id).then(res => res.length > 0 ? res[0].id : null);
            const posts = await getGlobal30DayPosts(user.id);
            
            return res.status(200).json({
                posts,
                end: oldestGlobalPostId === null ? true : posts.slice(-1)[0].id === oldestGlobalPostId ? true : false
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
    const cursor = Number(req.query.cursor);

    try {
        if (cursor) {
            const oldestFollowingPostId = await getOldestFollowing30DayPost(user.id).then(res => res.length > 0 ? res[0].id : null);
            if (oldestFollowingPostId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (cursor === oldestFollowingPostId) {
                    return res.status(200).json({
                        olderFollowingPosts: [],
                        end: true
                    });
                }
            }

            const olderFollowingPosts = await getFollowing30DayPosts(user.id, Number(cursor));
            const lastOlderFollowingPost = olderFollowingPosts.slice(-1);

            return res.status(200).json({
                olderFollowingPosts: olderFollowingPosts,
                // check if older posts array is empty and if truthy set the end to true
                // check if new cursor equals last post id
                //  if truthy, return older posts and set the end to true
                end: olderFollowingPosts.length === 0
                    ? true
                    : oldestFollowingPostId === lastOlderFollowingPost[0].id
                        ? true
                        : false,
            });
        } else {
            const oldestFollowingPostId = await getOldestFollowing30DayPost(user.id).then(res => res.length > 0 ? res[0].id : null) || null;
            const posts = await getFollowing30DayPosts(user.id);

            return res.status(200).json({
                posts,
                end: oldestFollowingPostId === null ? true : posts.slice(-1)[0].id === oldestFollowingPostId ? true : false
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
    const user = req.user as UserProps;

    try {
        // get original post, parent post if its a reply, and replies
        const post = await getPostInfo(user.id, postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        // check whether last reply is the end of replies
        const oldestReplyLeastEnegagementId = await getOldestReplyLeastEnegagement(user.id, postId).then(res => res.length > 0 ? res[0].id : null);
        console.log(oldestReplyLeastEnegagementId);
        
        return res.status(200).json({
            ...post,
            replies: [
                ...post.replies,
            ],
            repliesEnd: oldestReplyLeastEnegagementId
                ? post.replies.slice(-1)[0].id === oldestReplyLeastEnegagementId
                    ? true
                    : false
                : true,
        })
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to fetch the post' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getUserPosts = async (req: Request, res: Response) => {
    const username = req.params.username;
    const user = req.user as UserProps;
    const cursor = Number(req.query.cursor);

    try {
        if (cursor) {
            const userOldestPostId = await getOldestPost(username).then(res => res[0].id);
            if (userOldestPostId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (cursor === userOldestPostId) {
                    return res.status(200).json({
                        olderPosts: [],
                        end: true
                    });
                }
            }

            const userPosts = await getPosts(user.id, username, Number(cursor));
            const lastOlderPost = userPosts.slice(-1);

            return res.status(200).json({
                olderPosts: userPosts,
                // check if older posts array is empty and if truthy set the end to true
                // check if new cursor equals last post id
                //  if truthy, return older posts and set the end to true
                end: userPosts.length === 0
                    ? true
                    : userOldestPostId === lastOlderPost[0].id
                        ? true
                        : false,
            });
        } else {
            const userOldestPostId = await getOldestPost(username).then(res => res[0] ? res[0].id : null);
            const posts = await getPosts(user.id, username);
            
            return res.status(200).json({
                posts,
                end: userOldestPostId === null 
                    ? true 
                    : posts.slice(-1)[0].id === userOldestPostId 
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
            const userOldestRepostId = await getOldestRepost(username).then(res => res[0].id);
            if (userOldestRepostId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (cursor === userOldestRepostId) {
                    return res.status(200).json({
                        olderReposts: [],
                        end: true
                    });
                }
            }

            const userReposts = await getReposts(user.id, username, Number(cursor));
            const lastOlderRepost = userReposts.slice(-1);

            return res.status(200).json({
                olderReposts: userReposts,
                // check if older posts array is empty and if truthy set the end to true
                // check if new cursor equals last post id
                //  if truthy, return older posts and set the end to true
                end: userReposts.length === 0
                    ? true
                    : userOldestRepostId === lastOlderRepost[0].id
                        ? true
                        : false,
            });
        } else {
            const userOldestRepostId = await getOldestRepost(username).then(res => res[0] ? res[0].id : null);
            const reposts = await getReposts(user.id, username);
            
            return res.status(200).json({
                reposts,
                end: userOldestRepostId === null 
                    ? true 
                    : reposts.slice(-1)[0].id === userOldestRepostId 
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
            const userOldestReplyId = await getOldestReply(username).then(res => res[0].id);
            if (userOldestReplyId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (cursor === userOldestReplyId) {
                    return res.status(200).json({
                        olderReplies: [],
                        end: true
                    });
                }
            }

            const userReplies = await getReplies(user.id, username, Number(cursor));
            const lastOlderReply = userReplies.slice(-1);

            return res.status(200).json({
                olderReplies: userReplies,
                // check if older posts array is empty and if truthy set the end to true
                // check if new cursor equals last post id
                //  if truthy, return older posts and set the end to true
                end: userReplies.length === 0
                    ? true
                    : userOldestReplyId === lastOlderReply[0].id
                        ? true
                        : false,
            });
        } else {
            const userOldestReplyId = await getOldestReply(username).then(res => res[0] ? res[0].id : null);
            const replies = await getReplies(user.id, username);
            
            return res.status(200).json({
                replies,
                end: userOldestReplyId === null 
                    ? true 
                    : replies.slice(-1)[0].id === userOldestReplyId 
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
            const userOldestMediaId = await getOldestMedia(username).then(res => res[0].id);
            if (userOldestMediaId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (cursor === userOldestMediaId) {
                    return res.status(200).json({
                        olderPosts: [],
                        end: true
                    });
                }
            }

            const userMedia = await getMedia(user.id, username, Number(cursor));
            const lastOlderPost = userMedia.slice(-1);

            return res.status(200).json({
                olderMedia: userMedia,
                // check if older posts array is empty and if truthy set the end to true
                // check if new cursor equals last post id
                //  if truthy, return older posts and set the end to true
                end: userMedia.length === 0
                    ? true
                    : userOldestMediaId === lastOlderPost[0].id
                        ? true
                        : false,
            });
        } else {
            const userOldestMediaId = await getOldestMedia(username).then(res => res[0] ? res[0].id : null);
            const media = await getMedia(user.id, username);
            
            return res.status(200).json({
                media,
                end: userOldestMediaId === null 
                    ? true 
                    : media.slice(-1)[0].id === userOldestMediaId 
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
            const userOldestLikeId = await getOldestLike(user.id).then(res => res[0].post.id);
            if (userOldestLikeId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (cursor === userOldestLikeId) {
                    return res.status(200).json({
                        olderLikes: [],
                        end: true
                    });
                }
            }

            const userLikes = await getLikes(user.id, user.username, Number(cursor)).then(res => res.map(like => like.post));
            const lastOlderLike = userLikes.slice(-1);

            return res.status(200).json({
                olderLikes: userLikes,
                // check if older posts array is empty and if truthy set the end to true
                // check if new cursor equals last post id
                //  if truthy, return older posts and set the end to true
                end: userLikes.length === 0
                    ? true
                    : userOldestLikeId === lastOlderLike[0].id
                        ? true
                        : false,
            });
        } else {
            const userOldestLikeId = await getOldestLike(user.id).then(res => res[0] ? res[0].post.id : null);
            const likes = await getLikes(user.id, user.username).then(res => res.map(like => like.post));
            
            return res.status(200).json({
                likes,
                end: userOldestLikeId === null 
                    ? true 
                    : likes.slice(-1)[0].id === userOldestLikeId 
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
            const userOldestBookmarkId = await getOldestBookmark(user.id).then(res => res[0].post.id);
            if (userOldestBookmarkId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (cursor === userOldestBookmarkId) {
                    return res.status(200).json({
                        olderBookmarks: [],
                        end: true
                    });
                }
            }

            const userBookmarks = await getBookmarks(user.id, user.username, Number(cursor)).then(res => res.map(bookmark => bookmark.post));
            const lastOlderBookmark = userBookmarks.slice(-1);

            return res.status(200).json({
                olderBookmarks: userBookmarks,
                // check if older posts array is empty and if truthy set the end to true
                // check if new cursor equals last post id
                //  if truthy, return older posts and set the end to true
                end: userBookmarks.length === 0
                    ? true
                    : userOldestBookmarkId === lastOlderBookmark[0].id
                        ? true
                        : false,
            });
        } else {
            const userOldestBookmarkId = await getOldestLike(user.id).then(res => res[0] ? res[0].post.id : null);
            const bookmarks = await getBookmarks(user.id, user.username).then(res => res.map(bookmark => bookmark.post));
            
            return res.status(200).json({
                bookmarks,
                end: userOldestBookmarkId === null 
                    ? true 
                    : bookmarks.slice(-1)[0].id === userOldestBookmarkId 
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


        return res.status(201).json({ response });
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

// ---------------------------------------------------------------------------------------------------------

export const postReplies = async (req: Request, res: Response) => {
    const postId = Number(req.params.id);
    const user = req.user as UserProps;

    const cursor = Number(req.query.cursor);

    try {
        if (cursor) { 
            // order posts by likes and find the oldest one with no engagemenet
            const oldestReplyLeastEnegagementId = await getOldestReplyLeastEnegagement(user.id, postId).then(res => res.length > 0 ? res[0].id : null);
            if (oldestReplyLeastEnegagementId) {
                if (cursor === oldestReplyLeastEnegagementId) {
                    return res.status(200).json({
                        moreReplies: [],
                        end: true
                    });
                }
            }

            const moreReplies = await getPostReplies(user.id, postId, Number(cursor));
            if (moreReplies.length === 0) return res.status(200).json({
                moreReplies: [],
                end: true
            });

            const lastReplyInCurrentBatch = moreReplies.slice(-1);

            return res.status(200).json({
                moreReplies: moreReplies,
                end: oldestReplyLeastEnegagementId
                    ? oldestReplyLeastEnegagementId === lastReplyInCurrentBatch[0].id ? true : false
                    : true,
            });
        } else {
            const replies = await getPostReplies(user.id, postId);

            if (!replies) {
                return res.status(404).json({ message: "No replies found" });
            }

            return res.status(200).json({
                posts: replies,
                end: true
            });
        }
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to fetch post replies' });
    }
};

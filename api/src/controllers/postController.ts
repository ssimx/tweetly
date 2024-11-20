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
    postExists,
    removePostBookmark,
    removePostLike,
    removePostRepost,
} from '../services/postService';
import { createNotificationsForNewLike, createNotificationsForNewPost, createNotificationsForNewReply, createNotificationsForNewRepost, removeNotificationsForLike, removeNotificationsForRepost } from '../services/notificationService';

// ---------------------------------------------------------------------------------------------------------

interface NewPostProps {
    text: string,
    replyToId?: number,
}

export const newPost = async (req: Request, res: Response) => {
    const { text, replyToId } = req.body as NewPostProps;
    const user = req.user as UserProps;
    const postData = { text, replyToId, user };

    try {
        if (replyToId) {
            // Check if post exists
            const replyPost = await postExists(replyToId);
            if (!replyPost) return res.status(404).json({ error: 'Reply post does not exist' });
        }

        const response = await createPost(postData);

        if ('error' in response) {
            if (response.fields?.includes('content')) {
                return res.status(400).json({ error: 'content' });
            }
        } else {
            // handle notifications
            if (postData.replyToId === undefined) {
                createNotificationsForNewPost(response.post.id, user.id);
            } else {
                createNotificationsForNewReply(response.post.id, user.id);
            }

            return res.status(201).json({ response });
        }
    } catch (error) {
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
            const oldestGlobalPostId = await getOldestGlobal30DayPost().then(res => res[0].id);
            if (oldestGlobalPostId) {
                if (cursor === oldestGlobalPostId) {
                    return res.status(200).json({
                        olderGlobalPosts: [],
                        end: true
                    });
                }
            }

            const olderGlobalPosts = await getGlobal30DayPosts(user.id, Number(cursor));
            if (!olderGlobalPosts) return res.status(404).json({ error: "Couldn't find more posts" });

            const lastOlderGlobalPost = olderGlobalPosts.slice(-1);

            return res.status(200).json({
                olderGlobalPosts: olderGlobalPosts,
                end: oldestGlobalPostId
                    ? oldestGlobalPostId === lastOlderGlobalPost[0].id ? true : false
                    : true,
            });
        } else {
            const response = await getGlobal30DayPosts(user.id);
            return res.status(200).json({ response });
        }
    } catch (error) {
        console.error('Error fetching data: ', error);
        return res.status(500).json({ error: 'Failed to fetch the data' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const following30DayPosts = async (req: Request, res: Response) => {
    const user = req.user as UserProps;
    const cursor = Number(req.query.cursor);

    try {
        if (cursor) {
            const oldestFollowingPostId = await getOldestFollowing30DayPost(user.id).then(res => res[0].id);
            if (oldestFollowingPostId) {
                if (cursor === oldestFollowingPostId) {
                    return res.status(200).json({
                        olderFollowingPosts: [],
                        end: true
                    });
                }
            }

            const olderFollowingPosts = await getFollowing30DayPosts(user.id, Number(cursor));
            if (!olderFollowingPosts) return res.status(404).json({ error: "Couldn't find more posts" });

            const lastOlderFollowingPost = olderFollowingPosts.slice(-1);

            return res.status(200).json({
                olderFollowingPosts: olderFollowingPosts,
                end: oldestFollowingPostId
                    ? oldestFollowingPostId === lastOlderFollowingPost[0].id ? true : false
                    : true,
            });
        } else {
            const response = await getFollowing30DayPosts(user.id);
            return res.status(200).json({ response });
        }
    } catch (error) {
        console.error('Error fetching data: ', error);
        return res.status(500).json({ error: 'Failed to fetch the data' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getPost = async (req: Request, res: Response) => {
    const postId = Number(req.params.id);
    const user = req.user as UserProps;

    try {
        const response = await getPostInfo(user.id, postId);
        if (!response) return res.status(404).json({ error: 'Post not found' });

        return res.status(201).json(response);
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
            const userOldestPost = await getOldestPost(username).then(res => res[0].id);
            if (userOldestPost) {
                if (cursor === userOldestPost) {
                    return res.status(200).json({
                        olderFollowingPosts: [],
                        end: true
                    });
                }
            }

            const userPosts = await getPosts(user.id, username, Number(cursor));
            if (!userPosts) return res.status(404).json({ error: "Couldn't find more posts" });

            const lastOlderPost = userPosts.slice(-1);

            return res.status(200).json({
                olderUserPosts: userPosts,
                end: userOldestPost
                    ? userOldestPost === lastOlderPost[0].id ? true : false
                    : true,
            });
        } else {
            const response = await getPosts(user.id, username);
            if (!response) return res.status(404).json({ error: 'User or posts not found' });
            return res.status(201).json(response);
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
            const userOldestRepost= await getOldestRepost(username).then(res => res[0].id);
            if (userOldestRepost) {
                if (cursor === userOldestRepost) {
                    return res.status(200).json({
                        olderFollowingPosts: [],
                        end: true
                    });
                }
            }

            const userReposts = await getReposts(user.id, username, Number(cursor));
            if (!userReposts) return res.status(404).json({ error: "Couldn't find more reposts" });

            const lastOlderRepost = userReposts.slice(-1);

            return res.status(200).json({
                olderUserReposts: userReposts,
                end: userOldestRepost
                    ? userOldestRepost === lastOlderRepost[0].id ? true : false
                    : true,
            });
        } else {
            const response = await getReposts(user.id, username);
            if (!response) return res.status(404).json({ error: 'User or reposts not found' });
            return res.status(201).json(response);
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
            const userOldestReply = await getOldestReply(username).then(res => res[0].id);
            if (userOldestReply) {
                if (cursor === userOldestReply) {
                    return res.status(200).json({
                        olderFollowingPosts: [],
                        end: true
                    });
                }
            }

            const userReplies = await getReplies(user.id, username, Number(cursor));
            if (!userReplies) return res.status(404).json({ error: "Couldn't find more replies" });

            const lastOlderReply = userReplies.slice(-1);

            return res.status(200).json({
                olderUserReplies: userReplies,
                end: userOldestReply
                    ? userOldestReply === lastOlderReply[0].id ? true : false
                    : true,
            });
        } else {
            const response = await getReplies(user.id, username);
            if (!response) return res.status(404).json({ error: 'User or replies not found' });
            return res.status(201).json(response);
        }
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to fetch replies' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getUserLikes = async (req: Request, res: Response) => {
    const user = req.user as UserProps;
    const cursor = Number(req.query.cursor);

    try {
        if (cursor) {
            const userOldestLike = await getOldestLike(user.id).then(res => res[0].post.id);
            if (userOldestLike) {
                if (cursor === userOldestLike) {
                    return res.status(200).json({
                        olderFollowingPosts: [],
                        end: true
                    });
                }
            }

            const userLikes = await getLikes(user.id, user.username, Number(cursor));
            if (!userLikes) return res.status(404).json({ error: "Couldn't find more likes" });

            const lastOlderLike = userLikes.slice(-1);

            return res.status(200).json({
                olderUserLikes: userLikes,
                end: userOldestLike
                    ? userOldestLike === lastOlderLike[0].post.id ? true : false
                    : true,
            });
        } else {
            const response = await getLikes(user.id, user.username);
            if (!response) return res.status(404).json({ error: 'User or likes not found' });
            return res.status(201).json(response);
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
            const userOldestBookmark = await getOldestBookmark(user.id).then(res => res[0].post.id);
            if (userOldestBookmark) {
                if (cursor === userOldestBookmark) {
                    return res.status(200).json({
                        olderFollowingPosts: [],
                        end: true
                    });
                }
            }

            const userBookmarks = await getBookmarks(user.id, user.username, Number(cursor));
            if (!userBookmarks) return res.status(404).json({ error: "Couldn't find more bookmarks" });

            const lastOlderBookmark = userBookmarks.slice(-1);

            return res.status(200).json({
                olderUserBookmarks: userBookmarks,
                end: userOldestBookmark
                    ? userOldestBookmark === lastOlderBookmark[0].post.id ? true : false
                    : true,
            });
        } else {
            const response = await getBookmarks(user.id, user.username);
            if (!response) return res.status(404).json({ error: 'User or bookmarks not found' });
            return res.status(201).json(response);
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
            const oldestReplyLeastEnegagementId = await getOldestReplyLeastEnegagement(postId).then(res => res[0].id);
            if (oldestReplyLeastEnegagementId) {
                if (cursor === oldestReplyLeastEnegagementId) {
                    return res.status(200).json({
                        moreReplies: [],
                        end: true
                    });
                }
            }

            console.log(oldestReplyLeastEnegagementId);

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

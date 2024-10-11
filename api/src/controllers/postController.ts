import { Request, Response } from 'express';
import { UserProps } from '../lib/types';
import { addPostBookmark, addPostLike, addPostRepost, createPost, getGlobal30DayPosts, getPostInfo, getPostReplies, getPosts, getReposts, postExists, removePostBookmark, removePostLike, removePostRepost } from '../services/postService';

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
        }

        return res.status(201).json({ response });
    } catch (error) {
        console.error('Error saving post data: ', error);
        return res.status(500).json({ error: 'Failed to process the data' });
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

    try {
        const response = await getPosts(username);
        if (!response) return res.status(404).json({ error: 'User or posts not found' });

        return res.status(201).json(response);
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to fetch the post' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getUserReposts = async (req: Request, res: Response) => {
    const username = req.params.username;

    try {
        const response = await getReposts(username);
        if (!response) return res.status(404).json({ error: 'User or reposts not found' });

        return res.status(201).json(response);
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to fetch the post' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const global30DayPosts = async (req: Request, res: Response) => {
    const user = req.user as UserProps;

    try {
        const response = await getGlobal30DayPosts(user.id);
        return res.status(201).json({ response });
    } catch (error) {
        console.error('Error fetching data: ', error);
        return res.status(500).json({ error: 'Failed to fetch the data' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const addRepost = async (req: Request, res: Response) => {
    const { id } = req.user as UserProps;
    const postId = Number(req.params.id);

    try {
        const response = await addPostRepost(id, postId);

        if ('error' in response) {
            return res.status(400).json({ error: 'User has already reposted the post' });
        }

        return res.status(201).json({ response });
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to repost the post' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const removeRepost = async (req: Request, res: Response) => {
    const { id } = req.user as UserProps;
    const postId = Number(req.params.id);

    try {
        const response = await removePostRepost(id, postId);

        if (!response) {
            return res.status(404).json({ message: "User has not reposted the post." });
        }

        return res.status(201).json({ response });
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to remove repost from the post' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const addLike = async (req: Request, res: Response) => {
    const { id } = req.user as UserProps;
    const postId = Number(req.params.id);

    try {
        const response = await addPostLike(id, postId);

        if ('error' in response) {
            return res.status(400).json({ error: 'User has already liked the post' });
        }

        return res.status(201).json({ response });
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to like the post' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const removeLike = async (req: Request, res: Response) => {
    const { id } = req.user as UserProps;
    const postId = Number(req.params.id);

    try {
        const response = await removePostLike(id, postId);

        if (!response) {
            return res.status(404).json({ message: "User has not liked the post." });
        }

        return res.status(201).json({ response });
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

export const getReplies = async (req: Request, res: Response) => {
    const postId = Number(req.params.id);
    const user = req.user as UserProps;

    try {
        const response = await getPostReplies(user.id, postId);

        if (!response) {
            return res.status(404).json({ message: "No replies found" });
        }

        return res.status(201).json(response);
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to fetch post replies' });
    }
};

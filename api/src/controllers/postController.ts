import { Request, Response } from 'express';
import { UserProps } from '../lib/types';
import { createPost, getPost } from '../services/postService';

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
            const replyPost = await getPost(replyToId);
            if (!replyPost) return res.status(404).json({ error: 'Reply post does not exist'});
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


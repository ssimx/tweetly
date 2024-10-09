import { Request, Response } from 'express';
import { addFollow, getProfile, getUser, removeFollow } from '../services/userService';
import { UserProps } from '../lib/types';

// ---------------------------------------------------------------------------------------------------------

export const getUserInfo = async (req: Request, res: Response) => {
    const { id } = req.user as UserProps;

    try {
        const userData = await getUser(id);

        if (!userData) return res.status(404).json({ error: 'User does not exist' });

        return res.status(201).json({ userData });
    } catch (error) {
        console.error('Error getting user: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getProfileInfo = async (req: Request, res: Response) => {
    const username = req.params.username;

    try {
        const profileData = await getProfile(username);

        if (!profileData) return res.status(404).json({ error: 'Profile does not exist' });

        return res.status(201).json({ profileData });
    } catch (error) {
        console.error('Error getting profile: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const followUser = async (req: Request, res: Response) => {
    const username = req.params.username;
    const user = req.user as UserProps;
    
    try {
        const response = await addFollow(user.id, username);

        if (!response) return res.status(404).json({ error: 'failure' })

        return res.status(201).json('success');
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    };
};

// ---------------------------------------------------------------------------------------------------------

export const unfollowUser = async (req: Request, res: Response) => {
    const username = req.params.username;
    const user = req.user as UserProps;

    try {
        const response = await removeFollow(user.id, username);

        if (!response) return res.status(404).json({ error: 'failure' })

        return res.status(201).json('success');
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    };
};
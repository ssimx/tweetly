import { Request, Response } from 'express';
import { UserProps } from '../lib/types';
import { getNotifications } from '../services/notificationService';

// ---------------------------------------------------------------------------------------------------------

export const getUserNotifications = async (req: Request, res: Response) => {
    const user = req.user as UserProps;

    try {
        const notifications = await getNotifications(user.username, user.id);

        if (!notifications) return res.status(404).json({ error: 'No notifications found' });

        return res.status(201).json({ notifications });
    } catch (error) {
        console.error('Error getting notifications: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};

// ---------------------------------------------------------------------------------------------------------


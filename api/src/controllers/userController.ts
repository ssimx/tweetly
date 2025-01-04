import { Request, Response } from 'express';
import { addBlock, addFollow, addPushNotifications, deactivateUser, getFollowers, getFollowing, getFollowSuggestions, getProfile, getUser, getUserPassword, isUserDeactivated, removeBlock, removeFollow, removePushNotfications, updateProfile, updateUserPassword } from '../services/userService';
import { ProfileInfo, UserProps } from '../lib/types';
import { deleteImageFromCloudinary } from './uploadController';
import { getNotifications, updateNotificationsToRead } from '../services/notificationService';
const bcrypt = require('bcrypt');

// ---------------------------------------------------------------------------------------------------------

export const getUserInfo = async (req: Request, res: Response) => {
    const { id } = req.user as UserProps;

    try {
        const userData = await getUser(id);
        if (!userData) return res.status(404).json({ error: 'User does not exist' });

        const followSuggestions = await getFollowSuggestions(id);

        return res.status(201).json({ userData });
    } catch (error) {
        console.error('Error getting user: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getUserFollowSuggestions = async (req: Request, res: Response) => {
    const { id } = req.user as UserProps;

    try {
        const userData = await getUser(id);
        if (!userData) return res.status(404).json({ error: 'User does not exist' });

        const followSuggestions = await getFollowSuggestions(id);

        return res.status(201).json({ followSuggestions });
    } catch (error) {
        console.error('Error getting user: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getProfileInfo = async (req: Request, res: Response) => {
    const username = req.params.username;
    const user = req.user as UserProps;

    try {
        const profileData = await getProfile(user.id, username);

        if (!profileData) return res.status(404).json({ error: 'Profile does not exist' });

        return res.status(201).json({ profileData });
    } catch (error) {
        console.error('Error getting profile: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const updateProfileInfo = async (req: Request, res: Response) => {
    const user = req.user as UserProps;
    const username = req.params.username;
    if (user.username !== username) return res.status(401).json({ error: 'Unauthorized request' });

    const {
        data,
        bannerPicturePublicId,
        profilePicturePublicId
    }
        = await req.body as {
            data: ProfileInfo,
            bannerPicturePublicId?: string,
            profilePicturePublicId?: string,
        };

    console.log(data, bannerPicturePublicId, profilePicturePublicId);

    try {
        const response = await updateProfile(user.id, data);

        if (!response) {
            const bannerPicturePromise = bannerPicturePublicId && deleteImageFromCloudinary(bannerPicturePublicId);
            const profilePicturePromise = profilePicturePublicId && deleteImageFromCloudinary(profilePicturePublicId);

            const promises: Promise<Response>[] = [];
            if (bannerPicturePromise) promises.push(bannerPicturePromise);
            if (profilePicturePromise) promises.push(profilePicturePromise);

            await Promise.allSettled(promises);

            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(201).json('Success');
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getProfileFollowers = async (req: Request, res: Response) => {
    const username = req.params.username;
    const user = req.user as UserProps;

    try {
        const profileData = await getFollowers(user.id, username);

        if (!profileData) return res.status(404).json({ error: 'Profile does not exist' });

        return res.status(201).json({ profileData });
    } catch (error) {
        console.error('Error getting profile: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const getProfileFollowing = async (req: Request, res: Response) => {
    const username = req.params.username;
    const user = req.user as UserProps;

    try {
        const profileData = await getFollowing(user.id, username);

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

// ---------------------------------------------------------------------------------------------------------

export const blockUser = async (req: Request, res: Response) => {
    const username = req.params.username;
    const user = req.user as UserProps;

    try {
        const response = await addBlock(user.id, username);

        if (!response) return res.status(404).json({ error: 'User not found or already blocked' })

        return res.status(201).json('success');
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    };
};

// ---------------------------------------------------------------------------------------------------------

export const unblockUser = async (req: Request, res: Response) => {
    const username = req.params.username;
    const user = req.user as UserProps;

    try {
        const response = await removeBlock(user.id, username);

        if (!response) return res.status(404).json({ error: 'User not found or not blocked' })

        return res.status(201).json('success');
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    };
};

// ---------------------------------------------------------------------------------------------------------

export const enablePushNotifications = async (req: Request, res: Response) => {
    const username = req.params.username;
    const user = req.user as UserProps;

    try {
        const response = await addPushNotifications(user.id, username);

        if (!response) return res.status(404).json({ error: 'failure' })

        return res.status(201).json('success');
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    };
};

// ---------------------------------------------------------------------------------------------------------

export const disablePushNotifications = async (req: Request, res: Response) => {
    const username = req.params.username;
    const user = req.user as UserProps;

    try {
        const response = await removePushNotfications(user.id, username);

        if (!response) return res.status(404).json({ error: 'failure' })

        return res.status(201).json('success');
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    };
};

// ---------------------------------------------------------------------------------------------------------

export const getUserNotifications = async (req: Request, res: Response) => {
    const user = req.user as UserProps;

    try {
        const notifications = await getNotifications(user.id);

        if (!notifications) return res.status(404).json({ error: 'User has no notifications' });

        await updateNotificationsToRead(user.id);

        return res.status(201).json({ notifications });
    } catch (error) {
        console.error('Error getting notifications: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};

// ---------------------------------------------------------------------------------------------------------

interface ChangePasswordProps {
    currentPassword: string,
    newPassword: string,
};

export const changePassword = async (req: Request, res: Response) => {
    const user = req.user as UserProps;
    const { currentPassword, newPassword } = req.body as ChangePasswordProps;

    try {
        // Check if the current password is correct
        const userCurrentPassword: string = await getUserPassword(user.id).then(res => res?.password) as string;

        if (!(await bcrypt.compare(currentPassword, userCurrentPassword))) {
            return res.status(401).json({ error: 'Incorrect current password' });
        }

        const hashedNewPassword: string = await bcrypt.hash(newPassword, 10);
        await updateUserPassword(user.id, hashedNewPassword);

        return res.status(201).json('success');
    } catch (error) {
        console.error('Error updating password: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const deactivateAccount = async (req: Request, res: Response) => {
    const user = req.user as UserProps;

    try {
        const isAlreadyDeactivated = await isUserDeactivated(user.id).then(res => res?.deactivatedAt);
        if (isAlreadyDeactivated !== null) return res.status(404).json({ error: 'User already deactivated' });

        await deactivateUser(user.id);

        return res.status(201).json('success');
    } catch (error) {
        console.error('Error deactivating user: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};
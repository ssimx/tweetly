import { createNotificationForNewFollow, removeNotificationForFollow } from './../services/notificationService';
import { Request, Response } from 'express';
import { addBlock, addFollow, addPushNotifications, deactivateUser, getFollowers, getFollowing, getFollowSuggestions, getProfile, getUser, getUserByEmail, getUserByUsername, getUserPassword, isUserDeactivated, removeBlock, removeFollow, removePushNotfications, updateProfile, updateUserBirthday, updateUserEmail, updateUserPassword, updateUserUsername } from '../services/userService';
import { ProfileInfo, UserProps } from '../lib/types';
import { deleteImageFromCloudinary } from './uploadController';
import { getNotifications, getOldestNotification, updateNotificationsToRead } from '../services/notificationService';
import { generateToken } from '../utils/jwt';
const bcrypt = require('bcrypt');

// ---------------------------------------------------------------------------------------------------------

export const getUserInfo = async (req: Request, res: Response) => {
    const { id } = req.user as UserProps;
    
    try {
        const user = await getUser(id);
        if (!user) return res.status(404).json({ error: 'User does not exist' });

        return res.status(201).json({ user });
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

        console.log('fetch')

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
        const profile = await getProfile(user.id, username);

        if (!profile) return res.status(404).json({ error: 'Profile does not exist' });

        return res.status(201).json({ profile });
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
        
        createNotificationForNewFollow(user.id, username);

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
        
        removeNotificationForFollow(user.id, username);

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
    const params = req.query;
    const cursor = params.cursor;

    try {
        if (cursor) {
            const oldestNotificationId = await getOldestNotification(user.id).then(res => res?.id);
            if (oldestNotificationId) {
                // check if current cursor equals last post id
                // if truthy, return empty array and set the end to true
                if (Number(cursor) === oldestNotificationId) {
                    return res.status(200).json({
                        notifications: [],
                        end: true
                    });
                }
            }

            const notifications = await getNotifications(user.id, Number(cursor));
            await updateNotificationsToRead(user.id);

            return res.status(200).json({
                notifications: notifications,
                // check if older posts array is empty and if truthy set the end to true
                // check if new cursor equals last post id
                //  if truthy, return older posts and set the end to true
                end: notifications.length === 0
                        ? true
                        : oldestNotificationId === notifications.slice(-1)[0].id
                            ? true
                            : false,
            });
        } else {
            const oldestNotificationId = await getOldestNotification(user.id).then(res => res?.id);
            const notifications = await getNotifications(user.id, Number(cursor));
            await updateNotificationsToRead(user.id);
            
            return res.status(200).json({
                notifications: notifications,
                end: !oldestNotificationId
                    ? true : oldestNotificationId === notifications.slice(-1)[0].id
                        ? true
                        : false
            });
        }
    } catch (error) {
        console.error('Error fetching data: ', error);
        return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const changeUsername = async (req: Request, res: Response) => {
    const user = req.user as UserProps;
    const { newUsername } = req.body;

    try {
        if (user.username === newUsername) return res.status(401).json({ error: 'New username must be different than the current one.' });

        const fetchedUser = await getUserByUsername(newUsername);
        if (fetchedUser) return res.status(401).json({ error: 'That username has been taken. Please choose another.' });

        newUsername.toLowerCase();
        const updatedInfo = await updateUserUsername(user.id, newUsername);

        const tokenPayload = {
            id: updatedInfo.id,
            username: updatedInfo.username,
            email: updatedInfo.email,
        }

        // Generate and send JWT token
        const token: string = generateToken(tokenPayload);

        return res.status(201).json({ token });
    } catch (error) {
        console.error('Error updating password: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const changeEmail = async (req: Request, res: Response) => {
    const user = req.user as UserProps;
    const { newEmail } = req.body;

    try {
        if (user.email === newEmail) return res.status(401).json({ error: 'New email must be different than the current one.' });

        const fetchedUser = await getUserByEmail(newEmail);
        if (fetchedUser) return res.status(401).json({ error: 'That email has been taken. Please choose another.' });

        newEmail.toLowerCase();
        const updatedInfo = await updateUserEmail(user.id, newEmail);

        const tokenPayload = {
            id: updatedInfo.id,
            username: updatedInfo.username,
            email: updatedInfo.email,
        }

        // Generate and send JWT token
        const token: string = generateToken(tokenPayload);

        return res.status(201).json({ token });
    } catch (error) {
        console.error('Error updating password: ', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const changeBirthday = async (req: Request, res: Response) => {
    const user = req.user as UserProps;
    const { year, month, day } = req.body as { year: String, month: String, day: String };

    try {
        const birthDate = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
        const now = new Date();

        let age = now.getFullYear() - birthDate.getFullYear();

        // Adjust age if birthday hasn't occurred this year yet
        if (now.getMonth() < birthDate.getMonth() ||
            (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 13) return res.status(401).json({ error: 'User must be older than 13' });

        let currentBirthday = await getUser(user.id).then(res => res?.dateOfBirth);
        if (!currentBirthday) return res.status(401).json({ error: 'User not found' });

        const currentYear = String(currentBirthday.getFullYear());
        const currentMonth = String(currentBirthday.getMonth() + 1);
        const currentDay = String(currentBirthday.getDate());
        if (currentYear == year && currentMonth === month && currentDay === day) return res.status(401).json({ error: 'New birth date must be different than the current one' });

        await updateUserBirthday(user.id, new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))));

        return res.status(201).json(true);
    } catch (error) {
        console.error('Error updating birthday: ', error);
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
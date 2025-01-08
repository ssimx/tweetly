import { User } from './../../../next/src/lib/types';
import { Request, Response } from 'express';
import { checkUserExsistence, createUserAndProfile, getUserLogin } from "../services/authService";
import { generateSettingsToken, generateToken } from '../utils/jwt';
import { PassportError, UserProps } from '../lib/types';
import passport from 'passport';
const bcrypt = require('bcrypt');

// ---------------------------------------------------------------------------------------------------------

interface SignUpDataProps {
    username: string,
    dateOfBirth: string,
    email: string,
    password: string,
};

export const registerUser = async (req: Request, res: Response) => {
    const { username, email, dateOfBirth, password } = req.body as SignUpDataProps;

    try {
        // check if user already exists
        const existingUser = await checkUserExsistence(username, email);
        if (existingUser) {
            if (existingUser.username === username && existingUser.email === email) {
                return res.status(400).json({ error: 'username and email' });
            }
            if (existingUser.username === username) {
                return res.status(400).json({ error: 'username' });
            }
            if (existingUser.email === email) {
                return res.status(400).json({ error: 'email' });
            }
        }

        // Hash the password before saving it
        const hashedPassword: string = await bcrypt.hash(password, 10);

        // Convert date string to date
        const birthDate = new Date(Date.UTC(Number(new Date(dateOfBirth).getFullYear()), Number(new Date(dateOfBirth).getMonth() )- 1, Number(new Date(dateOfBirth).getDate())));

        // Try to save the new user
        username.toLowerCase();
        email.toLowerCase();
        const response = await createUserAndProfile({ username, email, birthDate, hashedPassword });

        // Check if there was a unique constraint violation
        if ('error' in response) {
            if (response.fields?.includes('username') && response.fields?.includes('email')) {
                return res.status(400).json({ error: 'username and email' });
            }
            if (response.fields?.includes('username')) {
                return res.status(400).json({ error: 'username' });
            }
            if (response.fields?.includes('email')) {
                return res.status(400).json({ error: 'email' });
            }
        } else {
            const tokenPayload = {
                id: response.user.id,
                username: username,
                name: username,
                email: email,
                profilePicture: '',
            }

            const token: string = generateToken(tokenPayload);
            return res.status(200).json({ token });
        }
    } catch (error) {
        console.error('Error saving form data: ', error);
        res.status(500).json({ error: 'Failed to process the data' });
    }
};

// ---------------------------------------------------------------------------------------------------------

interface logInDataProps {
    username: string,
    password: string,
};

export const loginUser = async (req: Request, res: Response) => {
    const { username, password } = req.body as logInDataProps;

    try {
        // Find user in database
        const user = await getUserLogin(username);

        if (!user) {
            return res.status(401).json({ error: 'User not found'});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Incorrect password'});
        }

        const tokenPayload = {
            id: user.id,
            username: user.username,
            email: user.email,
        }

        // Generate and send JWT token
        const token: string = generateToken(tokenPayload);
        return res.status(200).json({ token });
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ---------------------------------------------------------------------------------------------------------

export const settingsAccess = async (req: Request, res: Response) => {
    console.log('test')
    const { password } = req.body as { password: string };
    const user = req.user as UserProps;

    try {
        // Find user in database
        const userInfo = await getUserLogin(user.username);

        if (!userInfo) {
            return res.status(401).json({ error: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, userInfo.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        const tokenPayload = {
            id: userInfo.id,
            username: userInfo.username,
            email: userInfo.email,
        }

        // Generate and send settings JWT token with 15m expiry
        const token: string = generateSettingsToken(tokenPayload);
        return res.status(200).json({ token });
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
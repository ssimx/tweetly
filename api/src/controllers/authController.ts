import { signUpDataSchema, SignUpDataType } from 'tweetly-shared';
import { NextFunction, Request, Response } from 'express';
import { checkUserExsistence, createUserAndProfile, getUserLogin } from "../services/authService";
import { generateSettingsToken, generateToken } from '../utils/jwt';
import { UserProps } from '../lib/types';
import { AppError } from '../middleware/errorHandler';
import bcrypt from 'bcrypt';

// ---------------------------------------------------------------------------------------------------------

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    let signUpData = req.body as SignUpDataType;
    
    try {
        const validatedData = signUpDataSchema.parse(signUpData);
    
        let { year, day, month, username, email, password, confirmPassword } = validatedData;
    
        // convert to lower case
        username = username.toLowerCase();
        email = email.toLowerCase();
    
        // convert year, month, day to Date object
        const dateOfBirth = new Date(`${year}-${('0' + month).slice(-2)}-${('0' + day).slice(-2)}`);

        // check if user already exists
        let existingUser;
        try {
            existingUser = await checkUserExsistence(username, email);
        } catch (error) {
            return next(new AppError('Database error while checking user existence', 500, 'DB_ERROR'));
        }

        if (existingUser) {
            if (existingUser.username === username && existingUser.email === email) {
                throw new AppError('Username and email already taken', 400, 'USERNAME_EMAIL_TAKEN');
            }
            if (existingUser.username === username) {
                throw new AppError('Username already taken', 400, 'USERNAME_TAKEN');
            }
            if (existingUser.email === email) {
                throw new AppError('Email already taken', 400, 'EMAIL_TAKEN');
            }
        }

        // Hash the password before saving it
        const hashedPassword: string = await bcrypt.hash(password, 10);

        // Try to save the new user
        const response = await createUserAndProfile(username, email, dateOfBirth, hashedPassword);

        // Check if there was a unique constraint violation
        if ('error' in response) {
            if (response.fields?.includes('username') && response.fields?.includes('email')) {
                throw new AppError('Username and email already taken', 400, 'USERNAME_EMAIL_TAKEN');
            }
            if (response.fields?.includes('username')) {
                throw new AppError('Username already taken', 400, 'USERNAME_TAKEN');
            }
            if (response.fields?.includes('email')) {
                throw new AppError('Email already taken', 400, 'EMAIL_TAKEN');
            }

            // Fallback error if `fields` exist but don't match expected values
            if (response.fields?.length) {
                throw new AppError(
                    `Unexpected unique constraint violation on: ${response.fields.join(', ')}`,
                    400,
                    'UNEXPECTED_FIELD_ERROR'
                );
            }

            // If no specific fields were provided, throw a generic database error
            throw new AppError('Database error while creating a new user', 500, 'DB_ERROR');
        } else {
            const tokenPayload = {
                id: response.user.id,
                username: username,
                name: username,
                email: email,
                profilePicture: '',
            }

            const token: string = generateToken(tokenPayload);
            return res.status(200).json({
                success: true,
                data: { token },
            });
        }
    } catch (error) {
        next(error);
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
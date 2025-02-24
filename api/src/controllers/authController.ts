import { AppError, LoggedInTemporaryUserDataType, SuccessfulLoginResponseType, SuccessfulRegisterResponseType, SuccessResponse, temporaryUserBasicDataSchema, temporaryUserPasswordSchema, temporaryUserUsernameSchema } from 'tweetly-shared';
import { NextFunction, Request, Response } from 'express';
import { checkEmailAvailability, createTemporaryUser, createUserAndProfile, getUserLogin, updateTemporaryUserPassword, updateTemporaryUserUsername } from "../services/authService";
import { generateSettingsToken, generateTemporaryUserToken } from '../utils/jwt';
import { UserProps } from '../lib/types';
import bcrypt from 'bcrypt';

// ---------------------------------------------------------------------------------------------------------

export const registerTempUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let body = req.body;

    try {
        if (!body) {
            throw new AppError('User data is missing', 404, 'MISSING_DATA');
        }

        const validatedBasicData = temporaryUserBasicDataSchema.parse(body);

        let { profileName, email, year, day, month } = validatedBasicData;

        // convert to lower case
        profileName = profileName.toLowerCase();
        email = email.toLowerCase();

        // convert year, month, day to Date object
        const dateOfBirth = new Date(`${year}-${('0' + month).slice(-2)}-${('0' + day).slice(-2)}`);

        // check if user already exists
        let existingUser;
        try {
            existingUser = await checkEmailAvailability(email);
        } catch (error) {
            return next(new AppError('Database error while checking user existence', 500, 'DB_ERROR'));
        }

        if (existingUser) {
            throw new AppError('Email is already in use', 400, 'EMAIL_TAKEN');
        }

        // Hash the password before saving it
        // const hashedPassword: string = await bcrypt.hash(password, 10);

        // Try to create a new temporary user
        const response = await createTemporaryUser(profileName, email, dateOfBirth);

        // Check if there was a unique constraint violation
        if ('error' in response) {
            if (response.fields?.includes('email')) {
                throw new AppError('Email is already in use', 400, 'EMAIL_TAKEN');
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
                type: 'temporary' as 'temporary',
                id: response.id,
                email: email,
            }

            const token: string = generateTemporaryUserToken(tokenPayload);

            const successResponse: SuccessResponse<SuccessfulRegisterResponseType> = {
                success: true,
                data: { token },
            };

            res.status(200).json(successResponse);
        }
    } catch (error) {
        next(error);
    }
};

export const updateTempUserPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let body = req.body;
    const user = req.user as LoggedInTemporaryUserDataType;

    try {
        if (!body) {
            throw new AppError('User password is missing', 404, 'MISSING_DATA');
        }

        if (!user) {
            throw new AppError('User not logged in', 404, 'NOT_LOGGED_IN');
        }

        const validatedPassword = temporaryUserPasswordSchema.parse(body);

        let { password } = validatedPassword;

        // Hash the password before saving it
        const hashedPassword: string = await bcrypt.hash(password, 10);

        // Try to create a new temporary user
        const response = await updateTemporaryUserPassword(user.id, hashedPassword);
        if (!response) {
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        const successResponse: SuccessResponse<SuccessfulRegisterResponseType> = {
            success: true,
        };

        res.status(200).json(successResponse);
    } catch (error) {
        next(error);
    }
};

export const updateTempUserUsername = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let body = req.body;
    const user = req.user as LoggedInTemporaryUserDataType;

    try {
        if (!body) {
            throw new AppError('User username is missing', 404, 'MISSING_DATA');
        }

        if (!user) {
            throw new AppError('User not logged in', 404, 'NOT_LOGGED_IN');
        }

        const validatedUsername = temporaryUserUsernameSchema.parse(body);

        // Try to create a new temporary user
        const response = await updateTemporaryUserUsername(user.id, validatedUsername.username);
        if (!response) {
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        const successResponse: SuccessResponse<SuccessfulRegisterResponseType> = {
            success: true,
        };

        res.status(200).json(successResponse);
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

interface logInDataProps {
    username: string,
    password: string,
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body as logInDataProps;

    try {
        // Find user in database
        const user = await getUserLogin(username);

        if (!user) {
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new AppError('Incorrect login password', 401, 'INCORRECT_PASSWORD');
        }

        const tokenPayload = {
            id: user.id,
            username: user.username,
            email: user.email,
        }

        // Generate and send JWT token
        const token: string = generateToken(tokenPayload);

        const successResponse: SuccessResponse<SuccessfulLoginResponseType> = {
            success: true,
            data: { token },
        };

        res.status(200).json(successResponse);
    } catch (error) {
        next(error);
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
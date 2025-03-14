import { AppError, FormLogInUserDataType, FormTemporaryUserBasicDataType, FormTemporaryUserPasswordType, LoggedInTemporaryUserDataType, LoggedInUserJwtPayload, logInUserSchema, SuccessfulLoginResponseType, SuccessfulRegisterResponseType, SuccessResponse, temporaryUserBasicDataSchema, temporaryUserPasswordSchema, temporaryUserProfilePictureSchema, temporaryUserUsernameSchema, userSettingsAccessSchema } from 'tweetly-shared';
import { NextFunction, Request, Response } from 'express';
import { checkEmailAvailability, createTemporaryUser, createUserAndProfile, getTemporaryUserLogin, getUserLogin, removeTemporaryUser, updateTemporaryUserProfilePicture, updateTemporaryUserUsername } from "../services/authService";
import { generateUserSettingsToken, generateTemporaryUserToken, generateUserSessionToken } from '../utils/jwt';
import { UserProps } from '../lib/types';
import bcrypt from 'bcrypt';

// ---------------------------------------------------------------------------------------------------------

export const registerTempUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const body = req.body as { basicData: FormTemporaryUserBasicDataType, passwordData: FormTemporaryUserPasswordType };

    try {
        if (!body) {
            throw new AppError('Request information is missing', 404, 'MISSING_DATA');
        } else if (!body.basicData) {
            throw new AppError('Basic user information is missing', 404, 'MISSING_DATA');
        } else if (!body.passwordData) {
            throw new AppError('Password information is missing', 404, 'MISSING_DATA');
        }

        const validatedBasicData = temporaryUserBasicDataSchema.parse(body.basicData);
        const validatedPassword = temporaryUserPasswordSchema.parse(body.passwordData);

        let { profileName, email, year, day, month } = validatedBasicData;
        let { password } = validatedPassword;

        // convert to lower case
        profileName = profileName.toLowerCase();
        email = email.toLowerCase();

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

        // convert year, month, day to Date object
        const dateOfBirth = new Date(`${year}-${('0' + month).slice(-2)}-${('0' + day).slice(-2)}`);

        // Hash the password before saving it
        const hashedPassword: string = await bcrypt.hash(password, 10);

        // Try to create a new temporary user
        const response = await createTemporaryUser(profileName, email, dateOfBirth, hashedPassword);

        // Check if there was a unique constraint violation
        if ('error' in response) {
            if (response.fields?.includes('username')) {
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
        }

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

        return res.status(200).json(successResponse);
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

        // update temporary user
        const response = await updateTemporaryUserUsername(user.id, validatedUsername.username);

        if ('error' in response) {
            if (response.fields?.includes('username')) {
                throw new AppError('Username is already in use', 400, 'USERNAME_TAKEN');
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
        }

        const successResponse: SuccessResponse<undefined> = {
            success: true,
        };

        return res.status(200).json(successResponse);
    } catch (error) {
        next(error);
    }
};

export const updateTempUserProfilePicture = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user as LoggedInTemporaryUserDataType;

    try {
        if (!user) {
            throw new AppError('User not logged in', 404, 'NOT_LOGGED_IN');
        }

        // default picture url if user hasn't selected one
        let defaultPictureUrl: string = 'https://res.cloudinary.com/ddj6z1ptr/image/upload/v1728503826/profilePictures/ynh7bq3eynvkv5xhivaf.png';

        // uploaded picture if selected
        const cloudinaryUrl = req.body.cloudinaryUrls ? req.body.cloudinaryUrls[0] : null;

        // update temporary user
        const tempUser = await updateTemporaryUserProfilePicture(user.id, cloudinaryUrl ?? defaultPictureUrl);
        if (!tempUser) {
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        req.body.tempUserId = tempUser.id;
        next();
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const tempUserId = req.body.tempUserId;

    try {
        if (!tempUserId) {
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        const removedTempuser = await removeTemporaryUser(tempUserId);
        if (!removedTempuser) {
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        // take temporary user data and create a real user
        const newUser = await createUserAndProfile(
            removedTempuser.profileName,
            removedTempuser.email,
            removedTempuser.dateOfBirth,
            removedTempuser.password!,
            removedTempuser.username!,
            removedTempuser.profilePicture!
        );

        // Check if there was a unique constraint violation
        if ('error' in newUser) {
            if (newUser.fields?.includes('email')) {
                throw new AppError('Email is already in use', 400, 'EMAIL_TAKEN');
            }

            // Fallback error if `fields` exist but don't match expected values
            if (newUser.fields?.length) {
                throw new AppError(
                    `Unexpected unique constraint violation on: ${newUser.fields.join(', ')}`,
                    400,
                    'UNEXPECTED_FIELD_ERROR'
                );
            }

            // If no specific fields were provided, throw a generic database error
            throw new AppError('Database error while creating a new user', 500, 'DB_ERROR');
        } else {
            const tokenPayload = {
                id: newUser.user.id,
                email: newUser.user.email,
                username: newUser.user.username
            } as LoggedInUserJwtPayload;

            const token: string = generateUserSessionToken(tokenPayload);

            const successResponse: SuccessResponse<SuccessfulRegisterResponseType> = {
                success: true,
                data: { token },
            };

            return res.status(200).json(successResponse);
        }
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate incoming data
        const body = await req.body as FormLogInUserDataType;
        if (!body) {
            throw new AppError('Log in data is missing', 404, 'MISSING_DATA');
        }

        const validatedData = logInUserSchema.parse(body);

        // Find user in database
        const user = await getUserLogin(validatedData.usernameOrEmail);
        let tempUser;
        if (!user) {
            tempUser = await getTemporaryUserLogin(validatedData.usernameOrEmail);
            if (!tempUser) throw new AppError(`User with provided ${validatedData.usernameOrEmail.includes('@') ? 'email' : 'username'} doesn't exist`, 404, 'USER_NOT_FOUND');

            const isPasswordValid = await bcrypt.compare(validatedData.password, tempUser.password);

            if (!isPasswordValid) {
                throw new AppError('Incorrect login password', 401, 'INCORRECT_PASSWORD');
            }

            // Generate and send JWT token
            const token: string = generateTemporaryUserToken({
                type: 'temporary',
                id: tempUser!.id,
                email: tempUser!.email
            });

            const successResponse: SuccessResponse<SuccessfulLoginResponseType> = {
                success: true,
                data: {
                    token: token
                },
            };

            return res.status(200).json(successResponse);
        }

        const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);

        if (!isPasswordValid) {
            throw new AppError('Incorrect login password', 401, 'INCORRECT_PASSWORD');
        }

        const tokenPayload = {
            id: user.id,
            username: user.username,
            email: user.email
        } as LoggedInUserJwtPayload;

        // Generate and send JWT token
        const token: string = generateUserSessionToken(tokenPayload);

        const successResponse: SuccessResponse<SuccessfulLoginResponseType> = {
            success: true,
            data: {
                token: token
            },
        };

        return res.status(200).json(successResponse);
    } catch (error) {
        next(error);
    }
};

// ---------------------------------------------------------------------------------------------------------

export const settingsAccess = async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body as { password: string };
    const user = req.user as UserProps;

    try {
        // Find user in database
        const userInfo = await getUserLogin(user.username);
        if (!userInfo) {
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        userSettingsAccessSchema.parse({ password });

        const isPasswordValid = await bcrypt.compare(password, userInfo.password);
        if (!isPasswordValid) {
            throw new AppError('Incorrect password', 404, 'INCORRECT_PASSWORD');
        }

        const tokenPayload = {
            id: userInfo.id,
            username: userInfo.username,
            email: userInfo.email,
        } as LoggedInUserJwtPayload;

        // Generate and send settings JWT token with 15m expiry
        const token: string = generateUserSettingsToken(tokenPayload);

        console.log(token)

        const successResponse: SuccessResponse<{ token: string }> = {
            success: true,
            data: {
                token: token
            },
        };

        return res.status(200).json(successResponse);
    } catch (error) {
        next(error);
    }
};
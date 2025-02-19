import { z } from 'zod';
import { logInUserSchema, registerTemporaryUserBasicDataSchema, registerUserDataSchema, updateTemporaryUserPasswordSchema, updateTemporaryUserProfilePictureSchema, updateTemporaryUserUsernameSchema } from '../schemas/authSchemas';

// Type for register temporary user data
export type RegisterTemporaryUserBasicDataType = z.infer<typeof registerTemporaryUserBasicDataSchema>;

// Type for updating temporary user password
export type updateTemporaryUserPasswordType = z.infer<typeof updateTemporaryUserPasswordSchema>;

// Type for updating temporary user password
export type updateTemporaryUserUsernameType = z.infer<typeof updateTemporaryUserUsernameSchema>;

// Type for updating temporary user password
export type updateTemporaryUserProfilePictureType = z.infer<typeof updateTemporaryUserProfilePictureSchema>;

// Type for temporary user information
export type TemporaryUserDataType = {
    id: number,
    createdAt: string,
    updatedAt: string,
    profileName: string,
    email: string,
    emailVerified: boolean,
    dateOfBirth: string,
    password?: string,
    username?: string,
    profilePicture?: string,
    registrationComplete: boolean,
};

// Type for register user data
export type RegisterUserDataType = z.infer<typeof registerUserDataSchema>;

// Type for log in user data
export type LogInUserDataType = z.infer<typeof logInUserSchema>;
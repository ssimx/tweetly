import { z } from 'zod';
import { logInUserSchema, temporaryUserBasicDataSchema, registerUserDataSchema, temporaryUserPasswordSchema, updateTemporaryUserProfilePictureSchema, updateTemporaryUserUsernameSchema } from '../schemas/authSchemas';

// Type for register temporary user data
export type FormTemporaryUserBasicDataType = z.infer<typeof temporaryUserBasicDataSchema>;

// Type for updating temporary user password
export type FormTemporaryUserPasswordType = z.infer<typeof temporaryUserPasswordSchema>;

// Type for updating temporary user username
export type FormTemporaryUserUsernameType = z.infer<typeof updateTemporaryUserUsernameSchema>;

// Type for updating temporary user profile picture
export type FormTemporaryUserProfilePictureType = z.infer<typeof updateTemporaryUserProfilePictureSchema>;

// Type for register user data form
export type FormFormRegisterUserDataType = z.infer<typeof registerUserDataSchema>;

// Type for log in user data form
export type FormFormLogInUserDataType = z.infer<typeof logInUserSchema>;
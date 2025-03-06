import { z } from 'zod';
import { logInUserSchema, temporaryUserBasicDataSchema, registerUserDataSchema, temporaryUserPasswordSchema, temporaryUserUsernameSchema, temporaryUserProfilePictureSchema, userSettingsAccessSchema } from '../schemas/authSchemas';

// Type for temporary user basic data
export type FormTemporaryUserBasicDataType = z.infer<typeof temporaryUserBasicDataSchema>;

// Type for temporary user password
export type FormTemporaryUserPasswordType = z.infer<typeof temporaryUserPasswordSchema>;

// Type for updating temporary user username
export type FormTemporaryUserUsernameType = z.infer<typeof temporaryUserUsernameSchema>;

// Type for updating temporary user profile picture
export type FormTemporaryUserProfilePictureType = z.infer<typeof temporaryUserProfilePictureSchema>;

// Type for log in user data form
export type FormLogInUserDataType = z.infer<typeof logInUserSchema>;

// Type for settings access data form
export type FormUserSettingsAccessType = z.infer<typeof userSettingsAccessSchema>;
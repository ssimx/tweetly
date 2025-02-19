import { z } from 'zod';

// UPDATE USER INFO

export const userSettingsAccessSchema = z.object({
    password: z
        .string()
        .trim()
        .min(1, "Please enter password"),
});

export type UserSettingsAccessType = z.infer<typeof userSettingsAccessSchema>;

export const userUpdatePasswordSchema = z.object({
    currentPassword: z
        .string()
        .trim()
        .min(1, "Please enter current password"),
    newPassword: z
        .string()
        .trim()
        .min(8, "New password must contain at least 8 characters"),
    newConfirmPassword: z
        .string()
        .trim(),
}).superRefine((data, ctx) => {
    // Check if currentPassword is the same as newPassword
    if (data.currentPassword === data.newPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "New password can't be the same as the old one",
            path: ['newPassword'], // Path for error message
        });
    }

    // Check if newPassword matches newConfirmPassword
    if (data.newPassword !== data.newConfirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Passwords do not match',
            path: ['newConfirmPassword'], // Path for error message
        });
    }
});

export type UserUpdatePasswordType = z.infer<typeof userUpdatePasswordSchema>;

export const usernameCheckupSchema = z.object({
    q: z
        .string()
        .trim()
        .min(2, "Username must contain at least 2 characters")
        .max(15, "Username must contain less than 15 characters")
        .regex(/^[a-zA-Z0-9]+$/, "Username contains invalid characters.")
});

export type UsernameCheckupType = z.infer<typeof usernameCheckupSchema>;

export const userUpdateUsernameSchema = z.object({
    newUsername: z
        .string()
        .trim()
        .toLowerCase()
        .min(2, "Username must contain at least 2 characters")
        .max(15, "Username must contain less than 15 characters")
        .regex(/^[a-zA-Z0-9]+$/, "Username contains invalid characters.")
});

export type UserUpdateUsernameType = z.infer<typeof userUpdateUsernameSchema>;

export const userUpdateEmailSchema = z.object({
    newEmail: z
        .string()
        .trim()
        .toLowerCase()
        .email(),
});

export type UserUpdateEmailType = z.infer<typeof userUpdateEmailSchema>;

export const userUpdateBirthdaySchema = z.object({
    year: z
        .string()
        .trim()
        .min(4, "Year is required"),
    month: z
        .string()
        .trim()
        .min(1, "Month is required"),
    day: z
        .string()
        .trim()
        .min(1, "Day is required"),
});

export type UserUpdateBirthdayType = z.infer<typeof userUpdateBirthdaySchema>;

export const userUpdateProfileSchema = z.object({
    name: z
        .string()
        .min(1, 'Please enter the name')
        .max(50, "Name can't exceed 50 characters"),
    bio: z
        .string()
        .max(160, "Bio can't exceed 60 characters")
        .optional(),
    location: z
        .string()
        .max(30, "Location can't exceed 30 characters")
        .optional(),
    website: z
        .string()
        .max(100, "Website url can't exceed 30 characters")
        .optional()
        .refine((val) => val === '' || /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/.test(val as string), {
            message: 'Invalid website URL',
        }),
    bannerPicture: z
        .string()
        .optional(),
    profilePicture: z
        .string()
        .optional(),
});

export type UserUpdateProfileType = z.infer<typeof userUpdateProfileSchema>;

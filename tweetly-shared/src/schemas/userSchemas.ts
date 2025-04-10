import { z } from 'zod';
import { getAge } from '../lib/utils';
import { ALLOWED_IMAGE_TYPES } from '../constants';

// UPDATE USER INFO

export const userUpdatePasswordSchema = z.object({
    currentPassword: z
        .string()
        .trim()
        .min(1, "Please enter current password"),
    newPassword: z
        .string()
        .trim()
        .min(8, "New password must contain at least 8 characters"),
    confirmNewPassword: z
        .string()
        .trim(),
}).superRefine((data, ctx) => {
    // Check if currentPassword is the same as newPassword
    if (data.currentPassword === data.newPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "New password can't be the same as the current one",
            path: ['newPassword'], // Path for error message
        });
    }

    // Check if newPassword matches confirmNewPassword
    if (data.newPassword !== data.confirmNewPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Passwords do not match',
            path: ['confirmNewPassword'], // Path for error message
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
        .number()
        .int()
        .gt(new Date().getFullYear() - 100, "User can't be older than 100")
        .lt(new Date().getFullYear() - 12, 'User must be older than 13'),
    month: z
        .number()
        .int()
        .nonnegative("Month can't be negative number")
        .lte(11, "Month does not exist"),
    day: z
        .number()
        .int()
        .nonnegative("Day can't be negative number")
        .lte(11, "Day does not exist"),
}).superRefine((data, ctx) => {
    // Check if DoB is older than 13
    const birthDate = `${data.year}-${String(data.month).padStart(2, '0')}-${String(data.day).padStart(2, '0')}`;
    if (getAge(birthDate) < 13) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'User must be older than 13',
            path: ['year'], // Path for error message
        });
    }
});

export type UserUpdateBirthdayType = z.infer<typeof userUpdateBirthdaySchema>;

export const userUpdateProfileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Please enter the name')
        .max(50, "Name can't exceed 50 characters"),
    bio: z
        .optional(z
            .string()
            .trim()
            .max(160, "Bio can't exceed 60 characters")),
    location: z
        .optional(z
            .string()
            .trim()
            .max(30, "Location can't exceed 30 characters")),
    website: z
        .optional(z
            .string()
            .trim()
            .max(100, "Website url can't exceed 30 characters")
            .refine((val) => val === '' || /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/.test(val as string), {
                message: 'Invalid website URL',
            })),
    bannerPicture: z
        .optional(z.instanceof(File)),
    removeBannerPicture: z
        .boolean().default(false),
    profilePicture: z
        .optional(z.instanceof(File)),
    removeProfilePicture: z
        .boolean().default(false),
}).superRefine((data, ctx) => {
    if (data.bannerPicture) {
        if (!(data.bannerPicture instanceof File)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Input is not a file',
                path: ['image'],
            });
        } else if (data.bannerPicture.size >= 5000000) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Max image size is 5MB',
                path: ['image'],
            });
        } else if (!(ALLOWED_IMAGE_TYPES.includes(data.bannerPicture.type))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'This image format is not supported',
                path: ['image'],
            });
        }
    }

    if (data.profilePicture) {
        if (!(data.profilePicture instanceof File)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Input is not a file',
                path: ['image'],
            });
        } else if (data.profilePicture.size >= 5000000) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Max image size is 5MB',
                path: ['image'],
            });
        } else if (!(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"].includes(data.profilePicture.type))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Only .jpg, .jpeg, .png, .heic and .webp formats are supported',
                path: ['image'],
            });
        }
    }
});

export type UserUpdateProfileType = z.infer<typeof userUpdateProfileSchema>;

export const emailSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email(),
});

export const usernameSchema = z.object({
    username: z
        .string()
        .trim()
        .toLowerCase()
        .nonempty('Please enter username')
        .min(2, 'Username must contain at least 2 characters')
        .max(15, "Username must contain less than 15 characters")
        .regex(/^[a-zA-Z0-9]+$/, "Username contains invalid characters."),
});

export const usernameOrEmailAvailibilitySchema = z.discriminatedUnion('type',
    [
        z.object({
            type: z.literal('email'),
            data: z
                .string()
                .trim()
                .toLowerCase()
                .email(),
        }),
        z.object({
            type: z.literal('username'),
            data: z
                .string()
                .trim()
                .toLowerCase()
                .nonempty('Please enter username')
                .min(2, 'Username must contain at least 2 characters')
                .max(15, "Username must contain less than 15 characters")
                .regex(/^[a-zA-Z0-9]+$/, "Username contains invalid characters."),
        })
    ]
);
// AUTH

import { z } from 'zod';
import { getAge } from '../lib/utils';

export const temporaryUserBasicDataSchema = z.object({
    profileName: z
        .string()
        .trim()
        .toLowerCase()
        .min(2, "Profile name must contain at least 2 characters")
        .max(50, "Profile name must contain less than 15 characters"),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email(),
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

export const temporaryUserPasswordSchema = z.object({
    password: z
        .string()
        .trim()
        .min(8, "Password must contain at least 8 characters"),
    confirmPassword: z
        .string()
        .trim(),
}).superRefine((data, ctx) => {
    // Check if password is same as confirmed password
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Passwords do not match',
            path: ['confirmPassword'],
        });
    }
});

export const temporaryUserUsernameSchema = z.object({
    username: z
        .string()
        .trim()
        .toLowerCase()
        .nonempty('Please enter username')
        .min(2, 'Username must contain at least 2 characters')
        .max(15, "Username must contain less than 15 characters")
        .regex(/^[a-zA-Z0-9]+$/, "Username contains invalid characters."),
});

export const temporaryUserProfilePictureSchema = z.object({
    profilePicture:
        z.optional(z.instanceof(File))
}).superRefine((data, ctx) => {
    if (data.profilePicture) {
        if (!(data.profilePicture instanceof File)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Input is not a file',
                path: ['profilePicture'],
            });
        } else if (data.profilePicture.size >= 5000000) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Max image size is 5MB',
                path: ['profilePicture'],
            });
        } else if (!(["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(data.profilePicture.type))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Only .jpg, .jpeg, .png and .webp formats are supported',
                path: ['profilePicture'],
            });
        }
    }
});

export const registerUserDataSchema = z.object({
    username: z
        .string()
        .trim()
        .toLowerCase()
        .min(2, "Username must contain at least 2 characters")
        .max(15, "Username must contain less than 15 characters")
        .regex(/^[a-zA-Z0-9]+$/, "Username contains invalid characters."),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email(),
    year: z
        .number()
        .int()
        .gt(new Date().getFullYear() - 100, "User can't be older than 100")
        .lt(new Date().getFullYear() - 13, 'User must be older than 13'),
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
    password: z
        .string()
        .trim()
        .min(8, "Password must contain at least 8 characters"),
    confirmPassword: z
        .string()
        .trim(),
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

    // Check if password is same as confirmed password
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Passwords do not match',
            path: ['confirmPassword'],
        });
    }
});

export const logInUserSchema = z.object({
    usernameOrEmail: z
        .string()
        .trim()
        .toLowerCase()
        .nonempty('Please enter username or email address')
        .min(2, 'Username must contain at least 2 characters')
        .regex(
            /^(?:[a-zA-Z0-9]{2,15}|\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)$/,
            "Enter a valid username or email"
        ),
    password: z
        .string()
        .trim()
        .min(1, "Please enter password"),
});

export const userSettingsAccessSchema = z.object({
    password: z
        .string()
        .trim()
        .min(8, "Password must contain at least 8 characters"),
});
import { z } from "zod";
import { getAge } from "./utils";

export const signUpSchema = z.object({
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

    // Check if currentPassword is the same as newPassword
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Passwords do not match',
            path: ['confirmPassword'],
        });
    }
});

export const logInSchema = z.object({
    username: z
        .string()
        .trim()
        .min(1, "Please enter username"),
    password: z
        .string()
        .trim()
        .min(1, "Please enter password"),
});

export const settingsPasswordSchema = z.object({
    password: z
        .string()
        .trim()
        .min(1, "Please enter password"),
})

export const settingsChangePassword = z.object({
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

export const settingsChangeUsername = z.object({
    newUsername: z
        .string()
        .trim()
        .toLowerCase()
        .min(2, "Username must contain at least 2 characters")
        .max(15, "Username must contain less than 15 characters")
        .regex(/^[a-zA-Z0-9]+$/, "Username contains invalid characters.")
});

export const settingsChangeEmail = z.object({
    newEmail: z
        .string()
        .trim()
        .toLowerCase()
        .email(),
});

export const settingsChangeBirthday = z.object({
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

export const newPostSchema = z.object({
    text: z
        .string()
        .trim()
        .max(280, "Post can't exceed 280 characters")
        .optional(),
    images: z
        .array(z.string())
        .optional(),
    imagesPublicIds: z
        .array(z.string())
        .optional(),
    replyToId: z
        .number()
        .optional(),
}).superRefine((data, ctx) => {
    // Check if text is empty
    if (!data.images && data.text?.length === 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please enter the post content",
            path: ['text'], // Path for error message
        });
    }
});

export const updateProfileSchema = z.object({
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

export const searchSchema = z.object({
    q: z
        .string()
        .trim()
        .min(1, "Search query cannot be empty.")
        .max(100, "Search query cannot exceed 100 characters.")
        .regex(/^[a-zA-Z0-9\s\-_'$#@]+$/, "Search query contains invalid characters.")
});

export const searchUsernameSchema = z.object({
    q: z
        .string()
        .trim()
        .min(2, "Username must contain at least 2 characters")
        .max(15, "Username must contain less than 15 characters")
        .regex(/^[a-zA-Z0-9]+$/, "Username contains invalid characters.")
});


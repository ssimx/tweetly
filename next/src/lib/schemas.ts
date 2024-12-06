import { z } from "zod";

export const signUpSchema = z.object({
    username: z
        .string()
        .min(2, "Username must contain at least 2 characters")
        .max(15, "Username must contain less than 15 characters"),
    email: z
        .string()
        .email(),
    year: z
        .string()
        .min(4, "Year is required"),
    month: z
        .string()
        .min(1, "Month is required"),
    day: z
        .string()
        .min(1, "Day is required"),
    password: z
        .string()
        .min(8, "Password must contain at least 8 characters"),
    confirmPassword: z
        .string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export const logInSchema = z.object({
    username: z
        .string()
        .min(1, "Please enter username"),
    password: z
        .string()
        .min(1, "Please enter password"),
});

export const newPostSchema = z.object({
    text: z
        .string()
        .min(1, 'Please enter the post content')
        .max(280, "Post can't exceed 280 characters"),
    replyToId: z
        .number()
        .optional()
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
        .refine((val) => val === '' || /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/.test(val), {
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
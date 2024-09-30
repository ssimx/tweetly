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
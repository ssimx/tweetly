import { z } from "zod";

export const signUpSchema = z.object({
    username: z
        .string()
        .min(2, "Username must contain at least 2 characters")
        .max(15, "Username must contain less than 15 characters"),
    email: z
        .string()
        .email(),
    dateOfBirth: z
        .string()
        .date(),
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
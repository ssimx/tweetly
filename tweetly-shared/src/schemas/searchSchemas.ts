import { z } from 'zod';

export const searchSchema = z.object({
    q: z
        .string()
        .trim()
        .min(1, "Search query cannot be empty.")
        .max(100, "Search query cannot exceed 100 characters.")
        .regex(/^[a-zA-Z0-9\s\-_'$#@]+$/, "Search query contains invalid characters.")
});

export type SearchType = z.infer<typeof searchSchema>;
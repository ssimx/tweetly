import { z } from 'zod';

export const newPostDataSchema = z.object({
    text: z
        .string()
        .trim()
        .max(280, "Post can't exceed 280 characters")
        .optional(),
    images: z
        .instanceof(File).array().optional(),
    replyToId: z
        .string()
        .optional(),
}).superRefine((data, ctx) => {
    // Check if text is empty
    if (data.images?.length === 0 && data.text?.length === 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please enter the post content",
            path: ['text'], // Path for error message
        });
    }
});

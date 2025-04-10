import { z } from 'zod';
import { ALLOWED_IMAGE_TYPES } from '../constants/index.js';

export const newMessageDataSchema = z.object({
    text: z
        .string()
        .trim()
        .max(280, "Post can't exceed 280 characters")
        .optional(),
    images: z
        .instanceof(File).array().optional(),
    conversationId: z
        .string()
        .trim(),
}).superRefine((data, ctx) => {
    // Check if text is empty
    if (data.images?.length === 0 && data.text?.length === 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please enter the post content",
            path: ['text'], // Path for error message
        });
    }

    if (data.images && data.images.length) {
        data.images.forEach((image) => {
            if (!(image instanceof File)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Input is not a file',
                    path: ['image'],
                });
            } else if (image.size >= 5000000) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Max image size is 5MB',
                    path: ['image'],
                });
            } else if (!(ALLOWED_IMAGE_TYPES.includes(image.type))) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'This image format is not supported',
                    path: ['image'],
                });
            }
        })
    }
});
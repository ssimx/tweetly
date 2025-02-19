import { z } from 'zod';
import { newPostDataSchema } from '../schemas/postSchemas';

// Type for new post data
export type NewPostDataType = z.infer<typeof newPostDataSchema>;


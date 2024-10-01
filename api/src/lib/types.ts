import { User } from "@prisma/client";

export interface PassportError extends Error {
    status?: number; // Optional status code for HTTP responses
    message: string; // Message detailing the error
}

export type UserProps = Omit<User, 'password'>; 
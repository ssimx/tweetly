import { User } from "@prisma/client";

export interface PassportError extends Error {
    status?: number; // Optional status code for HTTP responses
    message: string; // Message detailing the error
};

export type UserProps = Omit<User, 'password'>;

export type TemporaryUserTokenType = {
    type: 'temporary',
    id: number;
    email: string;
};

export interface UserTokenProps {
    type: 'user',
    id: number;
    username: string;
    email: string;
};

export interface UserInfo {
    username: string;
    email: string;
    dateOfBirth: Date;
    profile: {
        name: string;
        bio: string;
        location: string;
        websiteUrl: string;
        profilePicture: string;
        bannerPicture: string;
    },
};

export interface ProfileInfo {
    name: string,
    bio: string,
    location: string,
    website: string,
    bannerPicture: string,
    profilePicture: string,
};
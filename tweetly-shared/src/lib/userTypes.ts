import { FormTemporaryUserBasicDataType, FormTemporaryUserPasswordType } from './authTypes';

// Type for logged in user information
export type LoggedInUserDataType = {
    id: number,
    createdAt: Date,
    username: string,
    email: string,
    dateOfBirth: Date,
    following: number,
    followers: number,
    profile: {
        name: string,
        bio: string,
        location: string,
        websiteUrl: string,
        profilePicture: string,
        bannerPicture: string,
    },
};

// Type for temporary user information
export type LoggedInTemporaryUserDataType = {
    id: number,
    createdAt: Date,
    updatedAt: Date,
    profileName: string,
    email: string,
    emailVerified: boolean,
    dateOfBirth: Date,
    password: boolean,
    username: boolean,
    profilePicture: boolean,
    registrationComplete: boolean,
};
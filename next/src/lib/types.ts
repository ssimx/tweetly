export interface JwtPayload {
    id: string,
    email: string,
    username: string,
};

export interface User {
    id: string,
    username: string,
    dateOfBirth: string,
    email: string,
    password: string,
};

export interface Post {
    id: number,
    content: string,
    createdAt: Date,
    updatedAt: Date,
    authorId: number,
    replyToId: number | null,
};

export interface UserInfo {
    id: number,
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
    username: string,
    followers: {
        followeeId: number;
    }[],
    following: {
        followeeId: number;
    }[],
    profile: {
        name: string,
        bio: string,
        profilePicture: string,
    } | null,
    _count: {
        followers: number;
    },
};

export interface PostInfoType {
    id: number,
    content: string,
    createdAt: string,
    updatedAt: string,
    authorId: number,
    replyToId: number | null,
    author: {
        username: string,
        followers: {
            followeeId: number;
        }[],
        following: {
            followeeId: number;
        }[],
        profile: {
            name: string,
            bio: string,
            profilePicture: string,
        } | null,
        _count: {
            followers: number;
        },
    },
    replies: {
        id: number;
    }[],
    reposts: {
        userId: number;
    }[],
    likes: {
        userId: number;
    }[],
    bookmarks: {
        userId: number;
    }[],
};
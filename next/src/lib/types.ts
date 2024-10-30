import { Conversation } from './../../../api/node_modules/.prisma/client/index.d';
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
    _count: {
        notificationsReceived: number,
    }
};

export interface ProfileInfo {
    username: string,
    createdAt: string,
    profile: {
        name: string,
        bio: string,
        location: string,
        websiteUrl: string,
        bannerPicture: string,
        profilePicture: string,
    },
    followers: {
        followerId: number,
    }[] | [],
    following: {
        followeeId: number,
    }[] | [],
    blockedBy: {
        blockerId: number,
    }[] | [],
    blockedUsers: {
        blockedId: number,
    }[] | [],
    notifying: {
        receivedId: number,
    }[] | [],
    conversationsParticipant: {
        conversation: {
            id: string,
        }
    }[] | [],
    _count: {
        followers: number,
        following: number,
        posts: number,
    },
};

export interface PostType {
    id: number,
    content: string,
    createdAt: string,
    updatedAt: string,
    replyToId: number | null,
    author: {
        username: string,
        profile: {
            name: string,
            bio: string,
            profilePicture: string,
        },
        following: {
            followerId: number,
        }[] | [],
        followers: {
            followeeId: number,
        }[] | [],
        _count: {
            followers: number,
            following: number,
        },
    },
    reposts: {
        userId?: number,
    }[],
    likes: {
        userId?: number,
    }[],
    bookmarks: {
        userId?: number,
    }[],
    _count: {
        likes: number,
        reposts: number,
        replies: number,
    }
};

export interface PostInfoType {
    id: number,
    content: string,
    createdAt: string,
    updatedAt: string,
    author: {
        username: string,
        profile: {
            name: string,
            bio: string,
            profilePicture: string,
        },
        posts: {
            id: number,
            content: string,
            createdAt: string,
            updatedAt: string,
            authorId: number,
            replyToId: number | null,
        }[],
        repostedPosts: {
            id: number,
            content: string,
            createdAt: string,
            updatedAt: string,
            authorId: number,
            replyToId: number | null,
        }[],
        followers: {
            username: string,
            profile: {
                name: string,
                bio: string,
                profilePicture: string,
            },
            _count: {
                followers: number,
                following: number,
            }
        }[],
        following: {
            username: string,
            profile: {
                name: string,
                bio: string,
                profilePicture: string,
            },
            _count: {
                followers: number,
                following: number,
            },
        }[],
        _count: {
            followers: number,
            following: number,
            posts: number,
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